const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');
const slugify = require('slugify');

router.get('/', async (req, res) => {
    try {
        const results = await db.query(
            `SELECT * FROM companies`
        );
        return res.json({companies: results.rows})
    } catch(e) {
        return next(e);
    }
});

router.get('/:code', async (req, res, next) => {
    try{
        const { code } = req.params;
        const results = await db.query(`SELECT c.name, c.description, i.industry 
                                        FROM companies AS c 
                                        LEFT JOIN companies_industries AS ci 
                                        ON c.code = ci.comp_code 
                                        LEFT JOIN industries AS i 
                                        ON ci.ind_id = i.id
                                        WHERE c.code = $1;`, [code]);
        if(results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
        }
        const invoices = await db.query(`SELECT * FROM invoices WHERE comp_code=$1`, [code]);
        const company = results.rows;
        const industries = results.rows.map(r => r.industry)
        company.invoices = invoices.rows;
        return res.json({company, invoices: [company.invoices], industries})
    }catch(e){
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try{
        const { name, description } = req.body;
        const code = slugify(name)
        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) 
        RETURNING *`, [code, name, description]);
        return res.status(201).json({company: results.rows})
    }catch(e){
        return next(e);
    }
})

router.put('/:code', async (req, res, next) => {
    try{
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 
        RETURNING *`, [name, description, code]);
        if(results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404)
        }
        return res.json({updated: results.rows})
    }catch(e){
        return next(e);
    }
})

router.delete('/:code', async (req, res, next) => {
    try{
        const { code } = req.params;
        const company = await db.query(`SELECT * FROM companies WHERE code=$1`, [code]);
        if(company.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404)
        }
        const results = await db.query(`DELETE FROM companies WHERE code=$1`, [code]);
        return res.json({status: "Deleted."})
    }catch(e){
        return next(e);
    }
})

router.post('/industries', async () => {
    try{
        const { comp_code, ind_id } = req.body;
        const result = db.query(`INSERT INTO companies_industries (comp_code, ind_id) VALUES ($1, $2)`,
            [comp_code, ind_id]);
        return res.json({added_industry: result.rows})
    }catch(e){
        return next(e);
    }
})

module.exports = router;