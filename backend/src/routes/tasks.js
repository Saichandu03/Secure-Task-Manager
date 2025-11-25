const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/taskController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', ctrl.getTasks);
router.post('/', ctrl.createTask);
router.put('/:id', ctrl.updateTask);
router.delete('/:id', ctrl.deleteTask);

module.exports = router;
