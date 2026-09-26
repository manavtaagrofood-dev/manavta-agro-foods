export async function reportError(error,{requestId,route,method,userId}={}){
  const url=process.env.ERROR_TRACKING_WEBHOOK_URL;
  if(!url) return {sent:false,configured:false};
  const payload={service:'manavta-agro-foods-api',environment:process.env.NODE_ENV||'development',timestamp:new Date().toISOString(),message:error?.message||String(error),stack:error?.stack,requestId,route,method,userId};
  const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),3000);
  try { const response=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload),signal:controller.signal}); return {sent:response.ok,configured:true,status:response.status}; }
  catch { return {sent:false,configured:true}; }
  finally {clearTimeout(timer)}
}
