const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();

const app = express();

// require routers files
const userRouter = require("./routes/users.routes.js");
const uploadRouter = require("./routes/upload.routes.js");
const emailRouter = require("./routes/send-email.routes.js");
const brandingRouter = require("./routes/branding.routes.js");
const branchRouter = require("./routes/branch.routes.js");
const currencyRouter = require("./routes/currency.routes.js");
const loginRouter = require("./routes/login.routes.js");
const verifyRouter = require("./routes/verify.routes.js");
const customersRouter = require("./routes/customers.routes.js");
const findByAccountRouter = require("./routes/findByAccount.routes.js");
const transactionRouter = require("./routes/transaction.routes.js");
const transferRouter = require("./routes/transfer.routes.js");
const chatbotRoutes = require("./routes/chatbot.route.js");
const dashboardRouter = require("./routes/dashboard.routes.js");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors({ origin: "*" }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// rote level middleware
app.use("/api/verify-token", verifyRouter);
app.use("/api/users", userRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/send-email", emailRouter);
app.use("/api/branding", brandingRouter);
app.use("/api/branch", branchRouter);
app.use("/api/currency", currencyRouter);
app.use("/api/login", loginRouter);
app.use("/api/customers", customersRouter);
app.use("/api/find-by-account", findByAccountRouter);
app.use("/api/transaction", transactionRouter);
app.use("/api/transfer", transferRouter);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/dashboard", dashboardRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
