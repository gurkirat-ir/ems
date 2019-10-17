const router = require("express").Router();
const User = require("../model/user");
const mailer = require("@sendgrid/mail");
const { createHash } = require("crypto");
const conf = require("../../config");

mailer.setApiKey(conf.api.mail);

router.get("/whoami", async (req, res) => {
  try {
    if (req.session.uid) {
      res.json({ success: true, role: req.session.role });
    } else {
      res.json({ success: true, role: null });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

router.post("/login", async (req, res) => {
  try {
    if (req.session.uid) {
      res.json({ success: false, message: "Already logged in" });
      return;
    }

    let usr = await User.findOne({
      email: req.body.email,
      password: req.body.password
    });

    if (!usr) {
      res.json({ success: false, message: "Check email/password" });
      return;
    }
    req.session.uid = usr._id;
    req.session.role = usr.role;

    req.session.save(e => {
      if (e) {
        res.json({ success: false, message: "Something went wrong" });
      } else {
        res.json({ success: true, message: "Logged in" });
      }
    });
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

router.delete("/login", async (req, res) => {
  try {
    req.session.destroy(e => {
      if (e) {
        res.json({ success: false, message: "Something went wrong" });
      } else {
        res.json({ success: true, message: "Logged out" });
      }
    });
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

router.post("/new", async (req, res) => {
  try {
    if (req.session.uid && req.session.role == "hr") {
      let u = await User.findOne({ email: req.body.email });
      if (u) {
        res.json({ success: false, message: "Account exists" });
        return;
      }
      await new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
      }).save();
      res.json({ success: true, message: "Created" });
    } else {
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

router.delete("/one/:id", async (req, res) => {
  try {
    if (req.session.uid && req.session.role == "hr") {
      await User.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: "Deleted" });
    } else {
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

router.get("/all", async (req, res) => {
  try {
    if (req.session.uid && req.session.role == "hr") {
      let users = await User.find({}, { projAssigned: false, password: false });
      res.json({ success: true, users });
    } else {
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

router.get("/all-for-employee", async (req, res) => {
  try {
    if (req.session.uid && req.session.role == "employer") {
      let users = await User.find(
        { role: "employee" },
        { password: false, role: false }
      );
      users = users.map(_ => ({
        name: _.name,
        num_proj: _.projAssigned.length,
        email: _.email
      }));
      res.json({ success: true, users });
    } else {
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

router.get("/one/:id", async (req, res) => {
  try {
    if (req.session.uid && req.session.role == "hr") {
      let users = await User.find({}, { projAssigned: false });
      res.json({ success: true, users });
    } else {
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

router.put("/reset-password", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  res.json({
    success: true,
    message: "If this email is correct you will password reset instructions"
  });
  if (user) {
    let p = Math.random()
      .toString(36)
      .substr(2);
    let _ = createHash("sha256")
      .update(p)
      .digest("base64");
    mailer
      .send({
        from: conf.api.mail,
        to: user.email,
        subject: "[EMS] Reset Password Instructions",
        html: `Hello ${user.name}<br><br>It seems you have requested for new password. Your new password is <strong><pre>${p}</pre></strong><br><br><center><i>This email is sent by the bot. Do not reply to this mail</i></center>`
      })
      .then(() => console.warn("Sent"))
      .catch(() => console.log("Not sent"));

    user.password = _;
    await user.save();
  }
});

router.put("/one/:id", async (req, res) => {
  try {
    if (req.session.uid && req.session.role == "hr") {
      let user = await User.findById(req.params.id);
      if (req.body.password) user.password = req.body.password;
      user.name = req.body.name;
      user.email = req.body.email;

      await user.save();

      res.json({ success: true, message: "Updated" });
    } else {
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

router.get("/for-task", async (req, res) => {
  try {
    if (req.session.uid && req.session.role == "employer") {
      let users = await User.find(
        { role: "employee" },
        { email: true, name: true }
      );

      res.json({ success: true, users });
    } else {
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});
module.exports = router;
