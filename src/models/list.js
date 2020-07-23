const mongoose = require("mongoose")
const { ObjectID } = require("mongodb")
const listSchema = new mongoose.Schema({
    name: {
        type: String
    },
    items: [
        {
            name: {
                type: String,
                required: true
            },
            quantity: {
                type: String
            }
        },
    ],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    subscribers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }]
})

listSchema.methods.saveListAuthorAndSubscribe = async function (user) {
    try {
        const list = this
        list.author = user
        list.subscribers = [...list.subscribers, user]
        await list.save()
    } catch (e) {
        throw new Error()
    }
}

const List = mongoose.model("List", listSchema)

module.exports = List