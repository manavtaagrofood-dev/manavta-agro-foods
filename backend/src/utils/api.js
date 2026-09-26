export function ok(res, data, status = 200, meta) {
  return res.status(status).json({ success: true, data, ...(meta ? { meta } : {}) });
}
export function fail(res, message, status = 400, code = 'BAD_REQUEST', details) {
  return res.status(status).json({ success: false, error: { code, message, ...(details ? { details } : {}) } });
}
