const express = require("express");
const router = express.Router();
const matchupsController = require("../controllers/matchups.controller");

//getallmatchups
router.get("/get-all/:userId", matchupsController.getAllMatchups);

//add vote
router.post("/add-vote/:matchupId", matchupsController.addVote);

//remove vote
router.patch("/remove-vote/:matchupId", matchupsController.removeVote);

module.exports = router;
