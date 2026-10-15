import {defineTool} from 'eve/tools';
import {z} from 'zod';
import {getChapter} from '../../lib/study.mjs';
export default defineTool({description:'Retrieve the original curated learning module for one chapter, including source page ranges. This is not the complete textbook text.',inputSchema:z.object({chapter:z.number().int().min(1).max(38)}),execute:async({chapter})=>getChapter(chapter)});
