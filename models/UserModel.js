const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Your Name"],
        maxLength: [30, "NAME CANNOT EXCEED 30 Characters"],
        minLength: [4, "NAME CANNOT be less than 4 Characters"],
    },
    linkedin: {
        type: String,
        required: [true, "Please Provide LinkedIn Profile Link"],
    },
    details: {
        type: String,
        required: [true, "Please Provide Some Details about Yourself"],
    },
    works: {
        type: String,
        required: [true, "Please Share Your Work Experience"],
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        validate: [validator.isEmail, "Please Enter a Valid Email"],
    },
    password: {
        type: String,
        required: [true, "Password is Required"],
        minLength: [8, "Password cannot be less than 8 characters"],
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
            required: [true, "Please Enter Avatar ID"]
        },
        url: {
            type: String,
            required: [true, "Please Enter Avatar URL"]
        }
    },
    role: {
        type: String,
        default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // Google Login Fields
    googleId: {
        type: String,
        unique: true,
    },
    googleEmail: {
        type: String,
        unique: true,
        sparse: true,
    },
    googleAvatar: {
        type: String,
    },
});

// Pre-save Hook for Password Encryption
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// JWT Token for Authentication
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Compare Password Method
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Password Reset Token Method
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};

// Model for User
const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
