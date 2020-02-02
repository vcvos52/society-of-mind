const uuidv4 = require('uuid/v4');

function randomUser() {
    return {
        username: uuidv4().slice(0, 20),
        password: uuidv4().slice(0,20)
    };
}
  
function expectSuccess(response) {
    expect(response.statusCode).toBe(200);
    return response;
}  

module.exports = {
    randomUser, 
    expectSuccess
};