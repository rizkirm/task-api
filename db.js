const Pool = require("pg").Pool;

const pool = new Pool({
    user: "postgres",
    password: "metaglobal",
    host: "localhost",
    port: 5432,
    database: "db_monitoring_task"
});

module.exports = pool;