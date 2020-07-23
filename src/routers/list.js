const express = require("express")
const List = require("../models/list")
const router = new express.Router()
const auth = require("../middleware/auth")

router.get("/lists", auth, async (req, res) => {
    try {
        const lists = await List.find({ author: req.user._id })
        res.send(lists)
    } catch (e) {
        res.status(404).send()
    }
})

router.get("/lists/:id", auth, async (req, res) => {
    try {
        const list = await List.findById({ _id: req.params.id })
        if (!list) {
            return res.status(404).send()
        }
        await list.populate("author").execPopulate()
        await list.populate("subscribers").execPopulate()

        res.send(list)
    } catch (e) {
        res.status(500).send()
    }
})

router.post("/lists", auth, async (req, res) => {
    try {
        const list = new List(req.body)
        // await list.save()
        list.saveListAuthorAndSubscribe(req.user)
        res.send(list)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch("/lists/:id", auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["subscribers", "items"]
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid Updates" })
    }

    try {
        const list = await List.findById(req.params.id)
        updates.forEach(update => {
            list[update] = req.body[update]
        })

        await list.save()

        if (!list) {
            return res.status(400).send()
        }

        res.send(list)

    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete("/lists/:id", auth, async (req, res) => {
    try {
        const list = await List.findByIdAndDelete(req.params.id)

        if (!list) {
            return res.status(404).send()
        }

        res.send(list)

    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router