const Campground = require("../models/campground")
const Review = require("../models/review")



module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user.id
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Successfully added Review!")
    res.redirect(`/campgrounds/${campground.id}`)
}

module.exports.deleteReview = async (req, res, next) => {
    const { reviewId, id } = req.params
    await Campground.findOneAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted Review!")
    res.redirect(`/campgrounds/${id}`)
}