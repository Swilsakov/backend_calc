const db = require("../db");
const jwt = require("jsonwebtoken");
const checkSessionExpiration = require("../middleware/checkSession");

class CalcController {
  createOperation = async (req, res) => {
    try {
      // Применение промежуточного ПО checkSessionExpiration
      checkSessionExpiration(req, res, async () => {
        const { num1, operator, num2, user_id } = req.body;
        if (!(num1 && operator && num2 && user_id)) {
          return res.status(400).json({
            message: "Enter all inputs",
          });
        }

        // проверка на user_id
        const isChecked = await db.query("SELECT id FROM users where id = $1", [
          user_id,
        ]);
        if (isChecked.rows.length === 0) {
          return res.status(400).json({
            message: "Uncorrect user_id",
          });
        }

        // логика калькулятора
        const number1 = parseFloat(num1);
        const number2 = parseFloat(num2);
        const operatorType = operator;
        let resultOperation;
        switch (operatorType) {
          case "+":
            resultOperation = number1 + number2;
            break;
          case "-":
            resultOperation = number1 - number2;
            break;
          case "*":
            resultOperation = number1 * number2;
            break;
          case "/":
            resultOperation = Math.floor(number1 / number2);
            break;
          default:
            return res.status(400).json({
              message: "Uncorrect operator",
            });
        }

        // создание операции
        const result = await db.query(
          "INSERT INTO calculator (num1, num2, operator, result, user_id) values ($1, $2, $3, $4, $5) RETURNING *",
          [number1, number2, operatorType, resultOperation, user_id]
        );
        res.status(201).json(result.rows[0]);
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          message: "Session expired (token)",
        });
      } else {
        console.log(error);
        res.status(500).json({ message: "Server error" });
      }
    }
  };

  getAllOperations = async (req, res) => {
    try {
      const operations = await db.query("SELECT * FROM calculator");
      res.status(200).json(operations.rows);
    } catch (error) {
      console.log(error);
    }
  };

  getOperationsByUserId = async (req, res) => {
    try {
      const id = req.params.id;
      const operations = await db.query(
        "SELECT * FROM calculator where user_id = $1",
        [id]
      );
      res.status(200).json(operations.rows);
    } catch (error) {
      console.log(error);
    }
  };
}

module.exports = new CalcController();
