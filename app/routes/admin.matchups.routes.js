const express = require("express");
const router = express.Router();
const adminMatchupsController = require("../controllers/admin.matchups.controller");

//add matchup
router.post("/add-matchup", adminMatchupsController.addMatchup);

//delete matchup
router.delete("/delete-matchup", adminMatchupsController.deleteMatchup);

//edit vote
router.patch("/edit-votes/:matchupId", adminMatchupsController.editVote);

module.exports = router;
