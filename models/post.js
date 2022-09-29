const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  message: String,
  userId: String,
  timeAdded: { type: Date, default: Date.now }
});

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
