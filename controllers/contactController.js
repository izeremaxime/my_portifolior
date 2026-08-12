const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(value) {
  return String(value || '').trim().slice(0, 5000);
}

function validate({ name, email, message }) {
  const errors = {};

  if (!name || sanitize(name).length < 2) {
    errors.name = 'Please enter your name (at least 2 characters).';
  } else if (sanitize(name).length > 120) {
    errors.name = 'Name is too long.';
  }

  if (!email || !EMAIL_RE.test(sanitize(email)) || sanitize(email).length > 254) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!message || sanitize(message).length < 10) {
    errors.message = 'Message should be at least 10 characters.';
  } else if (sanitize(message).length > 5000) {
    errors.message = 'Message is too long.';
  }

  return errors;
}

function wantsJSON(req) {
  return req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest' || (req.get('Accept') || '').includes('application/json');
}

exports.submitContactForm = (req, res) => {
  if (sanitize(req.body.website)) {
    return res.status(200).json({ success: true, message: 'Thanks — message received.' });
  }

  const name = sanitize(req.body.name);
  const email = sanitize(req.body.email);
  const message = sanitize(req.body.message);

  const errors = validate({ name, email, message });

  if (Object.keys(errors).length > 0) {
    if (wantsJSON(req)) {
      return res.status(400).json({ success: false, errors });
    }
    return res.redirect('/?contact=error#contact');
  }

  console.log('[contact] New submission:', {
    name,
    email,
    message,
    receivedAt: new Date().toISOString(),
  });

  if (wantsJSON(req)) {
    return res.status(200).json({ success: true, message: "Thanks — I'll get back to you soon." });
  }
  return res.redirect('/?contact=success#contact');
};
