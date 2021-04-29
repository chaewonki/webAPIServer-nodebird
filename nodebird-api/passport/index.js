const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const { User } = require("../models");

/* 
  In order to support login sessions, Passport will serialize and deserialize user instance to and from session.
  serializeUser choose the data that will be saved in req.session
  desrializeUser is excuted every request. able to ID from serializeUser and query the information using the ID.
                and save the information in req.user
*/

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  /*
    Follower and Following SEARCH from seqeulize
  */
  passport.deserializeUser((id, done) => {
    User.findOne({
      where: { id },
      include: [
        { model: User, attributes: ["id", "nick"], as: "Followers" },
        {
          model: User,
          attributes: ["id", "nick"],
          as: "Followings",
        },
      ],
    })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });

  local(passport);
  kakao(passport);
};
