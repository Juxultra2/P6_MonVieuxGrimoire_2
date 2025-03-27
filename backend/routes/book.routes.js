// routes/book.routes.js
const express = require('express');
const router = express.Router();
const bookCtrl = require('../controllers/book.controller');
const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');

//  Routes spécifique d'abord
router.get('/bestrating', bookCtrl.getBestRatedBooks);

//  Routes dynamiques ensuite
router.get('/', bookCtrl.getAllBooks);
router.get('/:id', bookCtrl.getOneBook);
router.post('/', multer, bookCtrl.createBook);
router.put('/:id', auth, multer, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.post('/:id/rating', auth, bookCtrl.rateBook);

module.exports = router;
