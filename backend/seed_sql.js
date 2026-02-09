const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Jobcard = require('./models/Jobcard');
const VehicleModel = require('./models/VehicleModel');
const Counter = require('./models/Counter');

// Load env vars
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const parseSQLValues = (sql, tableName) => {
    const regex = new RegExp(`INSERT INTO \`${tableName}\` .*? VALUES\\s*([\\s\\S]*?);`);
    const match = sql.match(regex);
    if (!match) return [];

    let valuesStr = match[1];
    // Simple split for this specific SQL dump format
    // It assumes values are like (1, ...), (2, ...)
    // We remove the leading ( and trailing ) and update delimiters

    // Split by "),\n(" or "), (" might be tricky if text contains it. 
    // Given the dump format: (1, 'val'),\n(2, 'val')
    const rows = valuesStr.split(/\),\s*\(/);

    return rows.map(row => {
        // Clean start/end parenthesis if they exist (first and last row)
        let cleanRow = row.replace(/^\(/, '').replace(/\)$/, '');

        // Split by comma, respecting quotes
        // This is a simple parser, might be fragile for complex text with commas
        // But the dump seems generic.
        // Better approach: use a regex to match values
        const values = [];
        let current = '';
        let inQuote = false;
        for (let i = 0; i < cleanRow.length; i++) {
            const char = cleanRow[i];
            if (char === "'" && cleanRow[i - 1] !== '\\') {
                inQuote = !inQuote;
                // Don't include quotes in value
            } else if (char === ',' && !inQuote) {
                values.push(current.trim());
                current = '';
            } else {
                // remove quotes from string
                if (char !== "'") current += char;
            }
        }
        values.push(current.trim());

        return values.map(v => {
            if (v === 'NULL') return null;
            // numeric check? string check?
            return v;
        });
    });
};

const importData = async () => {
    await connectDB();

    try {
        // Clear existing data? User said "change in database", probably implies Reset or Add. 
        // Safer to clear to avoid dups if run multiple times, but let's be careful.
        // Let's clear for a clean import based on the request "using gen database" (seed).
        await Jobcard.deleteMany({});
        await VehicleModel.deleteMany({});
        await Counter.deleteMany({}); // Reset counter
        console.log('Cleared existing data...');

        const sqlContent = fs.readFileSync(path.join(__dirname, '../bike_details.sql'), 'utf8');

        // 1. Vehicle Models
        // Schema: (model_id, model_name, description)
        const modelRows = parseSQLValues(sqlContent, 'vehicle_models');
        const modelMap = {}; // ID -> Name

        for (const row of modelRows) {
            const id = row[0];
            const name = row[1];
            modelMap[id] = name;

            // Guess type
            let type = 'Bike';
            const upperName = name.toUpperCase();
            if (upperName.includes('ACTIVA') || upperName.includes('JUPITER') || upperName.includes('ACCESS')) type = 'Scooter';
            if (upperName.includes('XL')) type = 'Bike'; // Moped

            await VehicleModel.create({ name: name.toUpperCase(), type });
        }
        console.log(`Imported ${modelRows.length} models.`);

        // 2. Customers
        // Schema: (customer_id, customer_name, phone, address, city)
        const customerRows = parseSQLValues(sqlContent, 'customers');
        const customerMap = {}; // ID -> { name, phone, address, city }
        for (const row of customerRows) {
            customerMap[row[0]] = {
                name: row[1],
                phone: row[2],
                address: row[3],
                city: row[4]
            };
        }

        // 3. Sub-tables (Services, Parts, Labour)
        // Services Schema: (service_id, jobcard_id, service_name, amount)
        const serviceRows = parseSQLValues(sqlContent, 'services');
        const servicesByJc = {};
        for (const row of serviceRows) {
            const jcId = row[1];
            if (!servicesByJc[jcId]) servicesByJc[jcId] = [];
            servicesByJc[jcId].push({ name: row[2].toUpperCase(), amount: parseFloat(row[3]) || 0 });
        }

        // Parts Schema: (part_id, jobcard_id, part_name, amount)
        const partRows = parseSQLValues(sqlContent, 'parts');
        const partsByJc = {};
        for (const row of partRows) {
            const jcId = row[1];
            if (!partsByJc[jcId]) partsByJc[jcId] = [];
            partsByJc[jcId].push({ name: row[2].toUpperCase(), amount: parseFloat(row[3]) || 0 });
        }

        // Labour Schema: (labour_id, jobcard_id, labour_name, amount)
        const labourRows = parseSQLValues(sqlContent, 'labour');
        const labourByJc = {};
        for (const row of labourRows) {
            const jcId = row[1];
            if (!labourByJc[jcId]) labourByJc[jcId] = [];
            labourByJc[jcId].push({ name: row[2].toUpperCase(), amount: parseFloat(row[3]) || 0 });
        }

        // 4. Jobcards
        // Schema: (jobcard_id, jobcard_no, jobcard_date, customer_id, model_id, reg_no, chassis_no, engine_no, km, petrol, key_no, mechanic_name, helper_name, vehicle_type, remarks, service_total, parts_total, labour_total, grand_total, payment_status, created_at, payment_mode, payment_date, paid_amount, remaining_amount)
        const jcRows = parseSQLValues(sqlContent, 'jobcards');

        let importedCount = 0;
        for (const row of jcRows) {
            const jcId = row[0]; // Original ID
            // row[1] is jobcard_no, often NULL or '01'. We'll let Mongoose generate a new standardized JC-XXXXX or use '01' if present but format it? 
            // The user probably wants clean IDs. Let's let the pre-save hook handle it by NOT setting jobcard_no unless it's a specific format we want to keep.
            // Actually, to preserve history, if it's '01', we might want to keep it? MongoDB pre-save hook generates it if NOT present.
            // Let's rely on the pre-save hook (auto-increment) to give fresh meaningful IDs (JC-00001) for this import.

            const customer = customerMap[row[3]];
            const modelName = modelMap[row[4]] || 'UNKNOWN';

            if (!customer) {
                console.warn(`Skipping Jobcard ${jcId}: Customer ${row[3]} not found`);
                continue;
            }

            const newJc = new Jobcard({
                date: row[2] ? new Date(row[2]) : new Date(),
                customer_name: (customer.name || 'UNKNOWN').toUpperCase(),
                phone: customer.phone,
                address: (customer.address || '').toUpperCase(),
                city: (customer.city || '').toUpperCase(),
                reg_no: (row[5] || 'PENDING').toUpperCase(),
                model_name: (modelName || 'UNKNOWN').toUpperCase(),
                chassis_no: (row[6] || '').toUpperCase(),
                engine_no: (row[7] || '').toUpperCase(),
                km: row[8],
                petrol: row[9],
                key_no: row[10],
                mechanic_name: row[11],
                helper_name: row[12],
                vehicle_type: row[13] || 'Bike',
                remarks: row[14],

                // Embedded arrays
                services: servicesByJc[jcId] || [],
                parts: partsByJc[jcId] || [],
                labour: labourByJc[jcId] || [],

                amount: parseFloat(row[18]) || 0, // grand_total
                paid: parseFloat(row[23]) || 0, // paid_amount
                remaining: parseFloat(row[24]) || 0, // remaining_amount
                status: row[19] || 'Unpaid' // payment_status
            });

            try {
                await newJc.save();
                importedCount++;
            } catch (saveErr) {
                console.error(`Failed to save Jobcard ${jcId}:`, saveErr.message);
                if (saveErr.name === 'ValidationError') {
                    for (let field in saveErr.errors) {
                        console.error(`  Field ${field}: ${saveErr.errors[field].message}`);
                    }
                }
                console.error('Row Data:', row);
                // Continue or break? Let's continue to see all errors
            }
        }

        console.log(`Imported ${importedCount} jobcards.`);
        console.log('Migration Completed Successfully.');
        process.exit(0);

    } catch (err) {
        console.error('Migration Failed:', err);
        process.exit(1);
    }
};

importData();
