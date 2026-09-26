import rateLimit from 'express-rate-limit';
import {sanitizeMongo,sanitizeFreeTextBody} from './security-utils.js';
export const publicLimiter=rateLimit({windowMs:15*60*1000,max:300,standardHeaders:'draft-8',legacyHeaders:false,message:{success:false,error:{code:'RATE_LIMITED',message:'Too many requests; please try again later'}}});
export const authLimiter=rateLimit({windowMs:15*60*1000,max:20,standardHeaders:'draft-8',legacyHeaders:false,message:{success:false,error:{code:'AUTH_RATE_LIMITED',message:'Too many authentication attempts'}}});
export const writeLimiter=rateLimit({windowMs:15*60*1000,max:120,standardHeaders:'draft-8',legacyHeaders:false,message:{success:false,error:{code:'WRITE_RATE_LIMITED',message:'Too many write requests'}}});
export function sanitizeRequest(req,res,next){
  try {
    if (req.body && typeof req.body==='object') req.body=sanitizeFreeTextBody(sanitizeMongo(req.body));
    for (const key of ['query','params']) { if (req[key] && typeof req[key]==='object') { const clean=sanitizeMongo(req[key]); for (const k of Object.keys(req[key])) delete req[key][k]; Object.assign(req[key],clean); } }
    next();
  } catch (error) { next(error); }
}
