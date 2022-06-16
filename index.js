const express = require("express");
const mongoose = require("mongoose")
const ejsMate = require("ejs-mate");
const path = require("path");
const Campground = require("./models/campground")
const { campgroundSchema, reviewSchema } = require('./shemas.js');
const method0verride = require("method-override");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const joi = require("joi");
const Joi = require("joi");
const Review= require("./models/review");
const review = require("./models/review");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();


app.engine("ejs", ejsMate);
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))
app.use(method0verride("_method"));

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const validateReview = (req, res, next)=>{
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.get("/", (req, res) => {
    res.render("home");
});



app.get("/campgrounds", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}));

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new")
});

app.post("/campgrounds", validateReview, validateCampground, catchAsync(async (req, res, next) => {
    //if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400)
    const campground = new Campground(req.body.campground)
    await campground.save();
    res.redirect(`campgrounds/${campground.id}`)
}));

app.get("/campgrounds/:id", catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campgrounds = await Campground.findById(id).populate("reviews");
    console.log(campgrounds);
    res.render("campgrounds/show", { campgrounds })

}));

app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
    const campgrounds = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campgrounds })
}));

app.put("/campgrounds/:id", validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campgrounds = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { runValidators: true });
    res.redirect(`/campgrounds/${campgrounds.id}`)
}));


app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    const campgrounds = await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
}));

app.post("/campgrounds/:id/reviews", catchAsync(async (req, res)=>{
    const campground= await Campground.findById(req.params.id);
    const review= new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground.id}`)
}));

app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync(async (req, res, next)=>{
    const {reviewId, id} =req.params
    await Campground.findOneAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`)
}))

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh no, something went wrong"
    res.status(statusCode).render("error", { err });
})


app.listen(3000, () => {
    console.log("serving on port 3000")
});