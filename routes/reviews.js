const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn } = require("../middleware");


const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

const Campground = require("../models/campground")
const Review = require("../models/review");

const { reviewSchema } = require('../shemas.js');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


router.post("/", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Successfully added Review!")
    res.redirect(`/campgrounds/${campground.id}`)
}));

router.delete("/:reviewId", catchAsync(async (req, res, next) => {
    const { reviewId, id } = req.params
    await Campground.findOneAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted Review!")
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;