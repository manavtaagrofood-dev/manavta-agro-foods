import fs from 'node:fs';
import path from 'node:path';
const dir=process.env.LOG_DIR || path.resolve(process.cwd(),'logs');
const retentionDays=Number(process.env.LOG_RETENTION_DAYS||14);
let initialized=false;
function ensure(){ if(!initialized){fs.mkdirSync(dir,{recursive:true}); initialized=true;} }
function file(){return path.join(dir,`${new Date().toISOString().slice(0,10)}.log`)}
function rotate(){
  ensure(); const cutoff=Date.now()-retentionDays*86400000;
  for(const name of fs.readdirSync(dir)){if(!/^\d{4}-\d{2}-\d{2}\.log$/.test(name))continue; const stamp=Date.parse(name.slice(0,10)+'T00:00:00Z'); if(Number.isFinite(stamp)&&stamp<cutoff){try{fs.unlinkSync(path.join(dir,name))}catch{}}}
}
export function log(level,event,fields={}){const entry=JSON.stringify({ts:new Date().toISOString(),level,event,...fields}); if(process.env.NODE_ENV!=='test') console.log(entry); try{ensure();fs.appendFileSync(file(),entry+'\n');rotate()}catch(error){if(process.env.NODE_ENV!=='test')console.error(JSON.stringify({level:'warn',event:'log_persist_failed',message:error.message}))}}
