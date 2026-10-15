import {defineTool} from 'eve/tools';
import {z} from 'zod';
import {practiceItems} from '../../lib/study.mjs';
export default defineTool({description:'Retrieve stored practice questions for up to three chapters. Returns full option text and stable IDs, without revealing the answer. Ask one question at a time.',inputSchema:z.object({chapters:z.array(z.number().int().min(1).max(38)).min(1).max(3)}),execute:async({chapters})=>practiceItems(chapters)});
