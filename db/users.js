const { client } = require('./client');
const bcrypt = require('bcrypt');
const { SALT_COUNT } = process.env;

async function hashStr(str) {
    const hash = await bcrypt.hash(str, 10);
    return hash;
}


async function createUser ({username, password}){
    try {
        const {rows} = await client.query(`
            INSERT INTO users (username, password)
            VALUES ($1, $2)
            RETURNING *;
        `, [username, await hashStr(password)]);
        return rows;
    } catch (e) {
        console.log(`Failed to create user`)
        throw e;
    }
}

async function getUser ({ username, password }) {
    try {
        const user = await getUserByUsername(username);
        const authenticated = await bcrypt.compare(password, user.password)
        if (!authenticated) {
            throw new Error('invalid password');
        }
        return user;
    } catch (e) {
        console.log(`Could not authenticate user`)
    }    
}

async function getAllUsers () {
    try {
        const { rows } = await client.query(`
            SELECT * FROM users;
        `);
        return rows;
    } catch (e) {
        console.log(`Could not get users`)
    }    
}

async function getUserByUsername (username) {
    try {
        const { rows: [user] } = await client.query(`
            SELECT * FROM users
            WHERE username=$1;
        `, [username]);

        return user;
    } catch (e) {
        console.log(`> failed to get user with username ${username}`)
        throw e;
    }
}

async function getUserById(id) {
    try {
        const { rows: [user] } = await client.query(`
            SELECT * FROM users
            WHERE id=$1;
        `, [id]);

        return user;
    } catch (e) {
        console.log(`> failed to get user with id ${id}`)
        throw e;
    }
}

async function getUserByRoutineActivityId (id) {
    try {
        const { rows } = await client.query(`
            SELECT
            u.id,
            u.username,
            ra.id
            FROM users AS u
            JOIN routines AS r
            ON u.id = r."creatorId"
            JOIN routine_activities AS ra
            ON r.id = ra."routineId"
            WHERE ra.id=$1;
        `, [id]);
        return rows;
    } catch (e) {
        console.log(`> failed to get user with by R_A ID`)
        throw e;
    }    
}

module.exports = {
    hashStr,
    createUser,
    getAllUsers,
    getUser,
    getUserByUsername,
    getUserById,
    getUserByRoutineActivityId
}