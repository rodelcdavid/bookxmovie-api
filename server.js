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

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    //add to user table
    const newUser = await pool.query(
      `INSERT INTO users VALUES (DEFAULT, $1, $2, $3, current_timestamp) RETURNING id, name, email;`,
      [name, email, hashedPassword]
    );

    const newLogin = await pool.query(
      `INSERT INTO login VALUES (DEFAULT, $1, $2) RETURNING *;`,
      [email, hashedPassword]
    );
    res.status(200).json(newUser.rows[0]);
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(400).json(e);
  } finally {
    client.release();
  }
});

//Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    //find email in database
    const userExists = await pool.query(
      `SELECT * FROM login WHERE email = $1;`,
      [email]
    );

    if (userExists.rows.length) {
      //Get hash password
      const hashedPassword = userExists.rows[0].password;

      //compare password
      if (await bcrypt.compare(password, hashedPassword)) {
        const user = await pool.query(
          `SELECT users.id, users.name, users.email FROM login JOIN users ON login.email = users.email AND login.email = $1;`,
          [email]
        );

        res.status(200).json(user.rows[0]);
      } else {
        res.status(400).json("Wrong credentials.");
      }
    } else {
      //user doesn't exist
      res.status(400).json("Wrong credentials.");
    }
  } catch (e) {
    res.status(400).json(e);
  }
});

//Check email
// /users/:email
app.get("/check-email/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const emailExists = await pool.query(
      `SELECT * FROM login WHERE email = $1;`,
      [email]
    );

    if (emailExists.rows.length) {
      res.status(400).json("Email already exists");
    } else {
      res.status(200).json("Email available");
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/matches/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log(userId);
  try {
    let matchesList;
    if (userId === "guest") {
      const selectQuery = `SELECT * FROM matches ORDER BY popularity DESC;`;
      matchesList = await pool.query(selectQuery);
    } else {
      const selectQuery = `SELECT * FROM user_votes RIGHT JOIN matches ON matches.id=user_votes.match_id AND user_votes.user_id=$1 ORDER BY popularity DESC;`;
      matchesList = await pool.query(selectQuery, [userId]);
    }
    res.status(200).json(matchesList.rows);
  } catch (err) {
    console.log(err);
  }
});

app.post("/add", async (req, res) => {
  const { id, bookInfo, movieInfo, bookVotes, movieVotes, popularity } =
    req.body;

  try {
    const newMatch = await pool.query(
      `INSERT INTO matches VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
      [
        id,
        JSON.stringify(bookInfo),
        JSON.stringify(movieInfo),
        bookVotes,
        movieVotes,
        popularity,
      ]
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
