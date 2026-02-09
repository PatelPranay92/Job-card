const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Jobcard = require('./models/Jobcard');

dotenv.config();

async function testDateTime() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB\n');

        // Test 1: Check existing jobcards
        console.log('=== TEST 1: Checking Existing Jobcards ===');
        const jobcards = await Jobcard.find().sort({ date: -1 }).limit(5);

        if (jobcards.length === 0) {
            console.log('No jobcards found in database');
        } else {
            console.log(`Found ${jobcards.length} recent jobcards:\n`);
            jobcards.forEach(jc => {
                console.log(`Jobcard: ${jc.jobcard_no}`);
                console.log(`  Date (stored): ${jc.date}`);
                console.log(`  Date (ISO): ${jc.date.toISOString()}`);
                console.log(`  Date (Local): ${jc.date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
                console.log(`  Date (Date only): ${jc.date.toLocaleDateString('en-IN')}`);
                console.log(`  Created At: ${jc.createdAt}`);
                console.log('');
            });
        }

        // Test 2: Create a test jobcard with current date/time
        console.log('\n=== TEST 2: Creating Test Jobcard ===');
        const now = new Date();
        console.log(`Current time: ${now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);

        const testJobcard = new Jobcard({
            customer_name: 'TEST CUSTOMER',
            reg_no: 'TEST123',
            date: now,
            amount: 1000,
            paid: 0,
            remaining: 1000,
            status: 'Unpaid'
        });

        await testJobcard.save();
        console.log(`\n✓ Created test jobcard: ${testJobcard.jobcard_no}`);
        console.log(`  Date saved: ${testJobcard.date}`);
        console.log(`  Date (Local): ${testJobcard.date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);

        // Test 3: Query by date range (today)
        console.log('\n=== TEST 3: Query Today\'s Jobcards ===');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        console.log(`Searching from: ${today.toLocaleString('en-IN')}`);
        console.log(`          to: ${tomorrow.toLocaleString('en-IN')}`);

        const todayJobcards = await Jobcard.find({
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        console.log(`\nFound ${todayJobcards.length} jobcard(s) for today`);
        todayJobcards.forEach(jc => {
            console.log(`  - ${jc.jobcard_no}: ${jc.date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
        });

        // Clean up test jobcard
        await Jobcard.deleteOne({ _id: testJobcard._id });
        console.log(`\n✓ Cleaned up test jobcard`);

        console.log('\n✅ All date/time tests completed successfully!');
        await mongoose.connection.close();
        process.exit(0);

    } catch (err) {
        console.error('❌ Test failed:', err);
        process.exit(1);
    }
}

testDateTime();
