const { client } = require('./client');

async function getAllActivities () {
    try {
        const { rows } = await client.query(`
            SELECT * FROM activities;
        `);

        return rows;
    } catch (e) {
        console.log(`> Could not get activities from db`)
        throw e;
    }
}

async function createActivity ({name, description}) {
    try {
        const { rows } = await client.query(`
            INSERT INTO activities (name, description)
            VALUES ($1, $2)
            RETURNING *;
        `, [name, description]);

        return rows;
    } catch (e) {
        console.log(`> Could not create new activity`)
        throw e;
    }
}

async function updateActivity ({activityId, name, description}) {
    try {
        const {rows} = await client.query(`
            UPDATE activities
            SET name=$1, description=$2
            WHERE id=$3
            RETURNING *;
        `, [name, description, activityId]);
        console.log('rows: ', rows);
        return rows;
    } catch (e) {
        console.log(`Error updating activity with the id ${activityId}`)
        throw (e)
    }
}

module.exports = {
    createActivity,
    updateActivity,
    getAllActivities,
}