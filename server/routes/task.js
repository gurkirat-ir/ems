const router = require("express").Router();
const Project = require("../model/project");
const Task = require("../model/task");
const User = require("../model/user");
const Comment = require("../model/comment");

router.post("/new/:pid", async (req, res) => {
  try {
    if (req.session.uid && req.session.role == "employer") {
      let project = await Project.findById(req.params.pid);
      let proj_dl = new Date(project.deadline);
      let task_dl = new Date(req.body.deadline);
      let time_tk = new Date(req.body.timeTaken);

      if (task_dl.getTime() > proj_dl.getTime()) {
        res.json({
          success: false,
          message: "Task deadline can not exceed project deadline"
        });
        return;
      }

      if (time_tk.getTime() > task_dl.getTime()) {
        res.json({
          success: false,
          message: "Time taken can not exceed task deadline"
        });
        return;
      }

      let task = await new Task({
        title: req.body.title,
        description: req.body.description,
        deadline: req.body.deadline,
        project: req.params.pid,
        empAssigned: req.body.empAssigned,
        timeTaken: req.body.timeTaken
      }).save();

      await Project.findByIdAndUpdate(req.params.pid, {
        $addToSet: { tasks: task._id, empAssigned: req.body.empAssigned }
      });
      await User.findByIdAndUpdate(req.body.empAssigned, {
        $addToSet: { projAssigned: req.params.pid }
      });

      res.json({
        success: true,
        message: "Created",
        task: task._id,
        project: req.params.pid
      });
    } else {
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

router.delete("/one/:pid/:eid", async (req, res) => {
  try {
    if (req.session.uid && req.session.role == "employer") {
      await Task.findByIdAndDelete(req.params.eid);
      await Project.findByIdAndUpdate(req.params.pid, {
        $pull: { tasks: req.params.eid }
      });

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
    if (req.session.uid && req.session.role == "employer") {
      let tasks = await Task.find(
        {},
        {
          project: true,
          title: true,
          empAssigned: true,
          createdOn: true,
          deadline: true,
          status: true
        }
      )
        .sort("-createdOn")
        .populate("empAssigned", { name: true })
        .populate("project", { title: true });

      res.json({ success: true, tasks });
    } else {
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

router.get("/one/:pid/:tid", async (req, res) => {
  try {
    if (req.session.uid && req.session.role != "hr") {
      let doc = { _id: req.params.tid, project: req.params.pid };
      if (req.session.role == "employee") {
        doc.empAssigned = req.session.uid;
      }
      let task = await Task.findOne(doc)
        .populate("project", { title: true })
        .populate("empAssigned", { name: true, email: true })
        .populate({
          path: "comments",
          select: { task: false },
          populate: { path: "who", select: { name: true, email: true } }
        });

      res.json({ success: true, task });
    } else {
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

router.put("/one/:pid/:tid/status", async (req, res) => {
  try {
    if (req.session.uid && req.session.role != "hr") {
      let comment = new Comment({
        who: req.session.uid,
        what: `Marked task as '${req.body.status}'`,
        task: req.params.tid
      });

      if (req.body.status == "COMPLETED") {
        //
        await Task.findOneAndUpdate(
          {
            project: req.params.pid,
            _id: req.params.tid
          },
          {
            completedOn: new Date(),
            status: req.body.status,
            $push: { comments: comment._id }
          }
        );
        //
        await comment.save();
      } else {
        //
        await Task.findOneAndUpdate(
          {
            project: req.params.pid,
            _id: req.params.tid
          },
          {
            completedOn: null,
            status: req.body.status,
            $push: { comments: comment._id }
          }
        );
        //
        await comment.save();
      }
      //
      res.json({ success: true, message: "Status Updated" });
    } else {
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

router.put("/one/:pid/:tid", async (req, res) => {
  try {
    if (req.session.uid && req.session.role != "hr") {
      let project = await Project.findById(req.params.pid);
      let proj_dl = new Date(project.deadline);
      let task_dl = new Date(req.body.deadline);
      let time_tk = new Date(req.body.timeTaken);

      if (task_dl.getTime() > proj_dl.getTime()) {
        res.json({
          success: false,
          message: "Task deadline can not exceed project deadline"
        });
        return;
      }

      if (time_tk.getTime() > task_dl.getTime()) {
        res.json({
          success: false,
          message: "Time taken can not exceed task deadline"
        });
        return;
      }

      await Task.findOneAndUpdate(
        { _id: req.params.tid, project: req.params.pid },
        {
          title: req.body.title,
          empAssigned: req.body.empAssigned,
          timeTaken: req.body.timeTaken,
          deadline: req.body.deadline,
          description: req.body.description
        }
      );

      res.json({ success: true, message: "Updated" });
    } else {
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

router.get("/my", async (req, res) => {
  try {
    if (req.session.uid && req.session.role == "employee") {
      let tasks = await Task.find(
        { empAssigned: req.session.uid },
        {
          title: true,
          project: true,
          createdOn: true,
          deadline: true,
          status: true
        }
      ).populate("project", { title: true });
      res.json({ success: true, tasks });
    } else {
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});
module.exports = router;
