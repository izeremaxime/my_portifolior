const express = require('express');
const rateLimit = require('express-rate-limit');
const contactController = require('../controllers/contactController');

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many submissions. Please try again later.' },
});

router.get('/', (req, res) => {
  res.render('index', {
    title: 'Maxime | Software Engineer & Full-Stack Developer',
    description:
      'Portfolio of Maxime, a software engineer and developer building modern web applications, business systems, e-commerce experiences and digital products.',
  });
});

router.post('/contact', contactLimiter, contactController.submitContactForm);

module.exports = router;
