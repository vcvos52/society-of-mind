const {
    signin,
    signout,
    createUser,
    deleteUser,
    createFreet,
    updateFreet,
    // getToken
} = require("./services");

const {
    randomUser, 
    expectSuccess
} = require('./utils');

const database = require('../database.js');

const axios = require('axios');


describe('Test /users', () => {

    beforeEach(async() => {
        await database.clearTables();
    });

    afterEach(async() => {
        await signout();
    });

    afterEach(async() => {
        await database.clearTables();
    });
    

    test('PUT /freets/:freetID Create a freet for another user', async () => {
        // csrf = await getToken();
        // token = csrf.body._csrf
        token = 'hi';
        // console.log(token);
        const user = {username: "user", password: 1, _csrf: token}
        await createUser(user);
        await signout(token);
        const hacker = {username: "hacker", password: 1}
        await createUser(hacker);
        await createFreet("hello");
        await updateFreet('0', "hi', author=user, message='scandalous material");
        const queryResult = await database.query(`SELECT * FROM freets`);
        expect(queryResult[0].author).toBe("hacker");
    });

    test('DELETE /user Take over all of a users freets', async () => {
        const user = randomUser();
        await createUser(user);
        let res = await createFreet("hello");
        await deleteUser();

        const hacker = {username:'[deleted]', password:'1'};
        await createUser(hacker);
        await signin(hacker);

        await updateFreet(0, "HACKED");

        const queryResult = await database.query(`SELECT * FROM freet`);
        if (!queryResult[0]){
            expect(1).toBe(1);
        } else {
        expect(queryResult[0].message).not.toBe("HACKED");
        }
    });

    test('POST /freet Creates a freet with XSS attack', async () => {
        const user = randomUser();
        await createUser(user);
        await signin(user);
        const response = await createFreet('<img src="fake.image" onerror=alert()>');
        expect(response.statusCode).not.toBe(200);
    });

    test('Authentication implementation - Bad Authentication', async () => {
        const user = {username:"victim", password:"awesomePassword"};
        await createUser(user);
        const queryResult = await database.query(`SELECT * FROM users`);
        expect(queryResult[0].password).not.toBe("awesomePassword");
    });

    test("Cross site Request Forgery Attack", async () => {
        const user  = randomUser();
        await createUser(user);
        await signin(user);
        let response = await axios.post('/api/freets', { id:10, message:"HACKED"} );
        expect(response.statusCode).not.toBe(200);
    });
    

  });

//   afterAll(async () => {
//     await database.close();
//   });