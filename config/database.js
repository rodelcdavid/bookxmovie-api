const { Pool } = require("pg");

let pool;
if (process.env.NODE_ENV === "development") {
  pool = new Pool({
    user: "postgres",
    host: "localhost",
    port: "5432",
    password: "admin",
    database: "bookxmovie",
  });
}
if (process.env.NODE_ENV === "production") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

module.exports = pool;
