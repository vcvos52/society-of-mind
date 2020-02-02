const database = require('../database');


/**
 * This class abstracts the idea of a Freet, while also
 * prividing static methods to operate on the central database of freets
 * in the freet catalog
 */
class Freets{

    /**
     * @param {String} message : the message of the freet
     * @param {String} author : the author of the freet
     * @param {String} id : the ID of the freet
     */
    constructor(message, author, id){
        this.message = message;
        this.author = author;
        this.votes = 0;
        this.id = id;
    }

    /**
     * checks if Freet ID exists
     * @param {String} id 
     */
    static async idExists(id){
        try {
            const sql = `SELECT * FROM freets WHERE id='${id}';`;
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
     * Returns freet form freetCatalog given its ID
     * @param {String} id 
     */
    static async getFreet(id){
        try {
            const sql = `SELECT * FROM freets WHERE id='${id}';`;
            const response = await database.query(sql);
            return response[0];
          } catch (error) {
            throw error;
          }   
    }

    /**
     * increases a Freets "votes"
     * the purpose of this method is added abstraction
     */
    static async upVote(id, user){
        try{
            var sql = `UPDATE freets SET votes=votes+1 WHERE id='${id}';`;
            await database.query(sql);
            var removeUpvote = `DELETE FROM upvotes WHERE (user='${user}' AND freetID='${id}');`;
            await database.query(removeUpvote);
            var removeDownvote = `DELETE FROM downvotes WHERE (user='${user}' AND freetID='${id}');`;
            await database.query(removeDownvote);
            var vote_sql = `INSERT INTO upvotes (user, freetID) VALUES ('${user}', '${id}')`
            await database.query(vote_sql);
        } catch(error){
            throw error;
        }
    }

    /**
     * Checks the upvotes table to see if a user has upvoted this freet
     * Returns boolean
     */
    static async checkUpvote(id, user){
        try{
            var vote_sql = `SELECT * FROM upvotes WHERE (user='${user}' AND freetID='${id}')`
            let response = await database.query(vote_sql);
            if (!Array.isArray(response) || !response.length){
                return false;
            } else {
                return true;
            }
        }catch(error){
            throw error;
        }    
    }

    /**
     * decreases a Freets "votes"
     * the purpose of this method is added abstraction
     */
    static async downVote(id, user){
        try{
            var sql = `UPDATE freets SET votes=votes-1 WHERE id='${id}';`;
            await database.query(sql);
            var removeDownvote = `DELETE FROM downvotes WHERE (user='${user}' AND freetID='${id}');`;
            await database.query(removeDownvote);
            var removeUpvote = `DELETE FROM upvotes WHERE (user='${user}' AND freetID='${id}');`;
            await database.query(removeUpvote);
            var vote_sql = `INSERT INTO downvotes (user, freetID) VALUES ('${user}', '${id}')`
            await database.query(vote_sql);
        } catch(error){
            throw error;
        }    
    }

    /**
     * Checks if a freet has been downvoted already
     * @param {String} id - freet id 
     * @param {*} user - the user's name
     */
    static async checkDownvote(id, user){
        try{
            var vote_sql = `SELECT * FROM downvotes WHERE (user='${user}' AND freetID='${id}')`
            let response = await database.query(vote_sql);
            if (!Array.isArray(response) || !response.length){
                return false;
            } else {
                return true;
            }
        }catch(error){
            throw error;
        }    
    }

    /**
     * Edits the freet message
     * @param {String} id - freet id 
     * @param {String} newMessage - the new content for the freet
     */
    static async editFreet(id, newMessage){
        try{
            // var sql = 'UPDATE freets SET message= ' + database.escape(newMessage) + ' WHERE id=' + database.escape(id) + ';';
            await database.query('UPDATE freets SET message= ? WHERE id= ?', [newMessage, id]);
        } catch(error){
            throw error;
        }    
    }

    /**
     * Adds a given freet and its ID into the freetCatalog
     * @param {Freets} freet 
     * @param {String} id 
     */
    static async addFreet(freet){
        try {
            const id = freet.id;
            const author = freet.author;
            const message = freet.message
            const votes = freet.votes;
            const sql = `INSERT INTO freets (id, author, message, votes) VALUES ('${id}', '${author}', '${message}', ${votes});`;
            const response = await database.query(sql);
            return response;
          } catch (error) {
            throw error;
          }
    }


    /**
     * Adds a given freet and its ID into the freetCatalog
     * @param {Freets} freet 
     * @param {String} id 
     */
    static async refreet(freet, refreeter){
        try {
            const id = freet.id;
            const author = freet.author;
            const message = freet.message
            const votes = freet.votes;
            const sql = `INSERT INTO freets (id, author, message, votes, refreeterID) VALUES ('${id}', '${author}', '${message}', ${votes}, '${refreeter}');`;
            const response = await database.query(sql);
            return response;
          } catch (error) {
            throw error;
          }
    }

    /**
     * Removes a given freet and its ID from the freetCatalog
     * @param {String} id of freet to remove
     */
    static async deleteFreet(id){
        try {
            var sql = `DELETE FROM freets WHERE id='${id}';`;
            await database.query(sql);
          } catch (error) {
            throw error;
          }
    }

    /**
     * Method to safely return all of the freets in the database
     * @returns a list of all of the freets made so far
     */
    static async getAllFreets(){
        try {
            const sql = `SELECT * FROM freets;`;
            let freets = await database.query(sql);
            return freets;
          } catch (error) {
            throw error;
          }
    }


}

module.exports = Freets;