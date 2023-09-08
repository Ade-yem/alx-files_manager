const express = require('express');

const router = express.Router();
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const FilesController = require('../controllers/FilesController');

router.get('/', (req, res) => res.send('hello world'));

router.post('/users', UsersController.postNew);
router.get('/users/me', UsersController.getMe);

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

router.post('/files', FilesController.postUpload);

module.exports = router;