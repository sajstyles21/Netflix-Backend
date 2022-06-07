const router = require("express").Router();
const List = require("../models/list");
const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  verifyToken,
} = require("./verifyToken");

//Create
router.post("/create", verifyToken, async (req, res) => {
  const newList = new List(req.body);
  try {
    const list = await newList.save();
    res.status(201).json(list);
  } catch (err) {
    let newErr;
    console.log(err);
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

//Delete
router.delete("/:id", verifyTokenAndAdmin, (req, res) => {
  const deleted = List.findByIdAndDelete(req.params.id)
    .then((response) => {
      res.status(201).json("List has been deleted");
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

//Get All
router.get("/", verifyToken, async (req, res) => {
  const typeQuery = req.query.type;
  const genreQuery = req.query.genre;
  let list = [];
  try {
    if (typeQuery && genreQuery) {
      list = await List.aggregate([
        {
          $match: { genre: genreQuery, type: typeQuery },
        },
        { $sample: { size: 10 } },
      ]);
    } else if (typeQuery) {
      list = await List.aggregate([
        {
          $match: { type: typeQuery },
        },
        { $sample: { size: 10 } },
      ]);
    } else if (genreQuery) {
      list = await List.aggregate([
        {
          $match: { genre: genreQuery },
        },
        { $sample: { size: 10 } },
      ]);
    } else {
      list = await List.aggregate([{ $sample: { size: 10 } }]);
    }

    res.status(201).json(list.reverse());
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
