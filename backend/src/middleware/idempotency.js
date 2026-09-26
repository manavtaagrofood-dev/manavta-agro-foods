import {IdempotencyRecord} from '../models/IdempotencyRecord.js';

const PROCESSING_TIMEOUT_MS = 30_000;

export async function idempotency(req,res,next){
  const key=req.get('Idempotency-Key');
  if(!key)return next();
  if(!/^[A-Za-z0-9._:-]{8,120}$/.test(key))return res.status(400).json({success:false,error:{code:'INVALID_IDEMPOTENCY_KEY',message:'Idempotency-Key must be 8–120 characters and contain only letters, numbers, dot, underscore, colon or hyphen'}});
  const scope=`${req.user?._id||'anon'}:${req.method}:${req.originalUrl}:${key}`;
  const expiresAt=new Date(Date.now()+24*60*60*1000);
  try{
    let record=await IdempotencyRecord.findOne({scope});
    if(record?.status===0 && record.createdAt < new Date(Date.now()-PROCESSING_TIMEOUT_MS)){
      await IdempotencyRecord.deleteOne({_id:record._id});
      record=null;
    }
    if(!record){
      try{
        record=await IdempotencyRecord.create({scope,status:0,expiresAt});
      }catch(err){
        if(err?.code===11000) record=await IdempotencyRecord.findOne({scope});
        else throw err;
      }
    }
    if(!record) return res.status(503).json({success:false,error:{code:'IDEMPOTENCY_UNAVAILABLE',message:'Please retry the request'}});
    if(record.status===0){
      // A duplicate arriving while the first request is genuinely running must not create a second lead.
      return res.status(409).set('Retry-After','2').json({success:false,error:{code:'IDEMPOTENCY_IN_PROGRESS',message:'A request with this Idempotency-Key is already being processed',retryAfter:2}});
    }
    return res.status(record.status).json(record.body);
  }catch(err){
    next(err);
  }
}

// Express middleware wrapper used by write routes. It claims the key and finalizes it on response.
export async function claimIdempotency(req,res,next){
  const key=req.get('Idempotency-Key');
  if(!key)return next();
  if(!/^[A-Za-z0-9._:-]{8,120}$/.test(key))return res.status(400).json({success:false,error:{code:'INVALID_IDEMPOTENCY_KEY',message:'Idempotency-Key must be 8–120 characters and contain only letters, numbers, dot, underscore, colon or hyphen'}});
  const scope=`${req.user?._id||'anon'}:${req.method}:${req.originalUrl}:${key}`;
  const expiresAt=new Date(Date.now()+24*60*60*1000);
  try{
    let record=await IdempotencyRecord.findOne({scope});
    if(record?.status===0 && record.createdAt < new Date(Date.now()-PROCESSING_TIMEOUT_MS)){
      await IdempotencyRecord.deleteOne({_id:record._id});
      record=null;
    }
    let created=false;
    if(!record){
      try{
        record=await IdempotencyRecord.create({scope,status:0,expiresAt});
        created=true;
      }catch(err){
        if(err?.code===11000)record=await IdempotencyRecord.findOne({scope});
        else throw err;
      }
    }
    if(!record)return res.status(503).json({success:false,error:{code:'IDEMPOTENCY_UNAVAILABLE',message:'Please retry the request'}});
    if(!created && record.status===0){
      return res.status(409).set('Retry-After','2').json({success:false,error:{code:'IDEMPOTENCY_IN_PROGRESS',message:'A request with this Idempotency-Key is already being processed',retryAfter:2}});
    }
    if(!created && record.status!==0)return res.status(record.status).json(record.body);

    const originalJson=res.json.bind(res);
    res.json=body=>{
      const status=res.statusCode||200;
      IdempotencyRecord.updateOne({_id:record._id},{$set:{status,body}}).catch(err=>console.error(JSON.stringify({level:'warn',event:'idempotency_finalize_failed',message:err.message})));
      return originalJson(body);
    };
    res.once('finish',()=>{if(res.statusCode>=500)IdempotencyRecord.deleteOne({_id:record._id}).catch(()=>{});});
    next();
  }catch(err){next(err);}
}
