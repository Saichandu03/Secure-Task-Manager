const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister({ name, email, password }) {
  const errors = {};
  if (!name || String(name).trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!email || !emailRe.test(String(email).toLowerCase())) errors.email = 'Valid email is required';
  if (!password || String(password).length < 6) errors.password = 'Password must be at least 6 characters';
  return { valid: Object.keys(errors).length === 0, errors };
}

function validateLogin({ email, password }) {
  const errors = {};
  if (!email || !emailRe.test(String(email).toLowerCase())) errors.email = 'Valid email is required';
  if (!password) errors.password = 'Password is required';
  return { valid: Object.keys(errors).length === 0, errors };
}

function validateTask({ title, description }) {
  const errors = {};
  if (!title || String(title).trim().length === 0) errors.title = 'Title is required';
  if (!description || String(description).trim().length === 0) errors.description = 'Description is required';
  return { valid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateRegister, validateLogin, validateTask };
