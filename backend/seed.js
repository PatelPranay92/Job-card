const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const VehicleModel = require('./models/VehicleModel');
const Jobcard = require('./models/Jobcard');
const Counter = require('./models/Counter');

// Sample data from SQL
const vehicleModels = [
    'CT100', 'SPLENDOR', 'SPLENDOR PLUS', 'HF DELUX', 'PASSION',
    'PASSION PRO', 'PASSION PLUS', 'ACTIVA 6G', 'ACTIVA', 'DISCOVER',
    'TVS XL 100', 'TVS REDION', 'TVS JUPITER'
];

const sampleJobcards = [
    {
        customer_name: 'UMANG PATEL',
        phone: '9568741235',
        address: 'PALAJ GANDHINAGAR',
        city: 'PALAJ',
        reg_no: 'GJ09DL4914',
        model_name: 'CT100',
        km: '5200',
        services: [{ name: 'OIL', amount: 520 }, { name: 'LINER', amount: 200 }],
        parts: [{ name: 'FRONT FIBER', amount: 2500 }],
        labour: [{ name: 'SERVICE', amount: 200 }],
        amount: 3420,
        paid: 3420,
        remaining: 0,
        status: 'Paid'
    },
    {
        customer_name: 'VIKRAMSINH MAKVANA',
        phone: '9316461936',
        city: 'VADVASA',
        reg_no: 'GJ 18 AQ 8045',
        model_name: 'DISCOVER',
        parts: [
            { name: 'OIL', amount: 350 },
            { name: 'ADMISSION LOCK', amount: 400 }
        ],
        labour: [{ name: 'SERVICE', amount: 200 }],
        amount: 950,
        paid: 950,
        remaining: 0,
        status: 'Paid'
    },
    {
        customer_name: 'AMRAT SINH ZALA',
        phone: '9904312242',
        city: 'PUNADRA',
        reg_no: 'GJ 09 DL 0025',
        model_name: 'SPLENDOR PLUS',
        parts: [
            { name: 'CLUTCH PLATE', amount: 250 },
            { name: 'TIMING CHAIN KIT', amount: 640 }
        ],
        labour: [{ name: 'SERVICE', amount: 300 }],
        amount: 1190,
        paid: 1190,
        remaining: 0,
        status: 'Paid'
    }
];

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB');

        // Clear existing data
        console.log('\nClearing existing data...');
        await Promise.all([
            Jobcard.deleteMany({}),
            VehicleModel.deleteMany({}),
            Counter.deleteMany({})
        ]);
        console.log('✓ Cleared all collections');

        // Import Vehicle Models
        console.log('\nImporting vehicle models...');
        for (const modelName of vehicleModels) {
            const type = (modelName.includes('ACTIVA') || modelName.includes('JUPITER') || modelName.includes('REDION'))
                ? 'Scooter' : 'Bike';
            await VehicleModel.create({ name: modelName, type });
        }
        console.log(`✓ Imported ${vehicleModels.length} vehicle models`);

        // Import Sample Jobcards
        console.log('\nImporting jobcards...');
        let count = 0;
        for (const jcData of sampleJobcards) {
            try {
                const jobcard = await Jobcard.create(jcData);
                console.log(`  ✓ ${jobcard.jobcard_no}: ${jcData.customer_name} - ${jcData.reg_no}`);
                count++;
            } catch (err) {
                console.error(`  ✗ Failed: ${jcData.customer_name}`);
                console.error(`     ${err.message}`);
            }
        }
        console.log(`✓ Imported ${count}/${sampleJobcards.length} jobcards`);

        console.log('\n✅ Migration completed successfully!');
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Migration failed:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
}

// Add timeout
setTimeout(() => {
    console.error('\n❌ Migration timed out after 30 seconds');
    process.exit(1);
}, 30000);

migrate();
