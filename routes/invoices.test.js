process.env.NODE_ENV = "test";

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testInv;
let testComp;

beforeEach(async () => {
    const compResult = await db.query(`INSERT INTO companies VALUES ('apple', 'Apple Computer', 'Maker of OSX.')`)
    testComp = compResult.rows[0];
    const invResult = await db.query(`INSERT INTO invoices (comp_Code, amt, paid, paid_date)
        VALUES ('apple', 100, false, null) RETURNING comp_Code, amt, paid, paid_date, add_date, id`);
    testInv = invResult.rows[0];
});

afterEach(async () => {
    await db.query(`DELETE FROM invoices`);
    await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
    await db.end()
});

describe("GET /invoices", () => {
    test("List all invoices", async () => {
        const res = await request(app).get('/invoices');
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({invoices: [testInv]})
    })
})

describe("GET /invoices/[id]", () => {
    test("Get a single invoice", async () => {
        const res = await request(app).get(`/invoices/${testInv.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({invoice: [testInv]})
    })
    test("Return 404 for invalid id", async () => {
        const res = await request(app).get('/invoices/4');
        expect(res.statusCode).toBe(404);
    })
})

describe("POST /invoices", () => {
    test("Create a new invoice", async () => {
        const res = await request(app).post('/invoices').send({
            comp_code: "apple",
            amt: 10
        });
        expect(res.statusCode).toBe(201)
    })
})

describe("PUT /invoices/[id]", () => {
    test("Update an invoice", async () => {
        const res = await request(app).put(`/invoices/${testInv.id}`).send({amt: 5000});
        expect(res.statusCode).toBe(200)
    })
    test("Return 404 for invalid id", async () => {
        const res = await request(app).put('/invoices/4')
        expect(res.statusCode).toBe(404);
    })
})

describe("DELETE /invoices/[id]", () => {
    test("Delete an invoice", async () => {
        const res = await request(app).delete(`/invoices/${testInv.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({status: "Deleted."})
    })
    test("Return 404 for invalid id", async () => {
        const res = await request(app).delete('/invoices/4');
        expect(res.statusCode).toBe(404);
    })
})