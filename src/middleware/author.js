const List = require("../models/list")

const author = async function (req, res, next) {
    try {
        const list = await List.findById(req.params.id)

        if (list.author != req.user._id.toString()) {
            throw new Error()
        }

        req.list = list
        next()
    } catch (e) {
        res.status(401).send()
    }
}

module.exports = author