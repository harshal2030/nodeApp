const request = require("supertest");
const app = require("./../src/app")
const User = require("./../src/models/user");
const {setupDatabse, user1} = require("./fixtures/db")

beforeAll(setupDatabse);

test("should signup a user", async () => {
    // create a user in test
    const response = await request(app)
        .post("/users")
        .send({
            name: "kavya",
            username: "kavya2030",
            email: "kavya@example.com",
            adm_num: "23234",
            dob: "2003-03-12",
            password: "qwertyy",
        })
        .expect(201)

    const user = await User.findOne({where: {username: response.body.user.username}});
    expect(user).not.toBeNull();
    expect(user.password).not.toBe('qwertyy')
    expect(user.tokens.length).toBe(1);
})

test("should not signup with wrong patterns", async () => {
    // expect request to be fail, for same username
    await request(app)
    .post("/users")
    .send({
        name: "kavya",
        username: "kavya2030",
        email: "kavya@example.com",
        adm_num: "23234",
        dob: "2003-03-12",
        password: "qwertyy",
    })
    .expect(400)

    // fail, for wrong username pattern
    await request(app)
    .post("/users")
    .send({
        name: "kavya",
        username: "kavya 2030",
        email: "kavya@example.com",
        adm_num: "23234",
        dob: "2003-03-12",
        password: "qwertyy",
    })
    .expect(400)
})

test("Should log in existing users", async () => {
    const res = await request(app)
        .post("/users/login")
        .send({
            email: user1.email,
            password: user1.password
        })
        .expect(200)

    const user = await User.findOne({where: {username: user1.username}})
    expect(user.tokens.length).toBeGreaterThan(1) 
})

test("Should get the profile of the existing user", async () => {
    const res = await request(app)
        .get('/users/harshal2030')
        .expect(200)
    
    const user = res.body
    expect(user).not.toHaveProperty('token')
    expect(user).not.toHaveProperty('password')
})

test("Should not get profile of non exiting user", async () => {
    await request(app).get('/users/laplace').expect(404)
})