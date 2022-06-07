const router = require("express").Router();
const Movie = require("../models/movie");
const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  verifyToken,
} = require("./verifyToken");

//Create
router.post("/create", verifyToken, async (req, res) => {
  const newMovie = new Movie(req.body);
  try {
    const movie = await newMovie.save();
    res.status(201).json(movie);
  } catch (err) {
    let newErr;
    if (err.code === 11000) {
      err.code === 11000 && err.keyPattern.title === 1
        ? (newErr = "Title already exists")
        : "";
      res.status(400).json(newErr);
    } else {
      res.status(500).json(err);
    }
  }
});

//Update
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(201).json(updatedMovie);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Delete
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.status(201).json("Movie has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

//Get
router.get("/find/:id", verifyToken, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    res.status(201).json(movie);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Get Random
router.get("/random", verifyTokenAndAuthorization, async (req, res) => {
  const query = req.query.type;
  let movie;
  try {
    if (query === "series") {
      movie = await Movie.aggregate([
        {
          $match: { isSeries: true },
        },
        {
          $sample: { size: 1 },
        },
      ]);
    } else {
      movie = await Movie.aggregate([
        {
          $match: { isSeries: false },
        },
        {
          $sample: { size: 1 },
        },
      ]);
    }
    res.status(201).json(movie);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Get ALL
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const q = req.query.new;
  try {
    const getAllMovies = q
      ? await Movie.find().sort({ _id: -1 }).limit(10)
      : await Movie.find().sort({ _id: -1 });
    res.status(201).json(getAllMovies);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
