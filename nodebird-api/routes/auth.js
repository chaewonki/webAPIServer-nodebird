const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const { User } = require("../models");

const router = express.Router();

router.post("/join", isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      req.flash("joinError", "이미 가입된 이메일입니다.");
      return res.redirect("/join");
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

/*
  1. Login Request
  2. passport.authenticate()
  3. Login Strategy
  4. If success, req.login() with user Object
  5. req.login() calls passport.serializeUser()
  6. only save ID in req.session
  7. Login Complete
*/

/*
In this example, note that authenticate() is called 
from within the route handler, rather than being used as route middleware.
This gives the callback access to the req and res objects through closure.
If authentication failed, user will be set to false. 
If an exception occurred, err will be set. An optional info argument will be passed,
containing additional details provided by the strategy's verify callback.
*/

router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      req.flash("loginError", info.message);
      return res.redirect("/");
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect("/");
    }); // Inner Middleware should be finished with (req,res,next)
  })(req, res, next);
});

/*
  when res.redirect("/") is bottom of the router, res.redirect("/") is not working.
  so, move res.redirect("/") to the first.  
*/
router.get("/logout", isLoggedIn, (req, res) => {
  res.redirect("/");
  req.logout();
  req.session.destroy();
});

router.get("/kakao", passport.authenticate("kakao"));

router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

module.exports = router;
