const request = require('supertest-session');

const app = require('../app');

const requestApp = request(app);


// async function getToken() {
//     let t = await requestApp.get('/api/users/create/csrf');
//     return t;
// }

/**
 * @param {object} user
 *  {
 *    username: string
 *    password: string
 *  }
 */
async function signin(user) {
  return requestApp
    .post('/api/users/login')
    .send(user)
    // .set('_csrf', token);
}

async function signout() {
  return requestApp
    .post('/api/users/logout')
    // .set('_csrf', token);
}

/**
 * @param {object} user
 *  {
 *    username: string
 *    password: string
 *  }
 */
async function createUser(user) {
  return requestApp
    .post('/api/users')
    .send(user)
    // .set('_csrf', csrf);
}

/**
 * @param {object} user
 *  {
 *    username: string
 *    password: string
 *  }
 */
async function updateUser(user) {
  return requestApp
    .put('/users')
    .send(user);
}

async function deleteUser() {
  return requestApp
    .delete('/api/users')
    // .set('_csrf', token);
}

/**
 * @param {string} message
 */
async function createFreet(content) {
  return requestApp
    .post('/api/freets')
    .send({ content })
    // .set('_csrf', token);
}

async function readAllFreets() {
  return requestApp
    .get('/api/freets');
}

/**
 * @param {string} author
 */
async function readFreetsByAuthor(author) {
  return requestApp
    .get(`/api/freets/:author=${author}`);
}

/**
 * @param {number} freetID
 * @param {string} message
 */
async function updateFreet(freetID, message) {
  return requestApp
    .put(`/api/freets//edit/${freetID}`)
    .send({ message })
    // .set('_csrf', token);
}

/**
 * @param {number} freetID
 */
async function deleteFreet(freetID) {
  return requestApp
    .delete(`/freets/${freetID}`);
}

/**
 * @param {number} freetID
 * @param {number} vote
 */
async function voteOnFreet(freetID, vote) {
  return requestApp
    .put(`/freets/${freetID}/vote`)
    .send({ vote });
}


module.exports = {
  signin,
  signout,
  createUser,
  deleteUser,
  createFreet,
  updateFreet,
//   getToken
};
