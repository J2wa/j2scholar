import {authConfigured,COOKIE,mintSession,safeEqual} from '../../../lib/auth.mjs';
export const runtime='nodejs';
export async function POST(request){
 const reply=(body,status,headers={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store',...headers}});
 if(!authConfigured())return reply({error:'Coach access is not configured. Ask the site owner to set the access code and signing secret.'},503);
 if(request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Origin not allowed.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({error:'Use a JSON request.'},415);
 try{const text=await request.text();if(text.length>4096)return reply({error:'Request too large.'},413);const data=JSON.parse(text);if(!safeEqual(data.code,process.env.STUDY_ACCESS_CODE))return reply({error:'That access code was not accepted.'},401);
 const session=mintSession(process.env.STUDY_SESSION_SECRET);const secure=new URL(request.url).protocol==='https:'?'; Secure':'';
 return reply({ok:true},200,{'Set-Cookie':`${COOKIE}=${session}; Path=/; HttpOnly; SameSite=Strict; Max-Age=43200${secure}`});
 }catch{return reply({error:'The request could not be read.'},400);}
}
export async function DELETE(request){if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Origin not allowed.'},{status:403});return Response.json({ok:true},{headers:{'Set-Cookie':`${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,'Cache-Control':'no-store'}});}
