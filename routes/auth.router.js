const Router = require("express");
const router = new Router();
const authController = require("../controller/auth.controller");
const checkSessionExpiration = require("../middleware/checkSession");

router.post("/registration", authController.registration);
router.post("/login", authController.login);
// router.get("/protected", checkSessionExpiration, (req, res) => {
//   // Защищенный маршрут, доступный только при активной сессии
//   res.status(200).json({ message: "Protected route" });
// });

router.get("/protected", checkSessionExpiration, (req, res) => {
  res.status(200).json({ message: "Protected route" });
});

module.exports = router;
