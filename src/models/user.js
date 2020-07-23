const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const validator = require("validator")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    tokens: [
        {
            token: {
                type: String
            }
        }
    ]
})

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const secret = process.env.JWT_SECRET || "THISISMYJWTSECRET"
    const token = jwt.sign({ _id: user._id.toString() }, secret, { expiresIn: "12 hours" })
    user.tokens = [...user.tokens, { token }]

    await user.save()

    return token
}

userSchema.statics.findByCredentials = async function (username, password) {
    try {
        const user = await User.findOne({ username })
        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = await user.generateAuthToken()
            return token
        } else {
            throw new Error()
        }
    } catch (e) {
        throw new Error()
    }
}

userSchema.pre("save", async function (next) {
    const user = this

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model("User", userSchema)

module.exports = User
