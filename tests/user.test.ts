import request from 'supertest';
import app from '../src/app';

jest.useFakeTimers();

interface UserRequestBody {
    user: {
        name: string;
        username: string;
        email: string;
        password: string;
        dob: string;
    }
    device?: object;
}

describe("Account creation and login tests", () => {
    const user: UserRequestBody = {
        user: {
            name: 'harshal',
            username: 'unique',
            email: 'hars@ex.com',
            password: 'kjfhgldkjfg',
            dob: '2003-01-01'
        }
    }
    test("Should create a account", async () => {
        const res = await request(app)
            .post('/users')
            .send(user)
            .expect(201);
    })

    test.each([
        ['name', 'username', 'dfgdfg', 'jhsdlfaksdjfh', '2003-01-01', 201]
    ])
      
})