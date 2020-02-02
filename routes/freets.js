let session = require("express-session");
const Users = require('../models/Users');
const Freets = require('../models/Freets');
const database = require('../database');

const express = require('express');

const router = express.Router();

/**
 * Gets the ID that the freets are currently on
 * Added to include persistence
 */
async function getID() {
    const sql = `SELECT id FROM id WHERE 1;`;
    const response = await database.query(sql);
    return response[0].id;
}

/**
 * Increments the id for persistence
 */
async function incID(){
    var sql = `UPDATE id SET id=id+1;`;
    await database.query(sql);
}

/**
 * Get all of the freets
 * @name GET/api/freets
 * @returns {Freets[]} a list of all of the freets
 * @throws {401} - if user is not logged in
*/
router.get('/', async (req, res) => {
    if (!req.session.name){
        res.status(401).json("Please log in").end();
        return;
    }
    let allFreets = await Freets.getAllFreets();
    res.status(200).json(allFreets).end();
});


/**
 * Post a freet from a user's account
 * @name POST/api/freets
 * @returns the new freet that was created
 * @throws {401} - if user is not logged in
 */
router.post('/', async (req, res) => {
    if (!req.session.name){
        res.status(401).json("Please log in").end();
        return;
    }
    if (req.body.content.length > 140){
        res.status(401).json("Freet must be less than 140 characters").end();
        return;
    }
    let id = await getID();
    let newFreet = new Freets(req.body.content, req.session.name, id);
    await Freets.addFreet(newFreet);
    incID();
    res.status(201).json(newFreet).end();
});


/**
 * Edit a freet from a user's account
 * @name PUT/api/freets/edit/:id
 * :id is the id of the freet being edited
 * @returns The edited freet
 * @throws {401} - if user is not logged in
 * @throws {404} - if freet does not exist
 * @throws {403} - if the user does not have permission to edit this freet
 */
router.put('/edit/:id', async (req, res) => {
    let freetID = req.params.id;
    if (!req.session.name){
        res.status(401).json("Please log in").end();
        return;
    }
    if (!(await Freets.idExists(freetID))){
        res.status(404).json("This Freet does not exist").end();
        return;
    }
    let editFreet = await Freets.getFreet(freetID);
    if (req.session.name !== editFreet.author){
        res.status(403).json("You do not have permission to edit this freet.").end();
        return;
    }
    await Freets.editFreet(freetID, req.body.content);
    let editedFreet = await Freets.getFreet(freetID);
    res.status(200).json(editedFreet).end();
});

/**
 * Upvote a freet
 * @name POST/api/freets/upvote
 * @returns the freet that was upvoted
 * @throws {401} - if user is not logged in
 * @throws {404} - if freet does not exist
 */
router.post('/upvote', async (req, res) => {
    if (!req.session.name){
        res.status(401).json("Please log in").end();
        return;
    }
    let id = req.body.id;
    if (!(await Freets.idExists(id))){
        res.status(404).json("This Freet does not exist").end();
        return;
    }
    await Freets.upVote(id, req.session.name);
    let freet = await Freets.getFreet(id);
    res.status(200).json(freet).end();
});


/**
 * Downvote a freet
 * @name POST/api/freets/downvote
 * @returns the freet that was downvoted
 * @throws {401} - if user is not logged in
 * @throws {404} - if freet does not exist
 */
router.post('/downvote', async (req, res) => {
    if (!req.session.name){
        res.status(401).json("Please log in").end();
        return;
    }
    let id = req.body.id;
    if (!(await Freets.idExists(id))){
        res.status(404).json("This Freet does not exist").end();
        return;
    }
    await Freets.downVote(id, req.session.name);
    let freet = await Freets.getFreet(id);
    res.status(200).json(freet).end();
});

/**
 * Checks if a user has already upvoted a given freet
 * @name GET/api/freets/checkUpvote/:id
 */
router.get('/checkUpvote/:id', async (req, res) => {
    if (await Freets.checkUpvote(req.params.id, req.session.name)){
        res.status(200).json("This has been upvoted").end();
        return
    } else {res.status(404).json("Not yet upvoted").end();}
});

/**
 * Checks if a user has already down voted a given freet
 * @name GET/api/freets/checkDownvote/:id
 */
router.get('/checkDownvote/:id', async (req, res) => {
    if (await Freets.checkDownvote(req.params.id, req.session.name)){
        res.status(200).json("This has been Down voted").end();
        return
    } else {res.status(404).json("Not yet down voted").end();}
});


/**
 * Delete a freet from a user's account
 * @name PUT/api/freets/delete/:id/
 * :id is the id of the freet being edited
 * @returns All freets after specified freet is deleted
 * @throws {401} - if user is not logged in
 * @throws {404} - if freet does not exist
 * @throws {403} - if the user does not have permission to edit this freet
 */
router.delete('/delete/:id', async (req,res) => {
    if (!req.session.name){
        res.status(401).json("Please log in").end();
        return;
    }
    let id = req.params.id;
    if (!(await Freets.idExists(id))){
        res.status(404).json("This Freet does not exist").end();
        return;
    }
    let freetToDelete = await Freets.getFreet(id);

    let author = freetToDelete.author;
    let refreetID = freetToDelete.refreeterID;
    if (author !== req.session.name && refreetID !== req.session.name){
        res.status(403).json("You do not have permission to delete this freet.").end();
        return;
    }
    await Freets.deleteFreet(id);
    res.status(200).json(await Freets.getAllFreets()).end();

});


/**
 * Refereet a freet
 * @name POST/api/freets/refreet/:id
 * @returns the freet that was downvoted
 * @throws {401} - if user is not logged in
 * @throws {404} - if freet does not exist
 */
router.post('/refreet/:id', async (req, res) => {
    if (!req.session.name){
        res.status(401).json("Please log in").end();
        return;
    }
    let id = req.body.id;
    if (!(await Freets.idExists(id))){
        res.status(404).json("This Freet does not exist").end();
        return;
    }
    let ogFreet = await Freets.getFreet(id);
    if (ogFreet.refreeterID || ogFreet.author === req.session.name){
        res.status(401).json("You Cannot Refreet This Freet").end();
        return;
    }

    let message = req.body.message;
    let author = req.body.author;
    let newID = await getID();
    let refreet = new Freets(message, author, newID);

    await Freets.refreet(refreet, req.session.name);
    let freet = await Freets.getFreet(newID);
    incID();
    res.status(200).json(freet).end();
});


/**
 * Checks if a user has already upvoted a given freet
 * @name GET/api/freets/checkUpvote/:id
 */
router.get('/isowner/:author', async (req, res) => {
    if (req.params.author === req.session.name){
        res.status(200).json("This is the owner").end();
        return
    } else {res.status(404).json("This is not the owner").end();}
});



module.exports = router;