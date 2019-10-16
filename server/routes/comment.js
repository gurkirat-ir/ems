const router = require("express").Router();
const Comment = require("../model/comment");
const Task = require("../model/task");

router.post("/new/:task", async (req, res) => {
  try {
    if (req.session.uid && req.session.role != "hr") {
      let task = await Task.findById(req.params.task);
      if (!task) {
        res.json({
          success: false,
          message: "Invalid task ID",
          task: req.params.task
        });
        return;
      }
      let comment = new Comment();
      comment.who = req.session.uid;
      comment.what = req.body.content;
      comment.task = req.params.task;

      await comment.save();
      task.comments.push(comment._id);
      await task.save();
      res.json({ success: true, message: "Posted" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

router.get("/all/:task", async (req, res) => {
  try {
    if (req.session.uid && req.session.role != "hr") {
      let comments = await Comment.find(
        { task: req.params.task },
        { task: false }
      ).populate("who", { name: true, email: true });
      res.json({ success: true, comments });
    } else {
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

router.delete("/one/:task/:comment", async (req, res) => {
  try {
    if (req.session.uid && req.session.role != "hr") {
      let task = await Task.findById(req.params.task);
      if (!task) {
        res.json({
          success: false,
          message: "Invalid task ID",
          task: req.params.task
        });
        return;
      }
      await Comment.findByIdAndDelete(req.params.comment);
      await Task.findByIdAndUpdate(req.params.task, {
        $pull: { comments: req.params.comment }
      });

      res.json({ success: false, message: "Updated" });
    } else {
      res.json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
});

module.exports = router;
