const express = require('express');
const router = express.Router();
const {
  getBankAccounts,
  addBankAccount,
  setDefault,
  deleteBankAccount,
  revealBankAccount,
} = require('../controllers/bank-account.controller');
const { optionalAuth } = require('../middlewares/auth.middleware');

router.get('/bank-accounts', optionalAuth, getBankAccounts);
router.post('/bank-accounts', optionalAuth, addBankAccount);
router.post('/bank-accounts/:id/reveal', optionalAuth, revealBankAccount);
router.put('/bank-accounts/:id/default', optionalAuth, setDefault);
router.delete('/bank-accounts/:id', optionalAuth, deleteBankAccount);

module.exports = router;
