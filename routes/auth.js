const router = require("express").Router();
const User = require("../models/user");
const cryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const {
  getAccessToken,
  getRefreshToken,
  verifyToken,
  verifyTokenAndAuthorization,
} = require("./verifyToken");

//Register
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: cryptoJS.AES.encrypt(
      req.body.password,
      process.env.SECRET_KEY
    ).toString(),
    isAdmin: req.body.isAdmin,
  });
  try {
    const user = await newUser.save();
    res.status(201).json(user);
  } catch (err) {
    let newErr;
    if (err.code === 11000) {
      err.code === 11000 && err.keyPattern.username === 1
        ? (newErr = "Username already exists")
        : "";
      err.code === 11000 && err.keyPattern.email === 1
        ? (newErr = "Email already exists")
        : "";
      res.status(400).json(newErr);
    } else {
      res.status(500).json(err);
    }
  }
});

//Check Email Exists
router.post("/checkemail", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      res.status(400).json("Email already exists");
    } else {
      res.status(201).json("Email not exists");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

let refreshTokens = [];
//Refresh Token
router.post("/refresh", async (req, res) => {
  try {
    if (!req.body.token)
      return res.status(401).json("You are not authenticated");

    if (!refreshTokens.includes(req.body.token)) {
      return res.status(403).json("Refresh token is invalid");
    }

    jwt.verify(req.body.token, process.env.SECRET_REFRESH_KEY, (err, user) => {
      if (err) {
        res.send(403).json("Wrong Refresh Token");
      } else {
        refreshTokens = refreshTokens.filter(
          (token) => token !== req.body.token
        );
        const newaccessToken = getAccessToken(user);
        const newrefreshToken = getRefreshToken(user);
        refreshTokens.push(newrefreshToken);
        res
          .status(200)
          .json({ accessToken: newaccessToken, refreshToken: newrefreshToken });
      }
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(401).json("wrong email or password");
    } else {
      const originalPassword = cryptoJS.AES.decrypt(
        user.password,
        process.env.SECRET_KEY
      ).toString(cryptoJS.enc.Utf8);

      if (originalPassword !== req.body.password) {
        res.status(401).json("wrong email or password");
      } else {
        const accessToken = getAccessToken(user);
        const refreshToken = getRefreshToken(user);
        refreshTokens.push(refreshToken);
        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, accessToken, refreshToken });
      }
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//Logout
router.post("/logout", verifyToken, (req, res) => {
  try {
    const refreshToken = req.body.token;
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
    res.status(200).json("Logout Successfully");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
