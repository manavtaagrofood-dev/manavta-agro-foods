import http from 'node:http'; import {createApp} from './app.js'; import {connectDb,disconnectDb} from './config/db.js'; import {env} from './config/env.js'; import {verifySmtp} from './services/notificationService.js';
const app=createApp(); const server=http.createServer(app);
server.requestTimeout=15000;
server.headersTimeout=16000;
server.keepAliveTimeout=5000;
async function start(){await connectDb(); if(env.requireLeadNotifications) await verifySmtp(); server.listen(env.port,()=>console.log(JSON.stringify({level:'info',event:'server_started',port:env.port,env:env.nodeEnv})));}
async function shutdown(signal){console.log(JSON.stringify({level:'info',event:'shutdown',signal})); server.close(async()=>{await disconnectDb();process.exit(0);}); setTimeout(()=>process.exit(1),10000).unref();}
process.on('SIGTERM',()=>shutdown('SIGTERM')); process.on('SIGINT',()=>shutdown('SIGINT')); process.on('unhandledRejection',e=>{console.error(JSON.stringify({level:'error',event:'unhandled_rejection',message:e?.message}));}); process.on('uncaughtException',e=>{console.error(JSON.stringify({level:'error',event:'uncaught_exception',message:e?.message}));process.exit(1);});
start().catch(e=>{console.error(JSON.stringify({level:'error',event:'startup_failed',message:e.message}));process.exit(1);});
