//all the user authentications methods will be inside this controller
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
require('dotenv').config();

//signup function to create new users

exports.signup=async(req, res)=>{
    //first we will check if the user already exists based on the email
    const userExists= await User.findOne({email:req.body.email});
    if(userExists)  return res.status(409).json({error:'email is taken'});
    //now we create a new user
    const user= await new User(req.body);
    await user.save();
    //and return the user in response as well
    return res.status(200).json({Message:'Signup success. Please Login!'});
};

//signin function to Login the user

exports.signin=(req, res)=>{
    // find user based on email and verifying credentials
    const {email, password} =req.body;
    User.findOne({email},(err,user)=>{
        //if not exist
        if(err, !user){
            return res.status(401).json({error:'User not found, Please Signup!'});
        }
        //exist so now authenticate
        //if user authentication fails
        if(!user.authenticate(password))
        {
            return res.status(401).json({error:'email or password is incorrect'});
        }
        // if authentication was succesful
        // generate a token now
        const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET);

        res.cookie('t',token, {expire:new Date ()+9999});
        
        const {_id,  username , email} = user;

        return res.json({
            token,
            user:{
                email,
                username,
                _id    
            },
            Message:'Successful Login'
        });
         
    });
};
//for user signout
exports.signout=(req,res)=>{
    // clearing the token that assured the signin from cache
    res.clearCookie('t');
    return res.status(200).json({message: 'signout success'});
};
// to find out if signin is required or not
exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty:"auth",
    algorithms: ['HS256']
});
