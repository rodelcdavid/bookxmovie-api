const pool = require("../../config/database");
const bcrypt = require("bcrypt");

//login
const login = async (req, res) => {
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
};

//signup
const signup = async (req, res) => {
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
};

//checkemail
const checkEmail = async (req, res) => {
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
};

module.exports = {
  signup,
  login,
  checkEmail,
};
