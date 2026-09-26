const base=(process.env.BASE_URL||'http://localhost:5000').replace(/\/$/,'');
const paths=['/api/health','/api/ready','/api/v1/products?limit=12&meta=false'];
let failed=false;
for(const path of paths){
  const started=performance.now();
  try{
    const r=await fetch(base+path,{headers:{Accept:'application/json'}});
    const ms=Math.round(performance.now()-started);
    const text=await r.text();
    console.log(JSON.stringify({path,status:r.status,durationMs:ms,bytes:Buffer.byteLength(text)}));
    if(!r.ok) failed=true;
  }catch(e){console.error(JSON.stringify({path,error:e.message}));failed=true;}
}
if(failed) process.exit(1);
