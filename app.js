const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth.router");
const calcRouter = require("./routes/calc.router");

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api", calcRouter);

const start = () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
