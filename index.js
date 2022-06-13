const express= require("express");
const mongoose= require("mongoose")
const ejsMate= require("ejs-mate");
const path=require("path");
const Campground=require("./models/campground")
const method0verride = require("method-override");


mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", ()=>{
    console.log("Database connected");
});

const app= express();


app.engine("ejs", ejsMate);
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views" ))
app.use(express.urlencoded({extended: true}))
app.use(method0verride("_method"));

app.get("/", (req, res)=>{
    res.render("home");
});



app.get("/campgrounds", async (req, res)=>{
    const campgrounds= await Campground.find({});
    res.render("campgrounds/index", {campgrounds});
});

app.get("/campgrounds/new", (req, res)=>{
    res.render("campgrounds/new")
});

app.post("/campgrounds", async (req, res)=>{
    const campground= new Campground(req.body.campground)
    await campground.save();
    res.redirect(`campgrounds/${campground.id}`)
})

app.get("/campgrounds/:id/edit", async (req, res)=>{
    const campgrounds = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campgrounds })
})

app.put("/campgrounds/:id", async (req, res)=>{
    const {id}= req.params;
    const campgrounds= await Campground.findByIdAndUpdate(id, {...req.body.campground}, {runValidators: true});
    console.log(req.body)
    res.redirect(`/campgrounds/${campgrounds.id}`)
});

app.get("/campgrounds/:id", async(req, res)=>{
    const {id} = req.params;
    const campgrounds= await Campground.findById(id);
    res.render("campgrounds/show", { campgrounds })
});

app.delete("/campgrounds/:id", async (req, res)=>{
    const {id} = req.params;
    const campgrounds= await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
});


app.listen(3000, ()=>{
    console.log("serving on port 3000")
});