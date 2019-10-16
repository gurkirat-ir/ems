const router = require("express").Router();
const Project = require("../model/project");
const User = require("../model/user");
const Task = require("../model/task");

router.post("/new", async (req, res) => {
  try {
    if (req.session.uid && req.session.role == "employer") {
      let project = new Project();
      project.title = req.body.title;
      project.description = req.body.description;
      project.deadline = req.body.deadline;

      await project.save();
      console.log(project.deadline);

      res.json({ success: true, message: "Posted", id: project._id });
    } else {
      res.json({ success: false, message: "Unauthorize access" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

router.all("/all", async (req, res) => {
  try {
    if (req.session.uid && req.session.role == "employer") {
      let projects = await Project.find(
        {},
        {
          title: true,
          deadline: true,
          status: true,
          tasks: true
        }
      ).sort("-createdOn");
      projects = projects.map(v => ({
        _id: v._id,
        title: v.title,
        deadline: v.deadline,
        createdOn: v.createdOn,
        num_tasks: v.tasks.length,
        status: v.status
      }));
      res.json({ success: true, projects });
    } else {
      res.json({ success: false, message: "Unauthorize access" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

router.get("/my", async (req, res) => {
  try {
    if (req.session.uid && req.session.role == "employee") {
      let projects = await User.findById(req.session.uid).populate(
        "projAssigned",
        { title: true, deadline: true, createdOn: true, status: true }
      );
      res.json({ success: true, projects });
    } else {
      res.json({ success: false, message: "Unauthorize access" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

router.delete("/one/:pid", async (req, res) => {
  try {
    if (req.session.uid && req.session.role == "employer") {
      let proj = await Project.findByIdAndDelete(req.params.pid);

      await Task.deleteMany({ project: proj._id });
      await User.updateMany({}, { $pull: { projAssigned: proj._id } });

      res.json({ success: true, message: "Deleted" });
    } else {
      res.json({ success: false, message: "Unauthorize access" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

router.get("/one/:pid", async (req, res) => {
  try {
    if (req.session.uid && req.session.role == "employer") {
      let proj = await Project.findById(req.params.pid)
        .populate("tasks", {
          project: false,
          empAssigned: false,
          description: false,
          comments: false
        })
        .populate("empAssigned", { email: true, name: true });

      res.json({ success: true, projects: proj });
    } else {
      res.json({ success: false, message: "Unauthorize access" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Something went wrong" });
  }
});

router.put("/one/:pid", async (req, res) => {
  try {
    if (req.session.uid && req.session.role == "employer") {
      let proj = await Project.findByIdAndUpdate(req.params.pid, {
        title: req.body.title,
        description: req.body.description,
        deadline: req.body.deadline,
        status: req.body.status
      });
      await Task.updateMany({ project: proj._id }, { status: req.body.status });
      res.json({ success: true, message: "Updated" });
    } else {
      res.json({ success: false, message: "Unauthorize access" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

module.exports = router;
