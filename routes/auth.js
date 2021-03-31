//in this file we create all the routes related to user login / signup

//midware routing
const express = require('express');
const {signup, signin, signout}=require('../controllers/auth');
const {userById} = require('../controllers/user');
const {userSignupValidator} =require('../validators/validator');

const router=express.Router();

router.post('/signup', userSignupValidator ,signup);
router.post('/signin' ,signin);
router.get('/signout' ,signout);

router.param('userId' , userById);
module.exports=router;