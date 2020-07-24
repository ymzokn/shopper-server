const express = require("express")
const User = require("../models/user")
const router = express.Router()
const auth = require("../middleware/auth")

router.post("/register", async (req, res) => {
    try {
        const user = new User(req.body)
        await user.save()

        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })

    } catch (e) {
        res.status(400).send()
    }
})

router.post("/login", async (req, res) => {
    try {
        const token = await User.findByCredentials(req.body.username, req.body.password)
        res.send(token)
    } catch (e) {
        res.status(401).send({ error: "Invalid Login" })
    }
})

router.post("/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            token.token !== req.token
        })

        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post("/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = []
        req.user.token = {}
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.patch("/users/profile", auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["password"]
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send()
    }

    const user = await User.findByIdAndUpdate(req.user._id)
    try {
        updates.forEach(update => {
            user[update] = req.body[update]
        })
        await user.save()
        return res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

router.delete("/users/profile", auth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id)

        res.send(user)
    } catch (e) {
        res.send(500).send()
    }
})

module.exports = router