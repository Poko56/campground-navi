// 画像は以下のURLから取得
// http://www.photosforclass.com/search?text=camping

var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    seedDB      = require("./seeds");

mongoose.connect("mongodb://localhost/campground_navi");


// ーーーーーーーーーーーーーーーーーー
// 毎回データが新規作成されてしまうので、コメントアウト
// ーーーーーーーーーーーーーーーーーー

// Campground.create({
//     name: "Granite Hill",
//     image: "https://farm3.staticflickr.com/2464/3694344957_14180103ed.jpg",
//     description: "This is a huge granite hill, no bathrooms, no water. Beautiful granite!"
// }, function(err, campground) {
//   if ( err ) {
//       console.log(err);
//   } else {
//       console.log("Newly created campground!");
//       console.log(campground);
//   }
// });


// var campgrounds = [
//   {name: "Salmon Creek", image: "https://farm5.staticflickr.com/4153/4835814837_feef6f969b.jpg"},
//   {name: "Granite Hill", image: "https://farm5.staticflickr.com/4016/4369518024_0f64300987.jpg"},
//   {name: "Mountain Goat's Rest", image: "https://farm3.staticflickr.com/2464/3694344957_14180103ed.jpg"},
//   {name: "Salmon Creek", image: "https://farm5.staticflickr.com/4153/4835814837_feef6f969b.jpg"},
//   {name: "Granite Hill", image: "https://farm5.staticflickr.com/4016/4369518024_0f64300987.jpg"},
//   {name: "Mountain Goat's Rest", image: "https://farm3.staticflickr.com/2464/3694344957_14180103ed.jpg"},
//   {name: "Salmon Creek", image: "https://farm5.staticflickr.com/4153/4835814837_feef6f969b.jpg"},
//   {name: "Granite Hill", image: "https://farm5.staticflickr.com/4016/4369518024_0f64300987.jpg"},
//   {name: "Mountain Goat's Rest", image: "https://farm3.staticflickr.com/2464/3694344957_14180103ed.jpg"}
// ];

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({extended: true}));

seedDB();

// HOME - redirect to campgrounds page
app.get("/",function(req, res) {
   res.render("landing");
});


// INDEX - show all campgrounds
app.get("/campgrounds", function(req, res) {

    Campground.find({}, function(err, allCampgrounds) {
       if ( err ) {
           console.log(err);
       } else {
        //   console.log(allCampgrounds);
           res.render("campgrounds/index", {campgrounds: allCampgrounds});
       }
    });
});


// CREATE - add new campground to DB
app.post("/campgrounds", function(req, res) {
    var newCampground = {name: req.body.name, image: req.body.imageURL, description: req.body.description};
    // campgrounds.push(newCampground);
    Campground.create(
        newCampground, function(err, campground) {
           if ( err ) {
               console.log(err);
           } else {
               console.log("Successfully Added New Campground!");
               console.log(campground);
               res.redirect("/campgrounds");
           }
        });
});


// NEW - show form to create new campground
app.get("/campgrounds/new", function(req, res) {
    res.render("campgrounds/new");
});

// SHOW - shows more info about campground
app.get("/campgrounds/:id", function(req, res) {

    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if ( err ) {
            console.log(err);
        } else {
            // console.log(foundCampground);
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function() {
   console.log("Server is running!");
});



// ーーーーーーーーーーーーーーーーーー
// Comment Routes
// ーーーーーーーーーーーーーーーーーー

app.get("/campgrounds/:id/comments/new", function(req, res) {

    Campground.findById(req.params.id, function(err, campground) {
        if ( err ) {
            console.log(err);
        } else {
            res.render("comments/new", { campground: campground });
        }
    });

});


app.post("/campgrounds/:id/comments", function(req, res) {
    // lookup campground using ID
    Campground.findById(req.params.id, function(err, campground) {
       if ( err ) {
           console.log(err);
           res.redirect("/campgrounds");
       } else {
           Comment.create(req.body.comment, function(err, comment) {
              if ( err ) {
                  console.log(err);
              } else {
                  campground.comments.push(comment);
                  // connect new comment to campground
                  campground.save();
                  // redirect campground show page
                  res.redirect("/campgrounds/" + campground._id);
              }
           });
       }
    });
});
