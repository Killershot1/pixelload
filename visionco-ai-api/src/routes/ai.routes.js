const express = require('express');
const Joi = require('joi');
const aiController = require('../controllers/ai.controller');

const router = express.Router();

/**
 * Middleware for Joi validation
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

// --- Validation Schemas ---
const searchSchema = Joi.object({
  query: Joi.string().min(3).required(),
  clientId: Joi.string().required()
});

const summarizeSchema = Joi.object({
  url: Joi.string().uri().required(),
  clientId: Joi.string().required()
});

const recommendSchema = Joi.object({
  clientId: Joi.string().required(),
  watchHistory: Joi.array().items(Joi.string()).default([])
});

// --- Routes ---
router.post('/search', validate(searchSchema), aiController.search);
router.post('/summarize', validate(summarizeSchema), aiController.summarize);
router.post('/recommend', validate(recommendSchema), aiController.recommend);

module.exports = router;
