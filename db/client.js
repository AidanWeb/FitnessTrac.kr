const { Client } = require('pg');

const client = new Client('postgres:siihplmlprvmsp:2b63119db0b6603fa1f4c76aa77b12b08df1e960f9bbb54df31b234d314139f4@ec2-34-200-101-236.compute-1.amazonaws.com:5432/drjic31h4ia1s' || 'postgres://localhost:5432/fitness-dev');

module.exports = {
    client,
}