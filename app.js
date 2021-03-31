const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fs = require("fs");

const expressValidator = require("express-validator");
const dotenv = require("dotenv");
dotenv.config();

//database
mongoose
  .connect(process.env.MONGO_URI,
    { useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("DB connected"));
mongoose.connection.on(
  "error",
  console.error.bind(console, "MongoDB connection error:")
);

//bring in routes
const postRoutes = require("./routes/post");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
// api documentation
app.get("/", (req, res) => {
  fs.readFile("Docs/apiDocs.json", (err, data) => {
    if (err) {
      res.status(400).json({ error: err });
    }
    const docs = JSON.parse(data);
    res.json(docs); 
  });
});

//middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());
app.use("/", postRoutes);
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: "Unauthorized Request" });
  }
});

// simulate delay response
// app.use((req, res, next) => {
//     setTimeout(() => next(), 9000000);
// });

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`A Node Js API is listening at port: ${port}`)
);
