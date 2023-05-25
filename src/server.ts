import express, { Request, Response, NextFunction } from "express";
import db from "./config/db";
import apiV1Routes from "./routes/v1/apiV1Routes";
import errorHandler from "./middleware/error";
import socketConnection from "./sockets/socketConnection";
const { executeGitPull } = require('./utils/executeGitPull.ts');
const dotenv = require("dotenv");
const colors = require("colors");
const fileUpload = require("express-fileupload");
const morgan = require("morgan");
// const { cronJobs } = require(('./utils/cronJobs.js'));
const path = require("path");
const cors = require("cors");
const nodemon = require("nodemon");
// Routes
//const middlewares
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
// setup socket.io
const { Server } = require("socket.io");

dotenv.config();

// Connect to database
db();

const app = express();

const PORT = process.env.PORT || 5000;
// cronJobs();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// using this allows us to accept body data
app.use(express.json({ 

}));
app.use(fileUpload());

// This is to help with CORS issues, we dont want to allow anyone but a select group to access routes
// app.use(cors(corsOptionsDelegate));
app.use(cors());

//init middlewares
//sanitize data
app.use(mongoSanitize({}));
//prevent XSS attacks
app.use(xss());
//prevent http paramter pollution
app.use(hpp());

// Define Routes

app.use("/api/v1", apiV1Routes);
app.post('/webhook', (req, res) => {
  // Process the webhook payload and execute Git pull
  executeGitPull();
  // Restart the server
  restartServer(() => {
    console.log('Server restarted successfully!');
    // Respond with a success status
    return res.sendStatus(200);
  });
});

// Function to restart the server
function restartServer(callback: any) {
  nodemon.restart();
  callback();
}

// Init Middleware
// Has to be after routes, or the controllers cant use the middleware
app.use(errorHandler);
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req: Request, res: Response) => {
  res.send("API is running... Shepherds of Christ Ministries");
});

const server = app.listen(PORT, () => {
  console.log(colors.yellow(`Server has started on port: ${PORT}, in ${process.env.NODE_ENV}`));
})

const io = new Server(server, {
  cors: {
    origin: "*",
  },
  pingTimeout: 60000,
});

socketConnection(io);
