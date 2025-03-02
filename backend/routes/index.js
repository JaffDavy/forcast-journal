import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
// import pkg from 'pg';
import 'dotenv/config';
import pool from '../dbconfig.js'

dotenv.config();

const app = express();
// const { pool } = pkg;
const router = express.Router();

const apiKey = process.env.OPENWEATHERMAP_API_KEY;
const apiUrl = process.env.OPENWEATHERMAP_API_URL;

app.use(bodyParser.json());
app.use(cors());  

router.post('/', (req, res, next) => {
  const { date, description, latitude, longitude } = req.body;
  try {
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and Longitude are required' });
    }
    const url = `${apiUrl}lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    console.log(`Requesting weather data from URL: ${url}`);
    axios.get(url)
      .then(weatherResponse => {
        const { weather, main } = weatherResponse.data;
        const temperature = main.temp;
        return pool.query(
          'INSERT INTO entries (date, description, weather, temperature) VALUES ($1, $2, $3, $4) RETURNING *',
          [date, description, weather[0].main, temperature]
        );
      })
      .then(result => {
        res.json(result.rows[0]);
      })
      .catch(error => {
        next(error);
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', (req, res, next) => {
  pool.query('SELECT * FROM entries')
    .then(entries => {
      res.json(entries.rows);
    })
    .catch(error => {
      next(error);
    });
});
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { date, description } = req.body;


  pool.query(
    'UPDATE entries SET date = $1, description = $2 WHERE id = $3 RETURNING *',
    [date, description, id],
    (error, result) => {
      if (error) {
        return next(error);
      }

      const updatedEntry = result.rows[0];
      if (!updatedEntry) {
        res.status(404).json({ error: "Entry not found." });
      } else {
        res.json(updatedEntry);
      }
    }
  );
});


router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  pool.query('DELETE FROM entries WHERE id = $1', [id])
    .then(() => {
      res.json({ message: 'Entry deleted' });
    })
    .catch(error => {
      next(error);
    });
});
router.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? '' : error.stack
  });
});

export default router;