const express = require('express');
const router = express.Router();
const blueBookController = require('../controllers/blueBook.controller');
const { verifyToken } = require('../middleware/auth');
const { validateBlueBook, validateUUID } = require('../middleware/validation');

// BlueBook routes
router.post('/', verifyToken, validateBlueBook, blueBookController.createBlueBook);
router.get('/:restaurant_id/:date', verifyToken, validateUUID('restaurant_id'), blueBookController.getBlueBookByDate);
router.put('/:blue_book_id', verifyToken, validateUUID('blue_book_id'), blueBookController.updateBlueBook);
router.delete('/:blue_book_id', verifyToken, validateUUID('blue_book_id'), blueBookController.deleteBlueBook);

module.exports = router;
