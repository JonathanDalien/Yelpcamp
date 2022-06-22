const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn2 } = require("../middleware");
const users = require("../controllers/users");


router.get("/register", isLoggedIn2, users.renderRegister)

router.post("/register", catchAsync(users.registerUser));

router.get("/login", isLoggedIn2, users.renderLogin)

router.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), users.loginUser)

router.get('/logout', users.logoutUser)

module.exports = router;