import {eveChannel} from 'eve/channels/eve';
import {sessionFromRequest} from '../../lib/auth.mjs';
export default eveChannel({
 auth: async (request) => {
   const session=sessionFromRequest(request);
   if(!session)return null;
   return {attributes:{purpose:'pharmacology-study'},authenticator:'study-cookie',principalId:session.id,principalType:'user'};
 }
});
