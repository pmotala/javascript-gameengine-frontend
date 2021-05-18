const express = require("express");
const path = require("path");

const exploreRouter = express.Router();

exploreRouter.get("/explore", (req, res) => {
    res.sendFile(path.join(__dirname, "../", "web", "views", "explore.html"));
});

module.exports = exploreRouter;
