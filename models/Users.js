const database = require('../database');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var salt = bcrypt.genSaltSync(saltRounds);


/**
 * This acts as a database of all of the user accounts that exist
 * List(Users)
 */
let allUsers = [];

/**
 * This class is an abstraction of a single user.
 * This class provides static methods to operate on allUsers
 */
class Users {

    /**
     * LoggedIn keeps track of if there is an active session somehwere
     * freets is a list of all of the freets made by this user
     * @param {String} name : name of the new account
     * @param {String} password : the Users' password
     */
    constructor(name, password){
        this.name = name;
        this.password = password;
        this.loggedIn = false;
    }

    static comparePass(text, hash){
        return bcrypt.compareSync(text, hash);
    }

    /**
     * deletes the freet from the user database
     * @param {Freet} freet the freet to be deleted
     */
    static async deleteFreet(freet){
        let index = this.freets.indexOf(freet);
        if (index > -1){
            this.freets.splice(index, 1);
        }
    }

    /**
     * Adds a new user to the allUsers database
     * @param {Users} user 
     */
    static async addUser(user){
        try {
            const name = user.name;
            const password = bcrypt.hashSync(user.password, salt);
            const logged = 1;
            const response = await database.query('INSERT INTO users (name, password, loggedIn) VALUES (?, ?, ?);', [name, password, logged]);
            return response;
          } catch (error) {
            throw error;
          }
    }

    /**
     * Logs the user in.
     * @param {String} username - name of the user
     */
    static async logIn(username){
        try {
            const logged = 1;
            const response = await database.query('UPDATE users SET loggedIn=? WHERE name=?;', [logged, username]);
            return response;
          } catch (error) {
            throw error;
          }
    }

    /**
     * Logs the user out.
     * @param {String} username - user name
     */
    static async logOut(username){
        try {
            const logged = 0;
            const sql = `UPDATE users SET loggedIn=${logged} WHERE name='${username}';`;
            const response = await database.query(sql);
            return response;
          } catch (error) {
            throw error;
          }
    }


    /**
     * Given a string that is a username, finds the associated Users object
     * @param {String} username 
     */
    static async findUser(username){
        try {
            const response = await database.query('SELECT * FROM users WHERE name=?;', [username]);
            return response[0];
          } catch (error) {
            throw error;
          }    
    }

    /**
     * Given a string that is a username, finds the associated freets
     * @param {String} username 
     */
    static async findUserFreets(username){
        try {
            const sql = `SELECT * FROM freets WHERE author='${username}' OR refreeterID='${username}';`;
            const response = await database.query('SELECT * FROM freets WHERE author=? OR refreeterID=?;', [username, username]);
            return response;
          } catch (error) {
            throw error;
          }    
    }
        
    /**
     * Changes the username of logged in user
     * @param {String} old 
     * @param {String} newName 
     */
    static async changeUsername(old, newName){
        try {
            var sql = `UPDATE users SET name='${newName}' WHERE name='${old}';`;
            await database.query(sql);
            sql = `UPDATE freets SET author='${newName}' WHERE author='${old}';`;
            await database.query(sql);
            sql = `UPDATE follows SET userID='${newName}' WHERE userID='${old}';`;
            await database.query(sql);
            sql = `UPDATE follows SET followerID='${newName}' WHERE followerID='${old}';`;
            await database.query(sql);
          } catch (error) {
            throw error;
          }  
    }

    /**
     * Changes the logged in user's password
     * @param {String} username 
     * @param {String} newPassword 
     */
    static async changePassword(username, newPassword){
        try {
            await database.query('UPDATE users SET password=? WHERE name=?;', [bcrypt.hashSync(newPassword, saltRounds), username]);
          } catch (error) {
            throw error;
          }  
    }

    /**
     * Returns all of the user safely
     */
    static async getAll(){
        try {
            const sql = `SELECT * FROM users;`;
            const response = await database.query(sql);
            return response;
          } catch (error) {
            throw error;
          }
    }


     /**
     * Returns all of the user safely
     */
    static async getAllOthers(name){
        try {
            const sql = `SELECT * FROM users WHERE NOT name='${name}';`;
            const response = await database.query(sql);
            return response;
          } catch (error) {
            throw error;
          }
    }

    /**
     * Removes the user form the all users database
     * @param {String} username 
     * @param {JSON} req 
     */
    static async deleteUser(username, req){
        if (req.session.name === username){
            try {
                var sql = `DELETE FROM users WHERE name='${username}';`;
                await database.query(sql);
                sql = `DELETE FROM freets WHERE author='${username}';`;
                await database.query(sql);
                sql = `DELETE FROM follows WHERE userID='${username}' OR followerID='${username}';`;
                await database.query(sql);
              } catch (error) {
                throw error;
              }
        }
    }

    /**
     * Checks if user exists given its username
     * @param {String} username 
     */
    static async userExists(username){
        try {
            const sql = `SELECT * FROM users WHERE name='${username}';`;
            const response = await database.query(sql);
            if (!Array.isArray(response) || !response.length){
                return false;
            } else {
                return true;
            }
          } catch (error) {
            throw error;
          }
    }

    /**
     * Adds a follow connection between two users
     * @param {String} follower - logged in user
     * @param {String} following - user to be followed
     */
    static async follow(follower, following){
        try {
            const sql = `INSERT INTO follows (userID, followerID) VALUES ('${follower}', '${following}');`;
            await database.query(sql);
          } catch (error) {
            throw error;
          }
    }

    /**
     * Gets rid of follow connection between two users
     * @param {String} follower - logged in user
     * @param {String} following - user that was being followed
     */
    static async unfollow(follower, following){
        try{
            const sql = `DELETE FROM follows WHERE userID='${follower}' AND followerID='${following}';`;
            await database.query(sql);
        }catch (error) {
            throw error;
        }
    }

    /**
     * Checks if a user is following another user
     * @param {String} follower - the logged in user
     * @param {String} following - user that is being checked if followed
     */
    static async checkFollowed(follower, following){
        try {
            const sql = `SELECT * FROM follows WHERE userID='${follower}' AND followerID='${following}';`;
            const response = await database.query(sql);
            if (!Array.isArray(response) || !response.length){
                return false;
            } else {
                return true;
            }
          } catch (error) {
            throw error;
          }
    }

    /**
     * Gets all of the freets of all of the users that are being followed
     * @param {String} username - user to get their freets
     */
    static async getFollowersFreets(username){
        try{
            const sql = `SELECT * FROM freets WHERE author IN (SELECT followerID FROM follows WHERE userID='${username}') OR refreeterID IN (SELECT followerID FROM follows WHERE userID='${username}');`;
            const response = await database.query(sql);
            return response;
        } catch(error){
            throw error;
        }
    }
}

module.exports = Users;
