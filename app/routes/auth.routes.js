const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

//signup
router.post("/signup", authController.signup);

//Login
router.post("/login", authController.login);

//Check email
router.get("/check-email/:email", authController.checkEmail);

module.exports = router;
