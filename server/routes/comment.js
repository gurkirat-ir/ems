const router = require("express").Router();
const Comment = require("../model/comment");
const Task = require("../model/task");

/**
 * @name /new/:task
 * @method POST
 * @description Router to add new comment to a task
 */
router.post("/new/:task", async (req, res) => {
  try {
    // check if not logged in hr
    if (req.session.uid && req.session.role != "hr") {
      // find task by id
      let task = await Task.findById(req.params.task);

      // check if task not exists
      if (!task) {
        // send false response
        res.json({
          success: false,
          message: "Invalid task ID",
          task: req.params.task
        });
        return;
      }

      // instancing new comment object
      let comment = new Comment();

      // assigning data to fields
      comment.who = req.session.uid;
      comment.what = req.body.content;
      comment.task = req.params.task;

      // saving comment document
      await comment.save();

      // adding comment to task
      task.comments.push(comment._id);

      // saving task
      await task.save();

      // sending response
      res.json({ success: true, message: "Posted" });
    }
  } catch (error) {
    // sending error response
    res.json({ success: false, message: "Something went wrong" });
  }
});

/**
 * @name /all/:task
 * @method GET
 * @description Router to get all comments of a task
 */
router.get("/all/:task", async (req, res) => {
  try {
    // check if user is not logged in as hr
    if (req.session.uid && req.session.role != "hr") {
      // find comments
      let comments = await Comment.find(
        // by task id
        { task: req.params.task },
        // suppress task in output
        { task: false }
      )
        // populate "who" field and suppress all fields except name, email
        .populate("who", { name: true, email: true });
      // send response
      res.json({ success: true, comments });
    } else {
      // send error response
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

module.exports = router;
