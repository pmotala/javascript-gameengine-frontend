const express = require("express");
const path = require("path");

const homeRouter = express.Router();

homeRouter.get("/", serveHomePage);
homeRouter.get("/home", serveHomePage);
homeRouter.get("", serveHomePage);

function serveHomePage(req, res) {
    res.sendFile(path.join(__dirname, "../", "web", "view", "index.html"));
}

module.exports = homeRouter;
