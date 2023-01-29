require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./app/routes/auth.routes");
const matchupsRoutes = require("./app/routes/matchups.routes");
const adminMatchupsRoutes = require("./app/routes/admin.matchups.routes");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json("Server running.");
});

// auth
app.use("/api/auth", authRoutes);
//matchups
app.use("/api/matchups", matchupsRoutes);
//admin matchups
app.use("/api/admin/matchups", adminMatchupsRoutes);

const PORT = process.env.PORT;

app.listen(PORT || 7000, () =>
  console.log(`App listening to port ${PORT || 7000}`)
);
