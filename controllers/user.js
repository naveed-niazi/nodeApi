const User = require('../models/user');
const formidable = require('formidable');
const fs = require('fs');
const e = require('express');



exports.userById = (req, res, next, id) => {
    User.findById(id)
        //populate flowers and followings 
        .populate('following', '_id username')
        .populate('followers', '_id username')
        .exec((err, user) => {
            if (err || !user) {
                return res.json({ error: 'User not Found!' })
            }
            user.salt = undefined;
            user.hashed_password = undefined;
            req.profile = user; //adding a parameter object of profile with info about user in the req
            next();
        });
};

exports.hasAuthorization = (req, res, next) => {
    const authorized = req.profile && req.auth && req.profile._id === req.auth._id
    if (!authorized) {
        return res.status(403).json({ error: 'Not authorized to access that post' });
    }
};

exports.allUsers = (req, res) => {
    User.find((err, users) => {
        //if it fails to get all the users
        if (err) {
            return res.status(400).json()({ error: "unable to find users" })
        }
        //now that we have dealt with all the errors we can return all the users as jason response
        res.json(users);
    }).select("username email");
}

exports.getUser = (req, res) => {
    return res.json(req.profile);
}

exports.updateUser = (req, res, next) => {
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
        // save user
        let user = req.profile;
        if (fields.username.length < 4) {
            return res.json({ error: "Name is invalid" })
        } else user.username = fields.username;
        if (!(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(fields.email))) {
            return res.json({ error: "Email is invalid" })
        } else user.email = fields.email;
        if (!fields.password) {
            return res.json({ error: "Password Required" })
        } else { user.password = fields.password }
        if (fields.about) {
            user.about = fields.about
        }

        user.updated = Date.now();
        if (files.photo) {
            user.photo.data = fs.readFileSync(files.photo.path);
            user.photo.contentType = files.photo.type;
        }
        console.log('--------------------', user)
        user.save((err, user) => {
            if (err) {
                console.log(err)
                return res.status(400).json({ error: "unable to update profile" });
            }
            user.hashed_password = undefined;
            user.salt = undefined;
            user.photo = undefined;
            // console.log("user after update with formData: ", user);
            res.json(user);
        });
    });
};
// exports.updateUser = (req, res) => {
//     if (req.body.username.length < 4)
//     {
//         return res.json({ error: "Name is invalid" })
//     }
//     if (!(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(req.body.email)))
//     {
//         return res.json({ error: "Email is invalid" })
//     }
//     User.findByIdAndUpdate(req.profile._id, req.body, (error, user) => {
//         if (error) {
//             return res.json(error)
//         }
//         console.log("I never appear here")
//         return res.json({ user })
//     })

// }
exports.deleteUser = (req, res, next) => {
    let user = req.profile;
    user.remove((err, user) => {
        if (err) {
            return res.status(400).json({ error: "Unable to delete user" });
        }
        res.json({ Message: `User ${user.username} has been deleted` });

    });
}

exports.userPhoto = (req, res, next) => {
    if (req.profile.photo.data) {
        res.set("Content-Type", req.profile.photo.contentType);
        res.set("Content-Disposition", "inline;");
        return res.send(req.profile.photo.data)
    }
    next()
};

//follow methods

exports.addFollowing = (req, res, next) => {
    User.findByIdAndUpdate(req.body.userId,
        { $push: { following: req.body.followId } },
        (err, result) => {
            if (err) {
                return res.status(400).json({ error: err })
            }
            next()
        })
};
exports.addFollower = (req, res) => {
    User.findByIdAndUpdate(
        req.body.followId,
        { $push: { followers: req.body.userId } },
        { new: true }
    )
        .populate('following', '_id name')
        .populate('followers', '_id name')
        .exec((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                })
            }
            result.hashed_password = undefined
            result.salt = undefined
            res.json(result)
        })
};

//unfollow

exports.removeFollowing = (req, res, next) => {
    User.findByIdAndUpdate(req.body.userId,
        { $pull: { following: req.body.unfollowId } },
        (err, result) => {
            if (err) {
                return res.status(400).json({ error: err })
            }
            next()
        })
};
exports.removeFollower = (req, res) => {
    User.findByIdAndUpdate(
        req.body.unfollowId,
        { $pull: { followers: req.body.userId } },
        { new: true }
    )
        .populate('following', '_id name')
        .populate('followers', '_id name')
        .exec((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                })
            }
            result.hashed_password = undefined
            result.salt = undefined
            res.json(result)
        })
};

exports.findPeople = (req, res) => {
    let notToFollow = req.profile.following
    notToFollow.push(req.profile.id)
    User.find({ _id: { $nin: notToFollow } }, (err, users) => {
        if (err)
            return res.status(400).json({ error: err })
        res.json(users)
    }).select('username')
}