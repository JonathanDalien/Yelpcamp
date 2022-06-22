const Campground = require("../models/campground")

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new")
}

module.exports.createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    campground.author = req.user.id;
    await campground.save();
    req.flash("success", "Successfully made a new Campground!")
    res.redirect(`campgrounds/${campground.id}`)
}

module.exports.showCampground = async (req, res, next) => {
    try {
        const { id } = req.params;
        const campgrounds = await Campground.findById(id).populate({
            path: "reviews",
            populate: { path: "author" }
        }).populate("author");
        if (!campgrounds) {
            req.flash("error", "Cannot find that Campground!")
            res.redirect("/campgrounds")
        }
        res.render("campgrounds/show", { campgrounds })
    } catch (e) {
        req.flash("error", "Cannot find that Campground!")
        res.redirect("/campgrounds")

    }

}
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campgrounds = await Campground.findById(id)
    if (!campgrounds) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campgrounds });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { runValidators: true });
    req.flash("success", "Successfully updated the Campground!")
    res.redirect(`/campgrounds/${campground.id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campgrounds = await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted Campground!")
    res.redirect("/campgrounds");
}