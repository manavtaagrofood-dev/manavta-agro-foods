export const API=(import.meta.env.VITE_API_URL||'/api').replace(/\/$/,'');
let refreshPromise=null;
async function refreshSession(){
  if(!refreshPromise) refreshPromise=fetch(`${API}/v1/auth/refresh`,{method:'POST',credentials:'include',headers:{Accept:'application/json'}}).then(async res=>{const json=await res.json().catch(()=>({})); if(!res.ok||json.success===false) throw new Error(json.error?.message||'Session refresh failed'); localStorage.setItem('ma_token',json.data.token); return json.data.token;}).finally(()=>{refreshPromise=null});
  return refreshPromise;
}
export async function api(path,{method='GET',body,token,skipRefresh=false,idempotencyKey,signal,timeoutMs=10000,retries=method==='GET'?1:0}={}){
  const headers={'Accept':'application/json',...(body!==undefined?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`}:{})};
  if(idempotencyKey) headers['Idempotency-Key']=idempotencyKey;
  for(let attempt=0;;attempt++){
    const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),timeoutMs); const onAbort=()=>controller.abort(); signal?.addEventListener('abort',onAbort,{once:true});
    try{
      const res=await fetch(`${API}${path}`,{method,headers,body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal,credentials:'include'});
      const json=await res.json().catch(()=>({success:false,error:{message:'Invalid server response'}}));
      if(res.status===401&&token&&!skipRefresh&&path!=='/v1/auth/refresh'){
        try { const next=await refreshSession(); return api(path,{method,body,token:next,skipRefresh:true,idempotencyKey,signal,timeoutMs,retries}); } catch {}
      }
      if(!res.ok||json.success===false){const e=new Error(json.error?.message||`Request failed (${res.status})`);e.code=json.error?.code;e.status=res.status;e.requestId=json.error?.requestId;throw e;}
      return json;
    }catch(e){const retryable=(e.name==='AbortError'||e instanceof TypeError)&&attempt<retries&&!signal?.aborted; if(!retryable)throw e; await new Promise(r=>setTimeout(r,150*(attempt+1)));}
    finally{clearTimeout(timer);signal?.removeEventListener('abort',onAbort);}
  }
}
export const data=(promise)=>promise.then(r=>r.data);
export const makeIdempotencyKey=()=>crypto.randomUUID();
