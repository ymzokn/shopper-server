const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://okan:shopperDbUser@shopper-server.ci8gf.mongodb.net/shopper-server?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  }
);
