const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const config = require("config");

const app = express();

// BODY PARSER MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// COOKIE MIDDLEWARE
app.use(cookieParser());
app.use(
  session({
    secret: "mySecretKey",
    resave: false,
    saveUninitialized: true
  })
);

if (!config.get("apiKey")) {
  console.error("FATAL ERROR! API key not provided");
  process.exit(1);
}

const port = process.env.PORT || 3000;

const server = app.listen(port, () =>
  console.log(`Server started at PORT ${port}`)
);
require("./services/socket")(socket(server));
