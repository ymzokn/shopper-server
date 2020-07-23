const User = require("../models/user")
const jwt = require("jsonwebtoken")

const auth = async function (req, res, next) {
    try {
        const secret = process.env.JWT_SECRET || "THISISMYJWTSECRET"
        const token = req.headers.authorization.replace("Bearer ", "")
        const decoded = jwt.verify(token, secret)
        const user = await User.findOne({ _id: decoded._id, "tokens.token": token })
        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ error: "Authentication required" })
    }
}

module.exports = auth