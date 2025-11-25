module.exports = function errorHandler(err, req, res, next) {
  console.error(err && err.stack ? err.stack : err);
  const status = err && err.status ? err.status : 500;
  const message = err && err.message ? err.message : 'Server error';
  res.status(status).json({ error: message });
};
