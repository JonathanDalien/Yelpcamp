const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground")
const { campgroundSchema, reviewSchema } = require('../shemas.js');
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const campgrounds = require("../controllers/campgrounds")


const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}



router.get("/", catchAsync(campgrounds.index));

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.post("/", isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

router.get("/:id", catchAsync(campgrounds.showCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

router.put("/:id", validateCampground, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));


router.delete("/:id", isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;