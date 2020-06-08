const { client } = require('./client');

async function addActivityToRoutine ({ routineId, activityId, duration, count }) {
    try {
        const { rows } = await client.query(`
            INSERT INTO routine_activities ("routineId", "activityId", duration, count)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `, [routineId, activityId, duration, count]);

        return rows;
    } catch (e) {
        console.log(`Error creating routineActivity`);
        throw e;
    }
}

async function updateRoutineActivity ({ id, count, duration }) {
    const countStr = count ? `count=${count}` : "";
    const durStr = duration ? `duration=${duration}` : "";
    const setArr = [countStr, durStr];
    const setStr = setArr.join(', ')

    console.log("setStr: ", setStr)

    try {
        const { rows } = await client.query(`
            UPDATE routine_activities
            SET ${setStr}
            WHERE id=${id}
            RETURNING *;
        `)
        console.log(rows);
        return rows;
    } catch (e) {
        console.log(`Error updating routine with Id ${id}`)
        throw e;
    }
}

async function destroyRoutineActivity (id) {
    try {
        await client.query(`
            DELETE FROM routine_activities
            WHERE id=$1;
        `, [id]);
        console.log(`routineActivity deleted!`);
    } catch (e) {
        console.log(`Error deleting routine with Id ${id}`)
        throw e;
    }
}

module.exports = {
    addActivityToRoutine,
    updateRoutineActivity,
    destroyRoutineActivity,
}