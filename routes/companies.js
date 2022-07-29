const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

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
        const results = await db.query(`SELECT * FROM companies WHERE code=$1`, [code]);
        if(results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
        }
        const invoices = await db.query(`SELECT * FROM invoices WHERE comp_code=$1`, [code]);
        return res.json({company: results.rows, invoices: invoices.rows})
    }catch(e){
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try{
        const { code, name, description } = req.body;
        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) 
        RETURNING *`, [code, name, description]);
        return res.json({company: results.rows})
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

module.exports = router;