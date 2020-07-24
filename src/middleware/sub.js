const List = require("../models/list")

const sub = async function (req, res, next) {
    try {
        const list = await List.findById(req.params.id)

        if (!list.subscribers.includes(req.user._id.toString())) {
            throw new Error()
        }

        req.list = list
        next()
    } catch (e) {
        return res.status(401).send()
    }
}

module.exports = sub