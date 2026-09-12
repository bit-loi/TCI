/** @format */

const express = require("express");
const { signup, signin, signout, me, resetPassword } = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signout", signout);
router.get("/me", authMiddleware, me);
router.post("/reset-password", resetPassword);

module.exports = router;
