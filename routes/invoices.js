const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

router.get('/', async (req, res) => {
    try {
        const results = await db.query(
            `SELECT * FROM invoices`
        );
        return res.json({invoices: results.rows})
    } catch(e) {
        return next(e);
    }
});

router.get('/:id', async (req, res, next) => {
    try{
        const { id } = req.params;
        const results = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);
        if(results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
        }
        return res.json({invoice: results.rows})
    }catch(e){
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try{
        const { comp_code, amt } = req.body;
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) 
        RETURNING *`, [comp_code, amt]);
        return res.status(201).json({invoice: results.rows})
    }catch(e){
        return next(e);
    }
})

router.put('/:id', async (req, res, next) => {
    try{
        const { id } = req.params;
        const { amt } = req.body;
        const results = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 
        RETURNING *`, [amt, id]);
        if(results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404)
        }
        return res.json({updated: results.rows})
    }catch(e){
        return next(e);
    }
})

router.delete('/:id', async (req, res, next) => {
    try{
        const { id } = req.params;
        const invoice = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);
        if(invoice.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404)
        }
        const results = await db.query(`DELETE FROM invoices WHERE id=$1`, [id]);
        return res.json({status: "Deleted."})
    }catch(e){
        return next(e);
    }
})

module.exports = router;