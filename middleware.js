const Campground = require('./models/campground');
const Review = require('./models/review');

const { campgroundSchema, reviewSchema } = require("./shemas");


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash("error", "You must be Logged in!")
        return res.redirect("/login")
    }
    next();
}
module.exports.isLoggedIn2 = (req, res, next) => {
    if (req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash("error", "You are already logged in!")
        return res.redirect("/campgrounds")
    }
    next();
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user.id)) {
        req.flash("error", "Permission denied!")
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user.id)) {
        req.flash("error", "Permission denied!")
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}