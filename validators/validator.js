const { request } = require("express");

exports.postValidator=(req,res,next)=>{
    // title validation
    req.check('title','Write a Title').notEmpty();
    req.check('title','Title should be between 4 and 50 characters').isLength({ min: 5,max: 49 });

    // body validation
    req.check('body','Write some passage').notEmpty();
    req.check('body','Message should be between 4 and 500 characters').isLength({ min: 5,max: 499 });

    //error checking
    const errors = req.validationErrors();
    // show the errors one by one as they happen
    if(errors)
    {
        const firstError= errors.map(error=>error.msg)[0];
        return res.status(400).json({error:firstError});
    }
    //proceed to next middleware
    next();
}

//creating validation for signup

exports.userSignupValidator=(req, res, next)=>{
    req.check('username','Name is Required').notEmpty();
    req.check('username','Username must be between 4 and 50 characters').isLength({min:5,max:49});

    req.check('email','Email is Required').notEmpty();
    req.check('email')
    .isLength({min:4, max:200})
    .withMessage('email is short')
    .matches(/.+\@.+\..+/)
    .withMessage('Email must contain @');
    req.check('password', 'Password is required').notEmpty();
    req.check('password')
    .isLength({min:6})
    .withMessage('Password must contain atleast 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number');

    //now we will check for errors
    const errors = req.validationErrors();
    // show the errors one by one as they happen
    if(errors)
    {
        const firstError= errors.map(error=>error.msg)[0];
        return res.status(400).json({error:firstError});
    }
    //proceed to next middleware
    next();
}