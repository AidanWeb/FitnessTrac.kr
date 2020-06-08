const { client } = require('./client');
const { getUserByUsername } = require('./users');

async function getAllRoutines () {
    try {
        const { rows: routines } = await client.query(`
            SELECT * FROM routines;
        `);

        const results = routines.map(async (routine) => {
            const activities = await getActivitiesByRoutine(routine);
            routine.activities = activities;
            return routine;
        });

        const routineObj = await Promise.all(results).then((arr) => {
            console.log(arr);
            return arr;
        });
        return routineObj;
    } catch (e) {
        console.log(`Error getting routines`, e);
        throw e;
    }
}

async function getPublicRoutines () {
    try {
        const { rows: routines } = await client.query(`
            SELECT * FROM routines
            WHERE public='true';
        `);

        const results = routines.map(async (routine) => {
            const activities = await getActivitiesByRoutine(routine);
            routine.activities = activities;
            return routine;
        });

        const routineObj = await Promise.all(results).then((arr) => {
            console.log(arr);
            return arr;
        });
        return routineObj;
    } catch (e) {
        console.log(`Error getting public routines`, e);
        throw e;
    }
}

async function getActivitiesByRoutine (routine) {
    const { id } = routine
    const { rows } = await client.query(`
        SELECT 
        a.id,
        a.name,
        a.description,
        ra."routineId",
        ra.duration,
        ra.count
        FROM activities AS a
        LEFT JOIN routine_activities AS ra
        ON a.id = ra."activityId"
        WHERE ra."routineId" = $1;
    `, [id])
    return rows;
}

async function getRoutinesByUser ({username}) {
    const user = await getUserByUsername({username});

    try {
        const { rows: routines } = await client.query(`
            SELECT * FROM routines
            WHERE "creatorId"=$1;
        `, [user.id]);

        const results = routines.map(async (routine) => {
            const activities = await getActivitiesByRoutine(routine);
            routine.activities = activities;
            return routine;
        });

        const routineObj = await Promise.all(results).then((arr) => {
            console.log(arr);
            return arr;
        });
        return routineObj;
    } catch (e) {
        console.log(`Error getting routines by user`);
        throw e;
    }
}

async function getRoutineById ({id}) {
    try {
        const { rows } = await client.query(`
            SELECT * FROM routines
            WHERE id=$1;
        `, [id]);
        return rows;
    } catch (e) {
        console.log(`Error getting routines by user`, e);
        throw e;
    }
}


async function getPublicRoutinesByUser (username) {
    const user = await getUserByUsername(username);
    console.log("User: ", user)

    try {
        const { rows: routines } = await client.query(`
            SELECT * FROM routines
            WHERE "creatorId"=$1
            AND public='true';
        `, [user.id]);

        const results = routines.map(async (routine) => {
            const activities = await getActivitiesByRoutine(routine);
            routine.activities = activities;
            return routine;
        });

        const routineObj = await Promise.all(results).then((arr) => {
            console.log(arr);
            return arr;
        });
        return routineObj;
    } catch (e) {
        console.log(`Error getting public routines by user`);
        throw e;
    }
}

async function getPublicRoutinesByActivity ({ activityId }) {

    try {
        const { rows: routines } = await client.query(`
            SELECT
            r.id,
            r."creatorId",
            r.public,
            r.name,
            r.goal,
            ra."activityId"
            FROM routines AS r
            JOIN routine_activities AS ra
            ON r.id = ra."routineId"
            WHERE "activityId"=$1
            AND public='true';
        `, [activityId]);

        const results = routines.map(async (routine) => {
            const activities = await getActivitiesByRoutine(routine);
            routine.activities = activities;
            return routine;
        });

        const routineObj = await Promise.all(results).then((arr) => {
            console.log(arr);
            return arr;
        });
        return routineObj;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

async function createRoutine ({ creatorId, public, name, goal }) {
    try {
        const { rows } = await client.query(`
            INSERT INTO routines ("creatorId", public, name, goal)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `, [creatorId, public, name, goal]);

        return rows;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

async function updateRoutine ({ id, public, name, goal }) {
    const pubStr = public ? `public=${public}` : "";
    const nameStr = name ? `name=${name}` : "";
    const goalStr = goal ? `goal=${goal}` : "";
    const setArr = [pubStr, nameStr, goalStr];
    const setStr = setArr.join(', ')

    console.log("setStr: ", setStr)

    try {
        const { rows } = await client.query(`
            UPDATE routines
            SET $1
            WHERE id=$2
            RETURNING *;
        `, [setStr, id]);

        return rows;
    } catch (e) {
        console.log(`Error creating routine`, e);
        throw e;
    }
}

async function destroyRoutine (id) {
    try {
        await client.query(`
            DELETE FROM routines
            WHERE id=$1;
        `, [id])
    } catch (e) {
        console.log(`Error deleting routine`, e);
        throw e;
    }
}

module.exports = {
    getAllRoutines,
    getRoutinesByUser,
    getRoutineById,
    getPublicRoutines,
    getPublicRoutinesByActivity,
    getPublicRoutinesByUser,
    createRoutine,
    updateRoutine,
    destroyRoutine
}