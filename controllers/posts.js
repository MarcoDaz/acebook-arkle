const Post = require("../models/post");
const Comment = require("../models/comment");
const User = require("../models/user");

const PostsController = {
  Index: (req, res) => {
    // find all posts
    Post.find((err, posts) => {
      if (err) {
        throw err;
      }

      // posts = [ post1, post2 ]
      // find all matching users
      posts.forEach((post, index) => {
        User.findById(post.userId).then((user) => {
          // 1. convert image into base 64 and save in post
          posts[index].image = user.image.data.toString("base64");

          // 2. save name in post
          posts[index].name = user.firstName;
        });
      });

      res.render("posts/index", { posts: posts });
    });
  },
  New: (req, res) => {
    res.render("posts/new", {});
  },

  Create: (req, res) => {
    const post = new Post({
      message: req.body.message,
      userId: req.session.user._id,
    });

    post.save((err) => {
      if (err) {
        throw err;
      }

      res.status(201).redirect("/posts");
    });
  },
  View: async (req, res) => {
    const postId = req.params.id;
    // find the relevant post
    const post = await Post.findById(postId).exec();
    console.log(post);

    /// find the postUser
    const postUser = await User.findById(post.userId).exec();
    const postUserImage = postUser.image.data.toString('base64');

    // find the relevant comments
    const comments = await Comment.find(
      { postId: postId }
    ).exec();
    comments.reverse();
    console.log(comments);

    // find the matching comment users
    const users = await Promise.all(comments.map(async (comment) => {
      const foundUser = await User.findById(comment.userId).exec();
      return foundUser;
    }));
    users.map((user, i) => {
      comments[i].user = {
      firstName: user.firstName, image: user.image.data.toString('base64')
      };
    });

    res.render("posts/post", {
      post: post,
      postUser: postUser,
      postUserImage: postUserImage,
      comments: comments,
    });
  },
  CreateComment: (req, res) => {
    // req.body = { newComment: 'comment from form' }
    if (req.body.newComment.trim().length === 0) {
      res.status(201).redirect(req.get("referer"));
      return "";
    }

    const comment = new Comment({
      message: req.body.newComment,
      postId: req.params.id,
      userId: req.session.user._id
    });

    comment.save((err) => {
      if (err) {
        throw err;
      }
    });

    res.status(201).redirect(req.get("referer"));
  },

  LikesCounter: (req, res, next) => {
    const action = req.body.action;
    const counter = action === "Like" ? 1 : -1;
    Post.updateOne(
      { _id: req.params.id },
      { $inc: { likes_count: counter } },
      {},
      (err, numberAffected) => {
        // res.send('');
      }
    );
    //});
    //  res.render("posts/", {});
    res.redirect("/posts");
  },
};

module.exports = PostsController;
