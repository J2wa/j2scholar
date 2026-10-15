import {defineTool} from 'eve/tools';
import {z} from 'zod';
import {gradeChoice} from '../../lib/study.mjs';
export default defineTool({description:'Grade a stored multiple-choice question using its stable ID and the learner’s full chosen option text. Return the stored explanation and source. Do not grade ambiguous letters or free-form reasoning with this exact-match tool.',inputSchema:z.object({questionId:z.string().regex(/^(\d+)-q([01])$/),answer:z.string().min(1).max(500)}),execute:async({questionId,answer})=>gradeChoice(questionId,answer)});
