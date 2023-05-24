const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

class AuthController {
  registration = async (req, res) => {
    try {
      // проверка на email, password
      [
        check("email", "Incorrect email").isEmail(),
        check(
          "password",
          "Password must be longer than 3 and shorter than 15"
        ).isLength({ min: 3, max: 15 }),
      ];
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Uncorrect request",
          errors: errors.array(),
        });
      }

      // запрос от клиента к серверу
      const { email, password } = req.body;
      const candidate = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      if (candidate.rows.length > 0) {
        return res
          .status(409)
          .json({ message: `User with email ${email} already exists` });
      }

      const hashPassword = await bcrypt.hash(password, 10);

      const newUser = await db.query(
        "INSERT INTO users (email, hashed_password) VALUES ($1, $2) RETURNING *",
        [email, hashPassword]
      );

      return res.status(201).json({
        message: "User was created",
        user: newUser.rows[0],
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  };

  login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (user.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const foundUser = user.rows[0];

      // проверка на валидный пароль
      const isPasswordValid = await bcrypt.compare(
        password,
        foundUser.hashed_password
      );
      // ошибка на невалидный пароль
      if (!isPasswordValid) {
        return res.status(400).json({
          message: "Invalid password",
        });
      }

      const token = jwt.sign({ id: foundUser.id, email }, "PERN", {
        expiresIn: "5m",
      });

      // установка последнего логина
      const currentDate = new Date().toISOString();
      await db.query("UPDATE users SET last_login = $1 WHERE id = $2", [
        currentDate,
        foundUser.id,
      ]);
      foundUser.last_login = currentDate;

      return res.json({
        token,
        user: foundUser,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = new AuthController();
