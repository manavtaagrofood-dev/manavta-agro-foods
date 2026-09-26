import { ZodError } from 'zod'; import {reportError} from '../services/errorTracking.js'; import {log} from '../services/logger.js';
export function notFound(req, res) { return res.status(404).json({ success:false, error:{ code:'NOT_FOUND', message:`Route ${req.method} ${req.originalUrl} not found` }}); }
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err instanceof ZodError) return res.status(422).json({ success:false, error:{ code:'VALIDATION_ERROR', message:'Request validation failed', details:err.issues } });
  if (err?.code === 11000) return res.status(409).json({ success:false, error:{ code:'DUPLICATE_RESOURCE', message:'A resource with the same unique value already exists' }});
  const status = Number.isInteger(err?.statusCode) ? err.statusCode : 500;
  const safeMessage = status >= 500 ? 'Internal server error' : (err.message || 'Request failed');
  if (process.env.NODE_ENV !== 'test') { log('error','request_error',{requestId:req.id,message:err.message,stack:err.stack,status}); reportError(err,{requestId:req.id,route:req.originalUrl,method:req.method,userId:req.user?._id}).catch(()=>{}); }
  return res.status(status).json({ success:false, error:{ code:err.code || (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'), message:safeMessage, requestId:req.id } });
}
