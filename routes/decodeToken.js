const express = require("express");
const jwt = require("jsonwebtoken");
const tokenDecodingRouter = express.Router();

tokenDecodingRouter.post("/decode", (req, res) => {
  const { token } = req.body;
  // console.log("Token: ", token);

  if (!token) {
    return res.status(400).json({ error: "Token not provided" });
  }
  const decodedToken = jwt.verify(token, "TicketPouls");

  if (decodedToken) {
    res.status(200).json(decodedToken);
  } else {
    // console.log("Token2: ", token);
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = tokenDecodingRouter;
