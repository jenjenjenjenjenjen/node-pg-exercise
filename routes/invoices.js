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
        const { amt, paid } = req.body;
        let paidDate = null;
        const currInv = await db.query(`SELECT paid FROM invoices WHERE id = $1`, [id]);
        if(currInv.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404)
        }

        const currPaidDate = currInv.rows[0].paid_date;

        if(!currPaidDate && paid) {
            paidDate = new Date();
        } else if (!paid) {
            paidDate = null;
        } else {
            paidDate = currPaidDate;
        }
        const result = await db.query(
            `UPDATE invoices
             SET amt=$1, paid=$2, paid_date=$3
             WHERE id=$4
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
          [amt, paid, paidDate, id]);
        return res.json({updated: result.rows})
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