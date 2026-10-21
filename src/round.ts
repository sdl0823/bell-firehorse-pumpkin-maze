import type {Question} from './questions';
import {random,shuffled} from './random';
/** Sampling is independent of map retries; correctness always stays attached to IDs. */
export function sampleRound(bank:readonly Question[],seed:string,bankKey:string){if(bank.length<3)throw new Error('至少需要3題');const stable=[...bank].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);return shuffled(stable,random(`${seed}|${bankKey}|round`)).slice(0,3);}
export function arrangeOptions(question:Question,seed:string,bankKey:string){return shuffled(question.options,random(`${seed}|${bankKey}|${question.id}|options`)).map(o=>o.id);}
