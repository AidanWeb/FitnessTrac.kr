const { createUser } = require('./users');
const { createActivity } = require('./activities')
const { createRoutine } = require('./routines')
const { addActivityToRoutine } = require('./routine_activities')
const { client } = require('./client')
client.connect();

async function dropTables () {
    try {
        await client.query(`
        DROP TABLE IF EXISTS routine_activities;
        DROP TABLE IF EXISTS routines;
        DROP TABLE IF EXISTS activities;
        DROP TABLE IF EXISTS users;
        `)
        console.log(`> all tables dropped`)
    } catch (e) {
        throw e;
    }
}

async function createTables () {
    try {
        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            );
        `);
        console.log('> users table created');

        await client.query(`
            CREATE TABLE activities (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                description TEXT NOT NULL
            );
        `)
        console.log(`> activities table created`);

        await client.query(`
            CREATE TABLE routines (
                id SERIAL PRIMARY KEY,
                "creatorId" INTEGER REFERENCES users(id),
                public BOOLEAN DEFAULT false,
                name VARCHAR(255) UNIQUE NOT NULL,
                goal TEXT NOT NULL
            );
        `);
        console.log(`> routines table created`);

        await client.query(`
            CREATE TABLE routine_activities (
                id SERIAL PRIMARY KEY,
                "routineId" INTEGER REFERENCES routines(id) ON DELETE CASCADE,
                "activityId" INTEGER REFERENCES activities(id),
                duration INTEGER,
                count INTEGER,
                UNIQUE ("routineId", "activityId")
            );
        `);
        console.log(`> routine_activities table created`);
    } catch (e) {
        throw e;
    }
}

//  POPULATE TEST DATA:
async function createInitialData () {
    try {
        await createUser({username: "adubs", password: "password1"})
        await createUser({username: 'bdubs', password: 'likeAdubsButBdubs'})
        console.log(`Initial Users Created`)
        await createActivity ({name: "Push-Ups", description: "Good for the shoulders, triceps, core, and chest."})
        await createActivity ({name: "Running", description: "It's like walking but really fast"})
        await createActivity ({name: "Pull-ups", description: "Hang from bar. Pull bodyweight up until chin reaches bar. Repeat"})
        console.log(`Activities created successfully`)
        await createRoutine({
            creatorId: 1,
            public: true,
            name: 'Marathon training',
            goal: 'From couch potato to marathonner in 6 months.'
        })
        await createRoutine({
            creatorId: 2,
            public: true,
            name: 'American Ninja Warrior Training',
            goal: 'Barrier to entry: low. You can pretty much be a dentist from Arizona that watches parkour videos for fun.'
        })
        console.log(`Created routines!`)
        await addActivityToRoutine ({ routineId: 2, activityId: 3, duration: null, count: 25 })
        await addActivityToRoutine ({ routineId: 2, activityId: 1, duration: null, count: 25 })
        await addActivityToRoutine ({ routineId: 1, activityId: 2, duration: 45, count: 1 })
        console.log(`Added activities to routine`);
    } catch (e) {
        throw (e)
    }
}

async function seed () {
    try {
        await dropTables();
        await createTables();
        await createInitialData();
    } catch (e) {
        console.error(e)
    }
}

seed()
    .catch(console.error)
    .finally( ()=> client.end() );

module.exports = {

}