const Campground = require("../models/campground")
const Review = require("../models/review")
const User = require('../models/user');


module.exports.registerUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash("success", "Welcome to yelpcamp");
            res.redirect("/campgrounds")
        })
    } catch (e) {
        req.flash("error", e.message)
        res.redirect("/register")
    }
}

module.exports.renderRegister = (req, res, next) => {
    res.render("users/register")
}

module.exports.renderLogin = (req, res, next) => {
    res.render("users/login")
}

module.exports.loginUser = (req, res, next) => {
    req.flash("success", "Welcome back")
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectUrl)
}

module.exports.logoutUser = (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
}