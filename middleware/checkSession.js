const jwt = require("jsonwebtoken");
const db = require("../db");

const checkSessionExpiration = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, "PERN");
    req.user = decoded;

    const foundUser = await db.query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);

    if (foundUser.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    req.foundUser = foundUser.rows[0]; // Добавляем foundUser в req

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    } else {
      console.log(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
};

module.exports = checkSessionExpiration;
