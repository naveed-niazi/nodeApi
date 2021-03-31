// all the imports
const Post = require("../models/post");
const formidable = require("formidable");
const fs = require("fs");
var _ = require('lodash');

// all the controllers related to posts
exports.postById = (req, res, next, id) => {
  Post.findById(id)
    .populate('postedBy', '_id username')
    .populate('comments.postedBy', '_id username')
    .populate('postedBy', '_id username')
    .select('_id title body created likes comments photo')
    .exec((err, post) => {
      if (err || !post) {
        return res.status(400).json({
          error: err
        });
      }
      req.post = post;
      next();
    });
};


exports.getPosts = (req, res) => {
  // getting all the posts on the model
  const post = Post.find()
    .populate("postedBy", "username")
    .populate("comments", "text created")
    .populate("comments.postedBy", "_id username")
    .select("title body created likes")
    .sort({ created: -1 })
    .then((posts) => res.json(posts))
    .catch((err) => console.log(err));
};
exports.createPost = (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }
    let post = new Post(fields);

    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    post.postedBy = req.profile;

    if (files.photo) {
      post.photo.data = fs.readFileSync(files.photo.path);
      post.photo.contentType = files.photo.type;
    }
    post.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json(result);
    });
  });
};
exports.postByUser = (req, res) => {
  Post
    .find({ postedBy: req.profile._id })
    .populate("postedBy", "username")
    .select("title body created likes")
    .sort("created")
    .exec((err, posts) => {
      if (err) {
        return res.status(400).json({ error: "Unable to get posts" });
      }
      res.json(posts);
    });
};
exports.isPoster = (req, res, next) => {
  // using == because their datatype aren't same
  let isPoster = (req.post && req.auth && req.post.postedBy._id == req.auth._id);

  if (!isPoster) {
    res.status(401).json({ error: "Unauthorized to delete the post." });
  }
  next();
}
exports.updatePost = (req, res) => {
  let form = new formidable.IncomingForm();
  // console.log("incoming form data: ", form);
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: 'Photo could not be uploaded'
      });
    }
    console.log(fields);
    let post = req.post;
    post = _.extend(post, fields);
    post.updated = Date.now();
    if (files.photo) {
      post.photo.data = fs.readFileSync(files.photo.path);
      post.photo.contentType = files.photo.type;
    }
    post.save((err, post) => {
      if (err) {
        return res.status(400).json({ error: "unable to update post" });
      }
      res.json(post)
    })
    
    // post=_.extend(post, req.body);
    // console.log(`🚀 ~ file: post.js ~ line 83 ~ req.body`, req.body)
    // post.updated=Date.now;
    // post.save((err,post)=>{
    //     if(err){
    //         return res.status(400).json({error:err})
    //     }
    //     res.json(post);
    // });
  })
}
exports.deletePost = (req, res) => {
      let post = req.post;
      post.remove((err, post) => {
        if (err) {
          return res.status(400).json({ error: err })
        }
        res.status(200).json({ Message: "Post Deleted Successfully" });
      });
    }
exports.postPhoto = (req, res, next) => {
      res.set("Content-Type", req.post.photo.contentType)
      return res.send(req.post.photo.data)

    }
exports.getPost = (req, res) => {
      if (req.post) return res.json(req.post)
      else {
        res.json({ error: "post not found" })
      }

}
exports.likePost = (req, res) => {

  Post.findByIdAndUpdate(
    req.body.postId,
    { $push: { likes: req.body.userId } },
    { new: true }
  ).exec((err, result) => {
    if (err)
      return res.status(400).json({ error: err })
    else
      res.json(result)
  })

}
exports.unlikePost = (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    { $pull: { likes: req.body.userId } },
    { new: true }
  ).exec((err, result) => {
    if (err) 
      return res.status(400).json({ error: err })
    else
      res.json(result)
  })
}
exports.comment = (req, res) => {
  let comment = req.body.comment;
  comment.postedBy = req.body.userId;

  Post.findByIdAndUpdate(req.body.postId, { $push: { comments: comment } }, { new: true })
    .populate('comments.postedBy', '_id username')
    .populate('postedBy', '_id username')
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err
        });
      } else {
        res.json(result);
      }
    });
};

exports.unComment = (req, res) => {

  let comment = req.body.comment

  Post.findByIdAndUpdate(
    req.body.postId,
    { $pull: { comments: {_id:comment._id} } },
    { new: true }
  )
    .populate("comments.postedBy", "_id username")
    .populate('postedBy', '_id username')
    .exec((err, result) => {
      if (err)
        return res.status(400).json({ error: err })
      else
        res.json(result)
    })
}











