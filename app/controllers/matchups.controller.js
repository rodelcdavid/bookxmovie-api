//imports
const pool = require("../../config/database");

//get all matchups
const getAllMatchups = async (req, res) => {
  const { userId } = req.params;
  try {
    let matchups;
    if (userId === "guest") {
      const selectQuery = `SELECT * FROM matchups ORDER BY popularity DESC;`;
      matchups = await pool.query(selectQuery);
    } else {
      const selectQuery = `SELECT * FROM user_votes RIGHT JOIN matchups ON matchups.id=user_votes.matchup_id AND user_votes.user_id=$1 ORDER BY popularity DESC;`;
      matchups = await pool.query(selectQuery, [userId]);
    }
    res.status(200).json(matchups.rows);
  } catch (err) {
    console.log(err);
  }
};
//add vote
const addVote = async (req, res) => {
  const { matchupId } = req.params;
  const { userId, votedFor } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    //add vote to matchups table
    let updateQuery;
    if (votedFor === "movie") {
      updateQuery = `UPDATE matchups SET movie_votes = movie_votes + 1 WHERE id = $1 RETURNING *`;
    } else {
      updateQuery = `UPDATE matchups SET book_votes = book_votes + 1 WHERE id = $1 RETURNING *`;
    }
    const updatedMatchup = await pool.query(updateQuery, [matchupId]);

    //add new user vote
    const insertQuery = `INSERT INTO user_votes VALUES($1, $2, $3) RETURNING *`;

    const userVote = await pool.query(insertQuery, [
      userId,
      matchupId,
      votedFor,
    ]);

    //just send res status 200
    res.status(200).json("Vote added");
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(400).json(e);
  } finally {
    client.release();
  }
};

//remove vote
const removeVote = async (req, res) => {
  const { matchupId } = req.params;
  const { userId, votedFor } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    //remove vote in matchups table
    let updateQuery;
    if (votedFor === "movie") {
      updateQuery = `UPDATE matchups SET movie_votes = movie_votes - 1 WHERE id = $1 RETURNING *`;
    } else {
      updateQuery = `UPDATE matchups SET book_votes = book_votes - 1 WHERE id = $1 RETURNING *`;
    }
    const updatedMatchup = await pool.query(updateQuery, [matchupId]);

    //remove user vote
    const deleteQuery = `DELETE FROM user_votes WHERE user_id = $1 AND matchup_id = $2 RETURNING *`;

    const userVote = await pool.query(deleteQuery, [userId, matchupId]);

    //just send res status 200
    res.status(200).json("Vote deleted");
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(400).json(e);
  } finally {
    client.release();
  }
};

//exports
module.exports = {
  getAllMatchups,
  addVote,
  removeVote,
};
