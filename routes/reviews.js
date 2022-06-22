const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn, isReviewAuthor } = require("../middleware");
const reviews = require("../controllers/reviews")


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


router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;