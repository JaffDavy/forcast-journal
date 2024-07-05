import pg from "pg";
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOSTNAME,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect()
  .then(() => {
    console.log("Connected to the database on port 5432");

    const checkingTheTableQuery = `
      SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'entries'
      )`;

    const createTableQuery = `
      CREATE TABLE entries (
      id SERIAL PRIMARY KEY,
      date DATE,
      description VARCHAR(200),
      weather TEXT,
      temperature FLOAT
      )`;

    pool.query(checkingTheTableQuery)
      .then(result => {
        if (!result.rows[0].exists) {
          return pool.query(createTableQuery);
        }
      })
      .then(() => {
        // console.log("Table 'entries' is checked and created if it did not exist.");
      })
      .catch(err => {
        console.error('Error executing query', err);
      });
  })
  .catch((err) => console.error('Error connecting to the database', err));

export default pool;

