var mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

var { Schema } = mongoose;

var UserSchema = new Schema({
    username: {
        type: String,
        default: '',
        unique:[true,'username is required']
    },
    email: {
        type:String,
        unique:true,
        sparse:true,
        validate(value){
            if(! validator.isEmail(value)){
                throw new Error('Email is invalid');
            }
        }
    },
    password: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: ''
    },
    emailVerified: {
        type: Boolean
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            },
        },
    ],
    googleAccessToken:String,
    googleRefreshToken:String,
    googleId: String,
    
    expiresIn:String
});

UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.__v;

    return userObject;
};

UserSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign(
        { _id: user._id.toString(), username: user.username.toString(), fullname: user.name.toString() },
        process.env.JWT_SECRET
    );

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
};

UserSchema.statics.findByCredentials = async (username,password) => {
    var user;
    if(!validator.isEmail(username)){
     user = await User.findOne({
            username:username,
        });
    }else{
        user = await User.findOne({
            email:username,
        });
    }
  

    if (!user) {
        throw new Error('User does not found, Please Register');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Wrong Password, Please Try again');
    }

    return user;
};

// Hash the plain text password before saving
UserSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;