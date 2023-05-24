const Router = require("express");
const router = new Router();
const calcController = require("../controller/calc.controller");

router.post("/calculator", calcController.createOperation);
router.get("/calculator", calcController.getAllOperations);
router.get("/calculator/:id", calcController.getOperationsByUserId);

module.exports = router;
