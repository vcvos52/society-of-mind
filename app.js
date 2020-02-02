const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
// const csrf = require('csurf');

// Loads Page
const indexRouter = require('./routes/index');
// Handles User api requests
const usersRouter = require('./routes/users');
// Handles Freet api requests
const freetsRouter = require('./routes/freets');

const app = express();
app.use(session({ secret: "6170", resave: true, saveUninitialized: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist')));
// const _csrf = csrf();

// app.use(_csrf);
app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/freets', freetsRouter);

module.exports = app;
