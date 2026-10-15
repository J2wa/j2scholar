import {defineTool} from 'eve/tools';
import {z} from 'zod';
import {searchChapters} from '../../lib/study.mjs';
export default defineTool({description:'Search the 38 curated chapter modules by drug, mechanism, or concept. Returns relevant notes and chapter-level page references.',inputSchema:z.object({query:z.string().min(2).max(250)}),execute:async({query})=>searchChapters(query)});
