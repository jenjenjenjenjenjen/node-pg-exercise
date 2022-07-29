const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

router.get('/', async (req, res, next) => {
    try{
        const results = await db.query(`SELECT id, code, industry FROM industries`)
        return res.json({industries: results.rows})
    }catch(e){
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try{
        const { code, industry } = req.body;
        const results = await db.query(`INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry`,
        [code, industry]);
        return res.json({industry: results.rows})
    }catch(e){
        return next(e);
    }
})

module.exports = router;