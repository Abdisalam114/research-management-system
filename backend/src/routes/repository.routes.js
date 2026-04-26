const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { 
  getItems, getItem, createItem, updateItem, deleteItem, getRepoStats 
} = require('../controllers/repository.controller');

router.use(protect);

router.get('/', getItems);
router.get('/stats', getRepoStats);
router.get('/:id', getItem);
router.post('/', createItem);
router.patch('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;
