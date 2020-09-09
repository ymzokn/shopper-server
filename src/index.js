const express = require("express")
require("./db/mongoose")
var cors = require('cors');
const app = express()
const port = process.env.PORT || 3000
const userRouter = require("./routers/user")
const listRouter = require("./routers/list")

app.use(cors());
app.use(express.json())
app.use(userRouter)
app.use(listRouter)

app.listen(port, () => {
    console.log("Server is up and running on port " + port)
})