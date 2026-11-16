const express = require('express');
const router = express.Router({ mergeParams: true });
const commentController = require('../controllers/commentController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { createUploader } = require('../middleware/uploadMiddleware');

const upload = createUploader('comment');

router.get('/', authenticateToken, commentController.getComments);
router.post('/', authenticateToken, upload.single('attachment'), commentController.createComment);

module.exports = router;