function sanitizeUserInput(obj) {
  if (!obj || typeof obj !== 'object') return {};
  const out = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (typeof v === 'string') {
      out[k] = v.trim();
    } else if (Array.isArray(v)) {
      out[k] = v.map(i => (typeof i === 'string' ? i.trim() : i));
    } else {
      out[k] = v;
    }
  }
  return out;
}

module.exports = { sanitizeUserInput };
