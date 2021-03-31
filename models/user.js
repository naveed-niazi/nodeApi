const mongoose = require("mongoose");
const uuidv1 = require('uuid/v1');
const crypto = require('crypto');
const { min } = require("lodash");
const { ObjectId } = mongoose.Schema


const userSchema = mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true
    },
    hashed_password: {
        type: String,
        required: true
    },
    salt: String,
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date,
    photo: {
        data: Buffer,
        contentType: String
    },
    about: {
        type: String,
        trim: true
    },
    following: [{ type: ObjectId, ref: "User" }],
    followers: [{ type: ObjectId, ref: "User" }]
});

/**
 * we will be using virtual fields, these fields are aditional and
 * can be filled automatically  with defined functionality
 * or set manually
 * logically theyy won't be available in database
 */
// now defining the virtual part of the code
// so we are bascially setting everything inside the field
userSchema.virtual('password')
    .set(function (password) {
        //creating a temporary variable to store parameter values for the function
        this._password = password;
        //generating a timestamp
        this.salt = uuidv1();
        //now we will encrypt the password
        this.hashed_password = this.encryptPassword(password);
        // now hashed password is store the encrypted password
    })
    // and getting the  original password **not sure what is happening in that time line as i wasn't sure that it will 
    // this is not the purpose as I wasn't foint 
    .get(function () {
        return this._password;
    })//cant understand what this is doing

//adding methods to the model / schema

userSchema.methods = {
    //method to authenticate user
    authenticate: function (plaintext) {
        return this.encryptPassword(plaintext) === this.hashed_password;
    },

    // adding method to encrypt password
    encryptPassword: function (password) {
        if (!password) return "";
        try {
            return crypto.createHmac("sha256", this.salt)
                .update(password)
                .digest("hex");
        } catch (err) {
            return "";
        };
    }
}

module.exports = mongoose.model('User', userSchema);

