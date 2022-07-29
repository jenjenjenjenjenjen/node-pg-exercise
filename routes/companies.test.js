process.env.NODE_ENV = "test";

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testComp;

beforeEach(async () => {
    const result = await db.query(`INSERT INTO companies (code, name, description)
        VALUES ('goog', 'Google', 'Search engine.') RETURNING code, name, description`);
    testComp = result.rows[0];
});

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
});

afterAll(async () => {
    await db.end()
});

describe("GET /companies", () => {
    test("Get a list of companies", async () => {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({companies: [testComp]});
    })
})

describe("GET /companies/[code]", () => {
    test("Get a single company", async () => {
        const res = await request(app).get(`/companies/${testComp.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: [testComp], invoices: [[]]})
    })
    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).get(`/companies/badcode`);
        expect(res.statusCode).toBe(404);
    })
})

describe("POST /companies", () => {
    test("Create a single company", async () => {
        const res = await request(app).post('/companies').send({
            code: "apple",
            name: "Apple",
            description: "Big Apple"
        });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({company: [
            {
                code: "apple",
                name: "Apple",
                description: "Big Apple"
            }
        ]})
    })
})

describe("PUT /companies/[code]", () => {
    test("Update a single company", async () => {
        const res = await request(app).put(`/companies/${testComp.code}`).send({
            name: "Apple",
            description: "Big Apple"
        })
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({updated: [
            {code: "goog",
            name: "Apple",
            description: "Big Apple"}
        ]})
    })
    test("Returns 404 if invalid code", async () => {
        const res = await request(app).put('/companies/badcode');
        expect(res.statusCode).toBe(404)
    })
})

describe("DELETE /companies/[code]", () => {
    test('Delete a single company', async () => {
        const res = await request(app).delete(`/companies/${testComp.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({status: "Deleted."})
    })
    test("Respond with 404 for invalid code", async () => {
        const res = await request(app).delete('/companies/badcode');
        expect(res.statusCode).toBe(404)
    })
})