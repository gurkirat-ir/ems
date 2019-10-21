const router = require("express").Router();
const User = require("../model/user");
const mailer = require("@sendgrid/mail");
const { createHash } = require("crypto");
const conf = require("../../config");

// set mailer API Key
mailer.setApiKey(conf.api.mail);

/**
 * @name /whoami
 * @method GET
 * @description Router to get the role of user
 */
router.get("/whoami", async (req, res) => {
  try {
    // check if logged in
    if (req.session.uid) {
      // send role
      res.json({ success: true, role: req.session.role });
    } else {
      // send null
      res.json({ success: true, role: null });
    }
  } catch (error) {
    // send error response
    res.json({ success: false, message: "Something went wrong" });
  }
});

/**
 * @name /login
 * @method POST
 * @description Router to login user
 */
router.post("/login", async (req, res) => {
  try {
    // check if already logged in
    if (req.session.uid) {
      // send error response
      res.json({ success: false, message: "Already logged in" });
      return;
    }

    // find user document by email and password
    let usr = await User.findOne({
      email: String(req.body.email),
      password: String(req.body.password)
    });

    // check if user exists
    if (!usr) {
      // send error response
      res.json({ success: false, message: "Check email/password" });
      return;
    }

    // set session
    req.session.uid = usr._id;
    req.session.role = usr.role;

    // save session
    req.session.save(e => {
      // check if error
      if (e) {
        // send error response
        res.json({ success: false, message: "Something went wrong" });
      } else {
        // send response
        res.json({ success: true, message: "Logged in" });
      }
    });
  } catch (error) {
    // send error response
    res.json({ success: false, message: "Something went wrong" });
  }
});

/**
 * @name /login
 * @method DELETE
 * @description Router to delete login session
 */
router.delete("/login", async (req, res) => {
  try {
    // destroy session
    req.session.destroy(e => {
      // check if error
      if (e) {
        // send error response
        res.json({ success: false, message: "Something went wrong" });
      } else {
        // send response
        res.json({ success: true, message: "Logged out" });
      }
    });
  } catch (error) {
    // send error response
    res.json({ success: false, message: "Something went wrong" });
  }
});

/**
 * @name /new
 * @method POST
 * @description Router to create new user
 */
router.post("/new", async (req, res) => {
  try {
    // check if logged in as hr
    if (req.session.uid && req.session.role == "hr") {
      // find user with email
      let u = await User.findOne({ email: req.body.email });

      // check if user exists
      if (u) {
        // send error response
        res.json({ success: false, message: "Account exists" });
        return;
      }

      // create new user and save
      await new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
      }).save();

      // send response
      res.json({ success: true, message: "Created" });
    } else {
      // send error response
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    // send error response
    res.json({ success: false, message: "Something went wrong" });
  }
});

/**
 * @name /one/:id
 * @method DELETE
 * @description Router to delete one user details
 */
router.delete("/one/:id", async (req, res) => {
  try {
    // check if logged in as hr
    if (req.session.uid && req.session.role == "hr") {
      // find user by ID and delete
      await User.findByIdAndDelete(req.params.id);

      // send response
      res.json({ success: true, message: "Deleted" });
    } else {
      // send error response
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    // send error response
    res.json({ success: false, message: "Something went wrong" });
  }
});

/**
 * @name /all
 * @method GET
 * @description Router to get all users
 */
router.get("/all", async (req, res) => {
  try {
    // check if logged in as HR
    if (req.session.uid && req.session.role == "hr") {
      // find all users and supress projAssigned and password
      let users = await User.find({}, { projAssigned: false, password: false });

      // send response
      res.json({ success: true, users });
    } else {
      // send error response
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    // send error response
    res.json({ success: false, message: "Something went wrong" });
  }
});

/**
 * @name /all-for-employee
 * @method GET
 * @description Router to get employee details for employer dashboard
 */
router.get("/all-for-employee", async (req, res) => {
  try {
    // check if logged in as employer
    if (req.session.uid && req.session.role == "employer") {
      // find users with role employee
      let users = await User.find(
        { role: "employee" },
        { password: false, role: false }
      );

      // format data
      users = users.map(_ => ({
        name: _.name,
        num_proj: _.projAssigned.length,
        email: _.email
      }));

      // send response
      res.json({ success: true, users });
    } else {
      // send error response
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    // send error response
    res.json({ success: false, message: "Something went wrong" });
  }
});

/**
 * @name /reset-password
 * @method PUT
 * @description Router to send new password
 */
router.put("/reset-password", async (req, res) => {
  try {
    // find user by email
    let user = await User.findOne({ email: req.body.email });

    // send response
    res.json({
      success: true,
      message: "If this email is correct you will password reset instructions"
    });

    // check if user exists
    if (user) {
      // create random string
      let p = Math.random()
        .toString(36)
        .substr(2);

      // create hash
      let _ = createHash("sha256")
        .update(p)
        .digest("base64");

      // send mail
      await mailer.send({
        from: conf.from,
        to: user.email,
        subject: "[EMS] Reset Password Instructions",
        html: `Hello ${user.name}<br><br>It seems you have requested for new password. Your new password is <strong><pre>${p}</pre></strong><br><br><center><i>This email is sent by the bot. Do not reply to this mail</i></center>`
      });

      // update password
      user.password = _;

      // save password
      await user.save();
    }
  } catch (error) {
    // send error response
    res.json({ success: false, message: "Something went wrong" });
  }
});

/**
 * @name /one/:id
 * @method PUT
 * @description Router to update user details
 */
router.put("/one/:id", async (req, res) => {
  try {
    // check if logged in as hr
    if (req.session.uid && req.session.role == "hr") {
      // find user by _id
      let user = await User.findById(req.params.id);

      // update fields
      user.name = req.body.name;
      user.email = req.body.email;
      user.role = req.body.role;

      // save the document
      await user.save();

      // send response
      res.json({ success: true, message: "Updated" });
    } else {
      // send error response
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    // send error response
    res.json({ success: false, message: "Something went wrong" });
  }
});

/**
 * @name /for-task
 * @method GET
 * @description Router to get user details for task assignment
 */
router.get("/for-task", async (req, res) => {
  try {
    // check if logged in as employer
    if (req.session.uid && req.session.role == "employer") {
      // find all employees and suppress all except email and name
      let users = await User.find(
        { role: "employee" },
        { email: true, name: true }
      );

      // send response
      res.json({ success: true, users });
    } else {
      // send error response
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    // send error response
    res.json({ success: false, message: "Something went wrong" });
  }
});

module.exports = router;
