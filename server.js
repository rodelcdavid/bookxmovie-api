require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");

const { Pool } = require("pg");
const app = express();

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  port: "5432",
  password: "admin",
  database: "bookxmovie",
});

//For heroku
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json("Server running.");
});

app.get("/matches", async (req, res) => {
  try {
    const matchesList = await pool.query("SELECT * FROM matches");

    res.status(200).json(matchesList.rows);
  } catch (err) {
    console.log(err);
  }
});

app.post("/add", async (req, res) => {
  // console.log(req.body.match);

  const { id, bookInfo, movieInfo, popularity } = req.body.match;

  try {
    const newMatch = await pool.query(
      `INSERT INTO matches VALUES ($1, $2, $3, 0, 0, $4) RETURNING *;`,
      [id, JSON.stringify(bookInfo), JSON.stringify(movieInfo), popularity]
    );

    res.json(newMatch.rows[0]);
  } catch (error) {
    console.log(error);
  }
});

const PORT = process.env.PORT;

app.listen(PORT || 3000, () => console.log(`App listening to port ${PORT}`));
