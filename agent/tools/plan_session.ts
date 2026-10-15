import {defineTool} from 'eve/tools';
import {z} from 'zod';
import {sessionPlan} from '../../lib/study.mjs';
export default defineTool({description:'Create a bounded study session from the seven-day course and optional browser progress. Preserves the list of unfinished daily chapters; does not mark any chapter complete.',inputSchema:z.object({day:z.number().int().min(1).max(7),minutes:z.number().int().min(10).max(240),progress:z.unknown().optional()}),execute:async(input)=>sessionPlan(input)});
