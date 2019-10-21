const router = require("express").Router();
const Project = require("../model/project");
const Task = require("../model/task");
const User = require("../model/user");
const Comment = require("../model/comment");

/**
 * @name /new/:pid
 * @method POST
 * @description Router to post new task for project
 */
router.post("/new/:pid", async (req, res) => {
  try {
    // checking if logged in as employer
    if (req.session.uid && req.session.role == "employer") {
      // find project by _id
      let project = await Project.findById(req.params.pid);

      // get deadlines
      let proj_dl = new Date(project.deadline);
      let task_dl = new Date(req.body.deadline);
      let time_tk = new Date(req.body.timeTaken);

      // check if task deadline is greater than project deadline
      if (task_dl.getTime() > proj_dl.getTime()) {
        // send error response
        res.json({
          success: false,
          message: "Task deadline can not exceed project deadline"
        });
        return;
      }

      // check if task time taken is greater than task deadline
      if (time_tk.getTime() > task_dl.getTime()) {
        // send error response
        res.json({
          success: false,
          message: "Time taken can not exceed task deadline"
        });
        return;
      }

      // instantiate task
      let task = new Task();

      // assigning data to fields
      task.title = req.body.title;
      task.description = req.body.description;
      task.deadline = req.body.deadline;
      task.project = req.params.pid;
      task.empAssigned = req.body.empAssigned;
      task.timeTaken = req.body.timeTaken;

      // find project and update
      await Project.findByIdAndUpdate(req.params.pid, {
        // add to the set of Tasks and Employee assigned
        $addToSet: { tasks: task._id, empAssigned: req.body.empAssigned }
      });

      // find user and update
      await User.findByIdAndUpdate(req.body.empAssigned, {
        // add project
        $addToSet: { projAssigned: req.params.pid }
      });

      // send response
      res.json({
        success: true,
        message: "Created",
        task: task._id,
        project: req.params.pid
      });
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
 * @name /one/:pid/:tid,
 * @method DELETE
 * @description Router to
 */
router.delete("/one/:pid/:tid", async (req, res) => {
  try {
    // checking if logged in as employer
    if (req.session.uid && req.session.role == "employer") {
      // find task by _id and delete
      await Task.findByIdAndDelete(req.params.tid);

      // find project and update
      await Project.findByIdAndUpdate(req.params.pid, {
        // pull out task
        $pull: { tasks: req.params.tid }
      });

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
 * @description Router to get all tasks
 */
router.get("/all", async (req, res) => {
  try {
    // checking if logged in as employer
    if (req.session.uid && req.session.role == "employer") {
      // find all tasks and suppres some fields
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
        // sort in descending order by createdOn
        .sort("-createdOn")
        // populate empAssigned with only name
        .populate("empAssigned", { name: true })
        // populate project with only title
        .populate("project", { title: true });

      // send  response
      res.json({ success: true, tasks });
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
 * @name /one/:pid/:tid
 * @method GET
 * @description Router to get one task based on project
 */
router.get("/one/:pid/:tid", async (req, res) => {
  try {
    // checking if not logged in as hr
    if (req.session.uid && req.session.role != "hr") {
      // make the document for query
      let doc = { _id: req.params.tid, project: req.params.pid };

      // if user logged in as employee
      if (req.session.role == "employee") {
        // add one more field
        doc.empAssigned = req.session.uid;
      }

      // find the task
      let task = await Task.findOne(doc)
        // populate project with title
        .populate("project", { title: true })
        // populate empAssigned with name and email
        .populate("empAssigned", { name: true, email: true })
        // populate comments
        .populate({
          path: "comments",
          // supress task
          select: { task: false },
          // and populate user with name and email
          populate: { path: "who", select: { name: true, email: true } }
        });

      // send response
      res.json({ success: true, task });
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
 * @name /one/:pid/:tid/status
 * @method PUT
 * @description Router to update task status
 */
router.put("/one/:pid/:tid/status", async (req, res) => {
  try {
    // checking if not logged in as hr
    if (req.session.uid && req.session.role != "hr") {
      // instantiating new comment object
      let comment = new Comment({
        who: req.session.uid,
        what: `Marked task as '${req.body.status}'`,
        task: req.params.tid
      });

      // check user input
      if (req.body.status == "COMPLETED") {
        // find task and update
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
        // save comment
        await comment.save();
      } else {
        // find task and update
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
        // save comment
        await comment.save();
      }

      // send response
      res.json({ success: true, message: "Status Updated" });
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
 * @name /one/:pid/:tid
 * @method PUT
 * @description Router to update task details
 */
router.put("/one/:pid/:tid", async (req, res) => {
  try {
    // checking if not logged in as hr
    if (req.session.uid && req.session.role != "hr") {
      // find project
      let project = await Project.findById(req.params.pid);

      // pick out deadlines
      let proj_dl = new Date(project.deadline);
      let task_dl = new Date(req.body.deadline);
      let time_tk = new Date(req.body.timeTaken);

      // check if task deadline is greater than project deadline
      if (task_dl.getTime() > proj_dl.getTime()) {
        // send error response
        res.json({
          success: false,
          message: "Task deadline can not exceed project deadline"
        });
        return;
      }

      // check if task time taken is greater than task deadline
      if (time_tk.getTime() > task_dl.getTime()) {
        // send error response
        res.json({
          success: false,
          message: "Time taken can not exceed task deadline"
        });
        return;
      }

      // find task and update
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
 * @name /my
 * @method GET
 * @description Router to get all the tasks assigned to employee
 */
router.get("/my", async (req, res) => {
  try {
    // checking if logged in as employee
    if (req.session.uid && req.session.role == "employee") {
      // find all tasks assigned to currently logged in employee
      let tasks = await Task.find(
        { empAssigned: req.session.uid },
        {
          title: true,
          project: true,
          createdOn: true,
          deadline: true,
          status: true
        }
      )
        // populate project with title
        .populate("project", { title: true });

      // send  response
      res.json({ success: true, tasks });
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
