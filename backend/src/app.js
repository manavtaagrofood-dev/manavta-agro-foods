import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import crypto from 'node:crypto';
import routes from './routes/index.js';
import { env } from './config/env.js';
import { dbState } from './config/db.js';
import { publicLimiter,sanitizeRequest } from './middleware/security.js';
import {log} from './services/logger.js';
import { notFound, errorHandler } from './middleware/errors.js';

export function createApp(){
  const app=express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use((req,res,next)=>{ const started=process.hrtime.bigint(); req.id=crypto.randomUUID(); res.setHeader('X-Request-Id',req.id); res.setHeader('Cache-Control','no-store'); res.on('finish',()=>{const ms=Number(process.hrtime.bigint()-started)/1e6; if(env.nodeEnv!=='test') log('info','request_complete',{requestId:req.id,method:req.method,path:req.originalUrl,status:res.statusCode,durationMs:Number(ms.toFixed(2))});}); next(); });
  app.use(helmet({ crossOriginResourcePolicy:{ policy:'cross-origin' }, contentSecurityPolicy:{ directives:{ defaultSrc:["'self'"], baseUri:["'self'"], frameAncestors:["'none'"], objectSrc:["'none'"], imgSrc:["'self'",'data:', 'https:'], styleSrc:["'self'","'unsafe-inline'",'https://fonts.googleapis.com'], fontSrc:["'self'",'https://fonts.gstatic.com'], scriptSrc:["'self'"], connectSrc:["'self'"], formAction:["'self'"] } } }));
  app.use(cors({origin:env.frontendOrigin,credentials:true}));
  app.use(compression());
  app.use(express.json({limit:'1mb',strict:true}));
  app.use(morgan(env.nodeEnv==='production'?'combined':'dev'));
  app.use(sanitizeRequest);
  app.get('/api/health',(req,res)=>{const db=dbState(); const ready=db.state===1; res.status(ready?200:503).json({success:ready,data:{status:ready?'ok':'degraded',service:'manavta-agro-foods-api',version:'v1',database:db,time:new Date().toISOString()}});});
  app.get('/api/ready',(req,res)=>{const db=dbState(); const ready=db.state===1; res.status(ready?200:503).json({success:ready,data:{ready,service:'manavta-agro-foods-api',version:'v1',database:db,time:new Date().toISOString()}});});
  app.use('/api',publicLimiter,routes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
