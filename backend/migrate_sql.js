const mongoose = require('mongoose');
const dotenv = require('dotenv');
const VehicleModel = require('./models/VehicleModel');
const Jobcard = require('./models/Jobcard');
const Counter = require('./models/Counter');

dotenv.config();

// Hardcoded data from bike_details.sql
const vehicleModels = [
    { name: 'CT100', type: 'Bike' },
    { name: 'TVS', type: 'Bike' },
    { name: 'SPLENDOR', type: 'Bike' },
    { name: 'SPLENDOR PLUS', type: 'Bike' },
    { name: 'HF DELUX', type: 'Bike' },
    { name: 'PASSION', type: 'Bike' },
    { name: 'PASSION PRO', type: 'Bike' },
    { name: 'PASSION PLUS', type: 'Bike' },
    { name: 'ACTIVA 6G', type: 'Scooter' },
    { name: 'ACTIVA', type: 'Scooter' },
    { name: 'DISCOVER', type: 'Bike' },
    { name: 'TVS XL 100', type: 'Bike' },
    { name: 'TVS REDION', type: 'Scooter' },
    { name: 'TVS JUPITER', type: 'Scooter' }
];

const jobcardsData = [
    {
        date: '2025-12-21',
        customer_name: 'MAHESHBHAI',
        phone: '84522664152',
        address: 'DDFKJJFGGSDSKVJDB',
        city: 'PALAJ',
        reg_no: 'GJ',
        model_name: 'CT100',
        services: [],
        parts: [],
        labour: [],
        amount: 0,
        paid: 0,
        remaining: 0,
        status: 'Unpaid'
    },
    {
        date: '2025-12-21',
        customer_name: 'UMANG PATEL',
        phone: '9568741235',
        address: 'PALAJ GANDHINAGAR',
        city: 'PALAJ',
        reg_no: 'GJ09DL4914',
        model_name: 'CT100',
        km: '5200',
        services: [
            { name: 'OIL', amount: 520 },
            { name: 'LINER', amount: 200 }
        ],
        parts: [
            { name: 'FRONT FIBER', amount: 2500 }
        ],
        labour: [
            { name: 'SERVICE', amount: 200 }
        ],
        amount: 3420,
        paid: 3420,
        remaining: 0,
        status: 'Paid'
    },
    {
        date: '2025-12-23',
        customer_name: 'JALA KHOLASHAI',
        phone: '',
        city: 'KAROL',
        reg_no: 'GJ 09 AR 2403',
        model_name: 'PASSION PLUS',
        parts: [
            { name: 'CHAIN KIT', amount: 600 }
        ],
        labour: [
            { name: 'CHAIN KIT LABOUR', amount: 150 }
        ],
        amount: 750,
        paid: 750,
        remaining: 0,
        status: 'Paid'
    },
    {
        date: '2025-12-23',
        customer_name: 'PATEL RONAKBHAI',
        phone: '',
        city: 'TAJPUR KUI',
        reg_no: 'GJ 09 DJ 7754',
        model_name: 'ACTIVA 6G',
        parts: [
            { name: 'KILOMETER CABLE', amount: 150 }
        ],
        labour: [
            { name: 'KILOMETER CABLE LABOUR', amount: 150 }
        ],
        amount: 300,
        paid: 300,
        remaining: 0,
        status: 'Paid'
    },
    {
        date: '2025-12-25',
        customer_name: 'VIKRAMSINH DHULSINH MAKVANA',
        phone: '9316461936',
        city: 'VADVASA',
        reg_no: 'GJ 18 AQ 8045',
        model_name: 'DISCOVER',
        parts: [
            { name: 'OIL', amount: 350 },
            { name: 'ADMISSION LOCK', amount: 400 },
            { name: 'PETROL COCK', amount: 200 },
            { name: 'PETROL PIPE', amount: 20 },
            { name: 'VISOR, CLAMP, NUT', amount: 750 }
        ],
        labour: [
            { name: 'SERVICE', amount: 200 },
            { name: 'LABOUR', amount: 150 }
        ],
        amount: 2070,
        paid: 2070,
        remaining: 0,
        status: 'Paid'
    },
    {
        date: '2025-12-26',
        customer_name: 'AMRAT SINH KOYSINH ZALA',
        phone: '9904312242',
        city: 'PUNADRA',
        reg_no: 'GJ 09 DL 0025',
        model_name: 'SPLENDOR PLUS',
        parts: [
            { name: 'CLUTCH PLATE MK', amount: 250 },
            { name: 'CLUTCH PACKING', amount: 35 },
            { name: 'TIMING CHAIN KIT', amount: 640 },
            { name: 'KICK SEAL', amount: 13 },
            { name: 'MAIN STAND', amount: 350 },
            { name: 'FB CABLE / CLUTCH CABLE', amount: 200 },
            { name: 'OIL BOSCH 900 ML', amount: 300 },
            { name: 'VISOR SET', amount: 250 }
        ],
        labour: [
            { name: 'SERVICE', amount: 300 },
            { name: 'CLUTCH LABOUR', amount: 400 },
            { name: 'MAGNET LABOUR /MAIN STAND', amount: 400 }
        ],
        amount: 3138,
        paid: 3138,
        remaining: 0,
        status: 'Paid'
    },
    {
        date: '2025-12-26',
        customer_name: 'SHAILESHABHAI PREAMBHAI PATEL',
        phone: '7016061701',
        city: 'TAJPUR KUI',
        reg_no: 'GJ 09 DK 5562',
        model_name: 'TVS JUPITER',
        parts: [
            { name: 'OIL', amount: 400 },
            { name: 'GEAR OIL', amount: 80 },
            { name: 'BRAKE LINER', amount: 150 }
        ],
        labour: [
            { name: 'SERVICE', amount: 300 }
        ],
        amount: 930,
        paid: 1860,
        remaining: -930,
        status: 'Paid'
    },
    {
        date: '2025-12-26',
        customer_name: 'DHANSHUKHABHAI K PATEL',
        phone: '9898130225',
        city: 'TAJPUR KUI',
        reg_no: 'GJ 09 DH 9685',
        model_name: 'TVS REDION',
        parts: [
            { name: 'CHAIN KIT', amount: 750 },
            { name: 'LINER', amount: 100 },
            { name: '6004 FAG BEARING', amount: 120 },
            { name: 'OIL TAKE OFF 900L', amount: 330 }
        ],
        labour: [
            { name: 'SERVICE', amount: 200 },
            { name: 'CHAIN KIT LABOUR', amount: 100 }
        ],
        amount: 1600,
        paid: 1600,
        remaining: 0,
        status: 'Paid'
    },
    {
        date: '2025-12-27',
        customer_name: 'NAJIRBHAI N KHATKI',
        phone: '9712766255',
        city: 'SHADRA',
        reg_no: 'GJ 18 DK 7863',
        model_name: 'ACTIVA 6G',
        parts: [
            { name: 'AIR FILTER', amount: 200 },
            { name: 'AMARON BATTERY 4LD', amount: 1100 },
            { name: 'GEAR OIL', amount: 80 }
        ],
        labour: [
            { name: 'AIR FILTER LABOUR', amount: 150 },
            { name: 'OLD BATTERY', amount: -100 }
        ],
        amount: 1430,
        paid: 1430,
        remaining: 0,
        status: 'Paid'
    },
    {
        date: '2025-12-27',
        customer_name: 'NARSHIH',
        phone: '9913815761',
        reg_no: 'GJ 01 JL 4938',
        model_name: 'PASSION PLUS',
        parts: [
            { name: 'TOPO', amount: 350 },
            { name: 'HORN', amount: 150 }
        ],
        labour: [
            { name: 'TOPO LABOUR', amount: 100 }
        ],
        amount: 600,
        paid: 600,
        remaining: 0,
        status: 'Paid'
    },
    {
        date: '2025-12-27',
        customer_name: 'SHATISHABHAI P PATEL',
        phone: '',
        city: 'MAJRA',
        reg_no: 'GJ 09 AR 110',
        model_name: 'HF DELUX',
        parts: [
            { name: 'OIL TAKE OFF', amount: 400 },
            { name: 'CHAIN KIT', amount: 600 },
            { name: 'LEFT SIDE SWITCH', amount: 365 },
            { name: 'PLUG', amount: 100 },
            { name: 'XL NANI', amount: 50 },
            { name: 'BUSH', amount: 65 },
            { name: '6003 BEARING', amount: 100 },
            { name: 'KICK SEAL 2 PCS', amount: 70 }
        ],
        labour: [
            { name: 'SERVICE', amount: 300 },
            { name: 'CHAIN KIT LABOUR', amount: 150 }
        ],
        amount: 2200,
        paid: 2200,
        remaining: 0,
        status: 'Paid'
    }
];

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ MongoDB Connected');

        // Clear existing data
        await Jobcard.deleteMany({});
        await VehicleModel.deleteMany({});
        await Counter.deleteMany({});
        console.log('✓ Cleared existing data');

        // Import Vehicle Models
        for (const model of vehicleModels) {
            await VehicleModel.create(model);
        }
        console.log(`✓ Imported ${vehicleModels.length} vehicle models`);

        // Import Jobcards
        let imported = 0;
        for (const jcData of jobcardsData) {
            try {
                const jobcard = new Jobcard(jcData);
                await jobcard.save();
                imported++;
                console.log(`  ✓ Imported: ${jcData.customer_name} - ${jcData.reg_no}`);
            } catch (err) {
                console.error(`  ✗ Failed: ${jcData.customer_name} - ${jcData.reg_no}`);
                console.error(`    Error: ${err.message}`);
                if (err.errors) {
                    Object.keys(err.errors).forEach(key => {
                        console.error(`    Field '${key}': ${err.errors[key].message}`);
                    });
                }
            }
        }
        console.log(`✓ Imported ${imported}/${jobcardsData.length} jobcards`);

        console.log('\n✓ Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('✗ Migration failed:', err);
        process.exit(1);
    }
};

migrate();
