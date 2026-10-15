import {authConfigured,sessionFromRequest} from '../../../lib/auth.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export function GET(request){return Response.json({configured:authConfigured()&&Boolean(process.env.AI_GATEWAY_MODEL),authenticated:Boolean(sessionFromRequest(request))},{headers:{'Cache-Control':'no-store'}});}
