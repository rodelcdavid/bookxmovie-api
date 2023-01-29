//imports
const pool = require("../../config/database");

//add matchup
const addMatchup = async (req, res) => {
  const { id, bookInfo, movieInfo, bookVotes, movieVotes, popularity } =
    req.body;

  try {
    const newMatchup = await pool.query(
      `INSERT INTO matchups VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
      [
        id,
        JSON.stringify(bookInfo),
        JSON.stringify(movieInfo),
        bookVotes,
        movieVotes,
        popularity,
      ]
    );
    res.status(200).json(newMatchup.rows[0]);
  } catch (error) {
    console.log(error);
  }
};

//delete matchup
const deleteMatchup = async (req, res) => {
  const { matchupId } = req.body;

  try {
    const deleteQuery = `DELETE FROM matchups where id=$1 RETURNING *`;

    const deletedMatchup = await pool.query(deleteQuery, [matchupId]);
    res.status(200).json(deletedMatchup.rows[0]);
    // res.status(200).json(matchups.rows);
  } catch (err) {
    console.log(err);
  }
};

//edit vote
const editVote = async (req, res) => {
  const { matchupId } = req.params;
  const { bookVotes, movieVotes } = req.body;
  try {
    const updateQuery = `UPDATE matchups SET book_votes=$1, movie_votes=$2 WHERE id=$3 RETURNING *;`;

    const updatedMatchup = await pool.query(updateQuery, [
      bookVotes,
      movieVotes,
      matchupId,
    ]);

    res.status(200).json(updatedMatchup.rows[0]);
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  addMatchup,
  deleteMatchup,
  editVote,
};
