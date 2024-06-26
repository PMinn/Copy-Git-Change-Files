var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.json({ title: 'Express' });
})

router.get('/test', function (req, res, next) {
    res.json({ title: 'test' });
})

module.exports = router;