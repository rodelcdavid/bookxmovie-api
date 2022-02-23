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

app.get("/matches/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const matchesList = await pool.query(
      //if userid (logged in)
      `SELECT * FROM user_votes RIGHT JOIN matches ON matches.id=user_votes.match_id AND user_votes.user_id=$1 ORDER BY popularity DESC`,
      [userId]
      //else
      // "SELECT * FROM matches ORDER BY popularity DESC"
    );

    res.status(200).json(matchesList.rows);
  } catch (err) {
    console.log(err);
  }
});

app.post("/add", async (req, res) => {
  const { id, bookInfo, movieInfo, popularity } = req.body;

  try {
    const newMatch = await pool.query(
      `INSERT INTO matches VALUES ($1, $2, $3, 0, 0, $4) RETURNING *;`,
      [id, JSON.stringify(bookInfo), JSON.stringify(movieInfo), popularity]
    );
    res.status(200).json(newMatch.rows[0]);
  } catch (error) {
    console.log(error);
  }
});

//update votes in matches
app.patch("/matches/:matchId", async (req, res) => {
  const { matchId } = req.params;
  const { votedFor } = req.body;
  try {
    let updateQuery;
    if (votedFor === "movie") {
      updateQuery = `UPDATE matches SET movie_votes = movie_votes + 1 WHERE id = $1 RETURNING *`;
    } else {
      updateQuery = `UPDATE matches SET book_votes = book_votes + 1 WHERE id = $1 RETURNING *`;
    }
    const updatedMatch = await pool.query(updateQuery, [matchId]);
    res.status(200).json(updatedMatch.rows[0]);
  } catch (err) {
    console.log(err);
  }
});

//add votes in user_votes
app.post("/user-votes/:userId", async (req, res) => {
  const { userId } = req.params;
  const { matchId, votedFor } = req.body;

  try {
    const insertQuery = `INSERT INTO user_votes VALUES($1, $2, $3) RETURNING *`;

    const userVote = await pool.query(insertQuery, [userId, matchId, votedFor]);
    res.status(200).json(userVote.rows[0]);
    // res.status(200).json(matchesList.rows);
  } catch (err) {
    console.log(err);
  }
});

//add vote transaction
app.post("/vote/:matchId", async (req, res) => {
  const { matchId } = req.params;
  const { userId, votedFor } = req.body;
  console.log(matchId, userId, votedFor);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    //add vote to matches table
    let updateQuery;
    if (votedFor === "movie") {
      updateQuery = `UPDATE matches SET movie_votes = movie_votes + 1 WHERE id = $1 RETURNING *`;
    } else {
      updateQuery = `UPDATE matches SET book_votes = book_votes + 1 WHERE id = $1 RETURNING *`;
    }
    const updatedMatch = await pool.query(updateQuery, [matchId]);

    //add new user vote
    const insertQuery = `INSERT INTO user_votes VALUES($1, $2, $3) RETURNING *`;

    const userVote = await pool.query(insertQuery, [userId, matchId, votedFor]);

    //just send res status 200
    res.status(200).json("Vote added");
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(400).json(e);
  } finally {
    client.release();
  }
});

//delete
app.delete("/delete", async (req, res) => {
  const { matchId } = req.body;

  try {
    const deleteQuery = `DELETE FROM matches where id=$1 RETURNING *`;

    const deletedMatch = await pool.query(deleteQuery, [matchId]);
    res.status(200).json(deletedMatch.rows[0]);
    // res.status(200).json(matchesList.rows);
  } catch (err) {
    console.log(err);
  }
});

const PORT = process.env.PORT;

app.listen(PORT || 3000, () => console.log(`App listening to port ${PORT}`));
