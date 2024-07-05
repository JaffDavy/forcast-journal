import pg from "pg";
import dotenv from 'dotenv'
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
    console.log("Connected to the database on port 5432")
    const checkingTheTableQUery = `
      SELECT EXIST (
      SELECT FROM information_shema.tables
      WHERE table_schema = 'public'
      AND table_name = 'entries'
      )`;

    const createTableQuery = `
      CREATE TABLE entries (
      id SERIAL INT PRIMARY KEY,
      date DATE,
      description VARCHAR(200),
      weather TEXT,
      temparature FLOAT
      )`

    pool.query((checkingTheTableQUery)
      .then(result => {
        if (!result.rows[0].exist) {
          return pool.query(createTableQuery);
        }
      })
      .catch(err => {
        console.error('Error executing query', err);
      })
    )
  })

  .catch((err) => console.error(err));

export default pool;