
let session = require("express-session");
const Users = require('../models/Users');

const express = require('express');

const router = express.Router();

const axios = require('axios');


/**
 * Create a user account and then log into it
 * @name POST/api/users
 * @returns {Users} a Users object representing the new user
 * @throws {401} - if user is already logged into an account
 * @throws {403} - if the username is already taken
*/
router.post('/', async (req, res) => {
    if (req.session.name){
        res.status(401).json("please log out first").end();
        return;
    }
    // let t = await Users.userExists(req.body.username.toString());
    if (await Users.userExists(req.body.username.toString())){
        res.status(403).json("this username is already taken").end();
        return;
    }
    let newUser = new Users(req.body.username.toString(), req.body.password.toString());
    await Users.addUser(newUser);
    req.session.name = newUser.name;
    newUser.loggedIn = true;
    res.status(201).json(newUser).end();
});


/**
 * Get all of the user
 * @name GET/api/users
 * :author is the name of the author that we are retrieving the freets from
 * @returns {Freets[]} a list of all of the freets
 * @throws {401} - if user is not logged in
 * @throws {404} - if user does not exist
*/
router.get('/', async (req, res) => {
    if (!req.session.name){
        res.status(401).json("Please log in").end();
        return;
    }
    let users = await Users.getAllOthers(req.session.name);
    res.status(200).json(users).end();
});


/**
 * Get all of the freets for a single user
 * @name GET/api/users/:author/freets
 * :author is the name of the author that we are retrieving the freets from
 * @returns {Freets[]} a list of all of the freets
 * @throws {401} - if user is not logged in
 * @throws {404} - if user does not exist
*/
router.get('/:author/freets', async (req, res) => {
    if (!req.session.name){
        res.status(401).json("Please log in").end();
        return;
    }
    let author = req.params.author;
    // let t = await Users.userExists(author);
    if (!(await Users.userExists(author))){
        res.status(404).json("This user does not exist").end();
        return;
    }
    let freets = await Users.findUserFreets(author);
    res.status(200).json(freets).end();
});


/**
 * Changed the user name for account currently logged into
 * @name PUT/api/users/:id/username
 * @returns {Users} a Users object representing the user with new username
 * @throws {401} - if user is not logged in
*/
router.put('/:id/username', async (req, res) => {
    if (!req.session.name){
        res.status(401).json("Please log in").end();
        return;
    }
    let newName = req.body.username.toString();
    // let t = await Users.userExists(newName);
    if (await Users.userExists(newName)){
        res.status(401).json("Username already taken").end();
        return;
    }

    await Users.changeUsername(req.session.name, newName);

    req.session.name = newName;

    let user = await Users.findUser(req.session.name);

    res.status(200).json(user).end();
});


/**
 * Changed the password for account currently logged into
 * @name PUT/api/users/password
 * @returns {Users} a Users object representing the user with new password
 * @throws {401} - if user is not logged in
*/
router.put('/password', async (req, res) => {
    if (!req.session.name){
        res.status(401).json("Please log in").end();
        return;
    }
    await Users.changePassword(req.session.name, req.body.password.toString());

    let user = await Users.findUser(req.session.name);

    res.status(200).json(user).end();
});

/**
 * Delete the user currently logged into
 * @name DELETE/api/users
 * @returns {200} success message
 * @throws {401} - if user is not logged in
*/
router.delete('/', async (req, res) => {
    if (!req.session.name){
        res.status(401).json("Please log in").end();
        return;
    }
    await Users.deleteUser(req.session.name, req);
    if (!(await Users.findUser(req.session.name))){
        req.session.name = null;
        res.status(200).json("The user has been deleted").end();
    }

});

/**
 * Sign into a user account
 * @name POST/api/users/login
 * @returns {Users} a Users object representing the logged in user
 * @throws {401} - if user is already logged into an account
 * @throws {404} - if the user account doesnt exist
 * @throws {401} - Wrong password
 * @throws {403} - if the user is already logged into another device
*/
router.post('/login', async (req, res) => {
    if (req.session.name){
        res.status(401).json("please log out first").end();
        return;
    }
    let username = req.body.username.toString();
    let password = req.body.password.toString();
    if (!(await Users.userExists(username))){
        res.status(404).json("This account does not exist").end();
        return;
    }
    let user = await Users.findUser(username);
    if (Users.comparePass(password, user.password)){
        res.status(401).json("Incorrect Password").end();
        return;
    }
    if (user.loggedIn){
        res.status(403).json("This account is already logged in on another device. Please log out first.")
        return;
    }
    await Users.logIn(username);
    req.session.name = user.name;
    res.status(200).json(user).end();
});

/**
 * Sign out of a user account
 * @name POST/api/users/logout
 * @returns {200} success message
 * @throws {401} - if user is not logged in
*/
router.post('/logout', async (req, res) => {
    if (!req.session.name){
        res.status(401).json("please log in first").end();
        return;
    }
    await Users.logOut(req.session.name);
    req.session.name = null;
    res.status(200).json("You have been logged out").end();
});


/**
 * Check if user is signed into an account
 * @name GET/api/users/isSignedIn
 * @returns {200} success message
 * @throws {401} - if user is not logged in
*/
router.get('/isSignedIn', async (req, res) => {
    if (!req.session.name){
        res.status(401).json("You are not signed in").end();
        return;
    }
    res.status(200).json("You are signed in").end();
});

/**
 * Check if user exists
 * @name GET/api/users/exists/:author
 * @returns {200} success message
 * @throws {401} - user does not exist
*/
router.get('/exists/:author', async (req, res) => {
    if (!(await Users.userExists(req.params.author))){
        res.status(401).json("This user does not exit").end();
        return;
    }
    res.status(200).json("This user exists").end();
});

/**
 * Follows a user
 * @name POST/api/users/follow/:user
 */
router.post('/follow/:user', async (req, res) => {
    await Users.follow(req.session.name, req.params.user);
    res.status(200).json("This user exists").end();
});

/**
 * Unfollows a user
 * @name DELETE/api/users/unfollow/:user
 */
router.delete('/unfollow/:user', async (req, res) => {
    await Users.unfollow(req.session.name, req.params.user);
    res.status(200).json("This user exists").end();
});

/**
 * Checks if a user is following another
 * @name GET/api/users/checkFollowed/:user
 */
router.get('/checkFollowed/:user', async (req, res) => {
    if (!(await Users.checkFollowed(req.session.name, req.params.user))){
        res.status(401).json("They aint following each other").end();
        return;
    }
    res.status(200).json("They following each other").end();
});

/**
 * Gets all of the freets of all of the users that are being followed
 * @name GET/api/users/followers
 * @returns all of the freets of all of the users that a user is following
 */
router.get('/followers', async (req, res) => {
    let followersFreets = await Users.getFollowersFreets(req.session.name);
    res.status(200).json(followersFreets).end();
});



/**
 * GENERATE TOKEN
 * send back in body
//  */
// router.get('/create/csrf', async (req, res) => {
//     // axios.defaults.headers['csrf-token'] = true;
//     // let csrfToken = await req.csrfToken();
//     // axios.defaults.headers['csrf-token'] = "hi";
//     res.send({_csrf: "hi"}).status(200).end();
// });

// router.get('/csrf', async (req, res) => {
//     res.send({_csrf: 'hi'}).status(200).end();
// });

module.exports = router, axios;