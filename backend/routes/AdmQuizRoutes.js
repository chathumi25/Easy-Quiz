const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Admin quiz route working",
  });
});

module.exports = router;
