const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const env = require("dotenv");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const movieRoute = require("./routes/movies");
const listRoute = require("./routes/lists");
const app = express(cors);

env.config();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => console.log(err));

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/movies", movieRoute);
app.use("/api/lists", listRoute);

app.get("/", (req, res) => {
  res.status(200).send("Welcome to Netflix");
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log("server is running");
});
