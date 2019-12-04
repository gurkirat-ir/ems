const router = require("express").Router();
const Project = require("../model/project");
const User = require("../model/user");
const Task = require("../model/task");

/**
 * @name /new
 * @method POST
 * @description Router to create new project
 */
router.post("/new", async (req, res) => {
  try {
    // checking if logged in as employer
    if (
      req.session.uid &&
      (req.session.role == "employer" || req.session.role == "hr")
    ) {
      // creating an instance of Project
      let project = new Project();

      // assigning data to fields
      project.title = req.body.title;
      project.description = req.body.description;
      project.deadline = req.body.deadline;

      // saving the project
      await project.save();

      // sending response
      res.json({ success: true, message: "Posted", id: project._id });
    } else {
      // sending error response
      res.json({ success: false, message: "Unauthorize access" });
    }
  } catch (error) {
    // sending error response
    res.json({ success: false, message: "Something went wrong" });
  }
});

/**
 * @name /all
 * @method POST
 * @description Router to get all projects
 */
router.all("/all", async (req, res) => {
  try {
    // checking if logged in as employer
    if (
      req.session.uid &&
      (req.session.role == "employer" || req.session.role == "hr")
    ) {
      // find all projects
      let projects = await Project.find(
        {},
        {
          title: true,
          deadline: true,
          status: true,
          tasks: true
        }
      )
        // sort descendently based on createdOn
        .sort("-createdOn");

      // create the data
      projects = projects.map(v => ({
        _id: v._id,
        title: v.title,
        deadline: v.deadline,
        createdOn: v.createdOn,
        num_tasks: v.tasks.length,
        status: v.status
      }));

      // send response
      res.json({ success: true, projects });
    } else {
      // send error response
      res.json({ success: false, message: "Unauthorize access" });
    }
  } catch (error) {
    // send error response
    res.json({ success: false, message: "Something went wrong" });
  }
});

/**
 * @name /one/:pid
 * @method DELETE
 * @description Router to delete project by id
 */
router.delete("/one/:pid", async (req, res) => {
  try {
    // checking if logged in as employer
    if (req.session.uid && req.session.role == "employer") {
      // deleting project from collection
      let proj = await Project.findByIdAndDelete(req.params.pid);

      // deleting all the tasks associated with project
      await Task.deleteMany({ project: proj._id });
      // removing projects from user document
      await User.updateMany({}, { $pull: { projAssigned: proj._id } });

      // send response
      res.json({ success: true, message: "Deleted" });
    } else {
      // send error response
      res.json({ success: false, message: "Unauthorize access" });
    }
  } catch (error) {
    // send error response
    res.json({ success: false, message: "Something went wrong" });
  }
});

/**
 * @name /one/:pid
 * @method GET
 * @description Router to get details of one project
 */
router.get("/one/:pid", async (req, res) => {
  try {
    // checking if logged in as employer
    if (
      req.session.uid &&
      (req.session.role == "employer" || req.session.role == "hr")
    ) {
      // find the project by _id
      let proj = await Project.findById(req.params.pid)
        // populate tasks and suppress some field
        .populate("tasks", {
          project: false,
          empAssigned: false,
          description: false,
          comments: false
        })
        // populate empAssigned and suppress except name and email
        .populate("empAssigned", { email: true, name: true });

      // send response
      res.json({ success: true, projects: proj });
    } else {
      // send error response
      res.json({ success: false, message: "Unauthorize access" });
    }
  } catch (error) {
    // send error response
    res.json({ success: false, message: "Something went wrong" });
  }
});

/**
 * @name /one/:pid
 * @method PUT
 * @description Router to update project
 */
router.put("/one/:pid", async (req, res) => {
  try {
    // checking if logged in as employer
    if (
      req.session.uid &&
      (req.session.role == "employer" || req.session.role == "hr")
    ) {
      // find project by _id and update fields
      let proj = await Project.findByIdAndUpdate(req.params.pid, {
        title: req.body.title,
        description: req.body.description,
        deadline: req.body.deadline,
        status: req.body.status
      });

      // update tasks status of current project
      await Task.updateMany({ project: proj._id }, { status: req.body.status });

      // send response
      res.json({ success: true, message: "Updated" });
    } else {
      // send error response
      res.json({ success: false, message: "Unauthorize access" });
    }
  } catch (error) {
    // send error response
    res.json({ success: false, message: "Something went wrong" });
  }
});

module.exports = router;
