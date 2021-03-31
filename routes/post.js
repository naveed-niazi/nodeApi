//middleware routing
const { request } = require('express');
const express = require('express');
const { getPosts, createPost, postByUser, postById,
    isPoster, deletePost, updatePost, getPost, postPhoto,
likePost, unlikePost, comment, unComment} = require('../controllers/post');
const { userById } = require('../controllers/user');
const { requireSignin } = require('../controllers/auth');
const { postValidator } = require('../validators/validator');

const router = express.Router();


// all the posts will be shown on this route
router.get('/posts', getPosts);

//like unlike
router.put('/post/like', requireSignin, likePost);
router.put('/post/unlike', requireSignin, unlikePost);
//comments
router.put('/post/comment', requireSignin, comment);
router.put('/post/uncomment', requireSignin, unComment);

//single post data
router.get('/post/:postId', getPost);


//photo
router.get('/post/photo/:postId', postPhoto)
// all the post of the user on this route
router.get('/post/by/:userId', requireSignin, postByUser);

router.post('/post/new/:userId', requireSignin,  createPost, postValidator);
router.delete('/post/:postId', requireSignin, isPoster, deletePost);
router.put('/post/:postId', requireSignin, isPoster, updatePost);




router.param('userId', userById);
router.param('postId' , postById);


module.exports = router;