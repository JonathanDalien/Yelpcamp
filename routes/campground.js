const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground")
const { campgroundSchema, reviewSchema } = require('../shemas.js');
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const campground = require("../models/campground");


const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}



router.get("/", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}));

router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new")
});

router.post("/", isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    campground.author = req.user.id;
    await campground.save();
    req.flash("success", "Successfully made a new Campground!")
    res.redirect(`campgrounds/${campground.id}`)
}));

router.get("/:id", catchAsync(async (req, res, next) => {
    try {
        const { id } = req.params;
        const campgrounds = await Campground.findById(id).populate("reviews").populate("author");
        if (!campgrounds) {
            req.flash("error", "Cannot find that Campground!")
            res.redirect("/campgrounds")
        }
        res.render("campgrounds/show", { campgrounds })
    } catch (e) {
        req.flash("error", "Cannot find that Campground!")
        res.redirect("/campgrounds")

    }

}));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campgrounds = await Campground.findById(id)
    if (!campgrounds) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campgrounds });
}))

router.put("/:id", validateCampground, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { runValidators: true });
    req.flash("success", "Successfully updated the Campground!")
    res.redirect(`/campgrounds/${campground.id}`)
}));


router.delete("/:id", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campgrounds = await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted Campground!")
    res.redirect("/campgrounds");
}));

module.exports = router;