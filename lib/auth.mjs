import {createHmac,timingSafeEqual,randomUUID} from 'node:crypto';
export const COOKIE='rehabpharm_coach';
const sign=(text,secret)=>createHmac('sha256',secret).update(text).digest('base64url');
export function safeEqual(a,b){if(typeof a!=='string'||typeof b!=='string')return false;const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
export function authConfigured(env=process.env){return Boolean(env.STUDY_ACCESS_CODE?.length>=16&&env.STUDY_SESSION_SECRET?.length>=32);}
export function mintSession(secret,now=Date.now()){const data=Buffer.from(JSON.stringify({id:randomUUID(),exp:now+12*60*60*1000})).toString('base64url');return data+'.'+sign(data,secret);}
export function verifySession(token,secret,now=Date.now()){
 try{if(!secret||secret.length<32||typeof token!=='string'||token.length>1000)return null;const [data,sig,...extra]=token.split('.');if(extra.length||!safeEqual(sig,sign(data,secret)))return null;const payload=JSON.parse(Buffer.from(data,'base64url').toString());if(!/^[a-f0-9-]{36}$/.test(payload.id)||!Number.isFinite(payload.exp)||payload.exp<=now)return null;return {id:payload.id,exp:payload.exp};}catch{return null;}
}
export function sessionFromRequest(request,env=process.env){if(!authConfigured(env))return null;const cookie=request.headers.get('cookie')||'';const token=cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);return verifySession(token,env.STUDY_SESSION_SECRET);}
