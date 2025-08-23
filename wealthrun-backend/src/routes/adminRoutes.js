const express = require('express');
const router = express.Router();
const {
  listUsers,
  handleWithdrawal,
  createPlan,
  updatePlan,
  deletePlan,
  listTransactions
} = require('../controllers/adminController');

const { auth, authorize } = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/inputSanitize');

// Protect all admin routes
router.use(auth, authorize(['admin']));

// List all users
router.get('/users', listUsers);

// List all transactions
router.get('/transactions', listTransactions);

// Approve / Reject withdrawal
router.post(
  '/withdrawals',
  validateRequest([
    body('transactionId').isInt().withMessage('transactionId must be an integer'),
    body('action').isIn(['approve', 'reject']).withMessage('action must be "approve" or "reject"')
  ]),
  handleWithdrawal
);

// Investment plan CRUD

// Create a plan
router.post(
  '/plans',
  validateRequest([
    body('name').isString().notEmpty(),
    body('roi').isFloat({ min: 0 }),
    body('durationDays').isInt({ min: 1 })
  ]),
  createPlan
);

// Update a plan
router.put(
  '/plans/:planId',
  validateRequest([
    param('planId').isInt(),
    body('name').optional().isString(),
    body('roi').optional().isFloat({ min: 0 }),
    body('durationDays').optional().isInt({ min: 1 })
  ]),
  updatePlan
);

// Delete a plan
router.delete(
  '/plans/:planId',
  validateRequest([param('planId').isInt()]),
  deletePlan
);

module.exports = router;
