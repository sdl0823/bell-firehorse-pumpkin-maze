import {GENERATOR_VERSION,key,normalizedSeed,type Level,type Stage} from './level';
import {questions,validateQuestionBank,getBankInfo,tutorialQuestions} from './questions';
import {sampleRound,arrangeOptions} from './round';
import {random,shuffled} from './random';
import {validateLevel} from './validation';
export const MAX_ATTEMPTS=4;
export function candidate(seed:string,attempt:number,fixed=false):Level{
 const rng=random(`${GENERATOR_VERSION}|${seed}|${attempt}|map`);
 const selection=sampleRound(questions,seed,getBankInfo().key);
 const floors=new Set<string>();const stages:Stage[]=[];
 const line=(x1:number,y1:number,x2:number,y2:number)=>{for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++)for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y++)floors.add(key({x,y}));};
 let entryY=6;
 for(let i=0;i<3;i++){
  const base=1+i*7,center=fixed?6:5+Math.floor(rng()*4);
  line(base,entryY,base+1,entryY);line(base+1,entryY,base+1,center);line(base+1,center,base+6,center);
  const rows=fixed?[2,4,8,10]:(rng()<.5?[1,3,11,13]:[2,4,10,12]);
  line(base+3,rows[0],base+3,rows[3]);
  const answers=rows.map(y=>{const x=base+(fixed?4:4+Math.floor(rng()*2));line(base+3,y,x,y);return {x,y};});
  const q=selection[i];stages.push({id:`stage-${i+1}`,lamp:{x:base+2,y:center},gate:{x:base+6,y:center},answers,questionId:q.id,optionIds:arrangeOptions(q,seed,getBankInfo().key)});
  entryY=center;
 }
 line(22,entryY,23,entryY);
 return {version:GENERATOR_VERSION,bankVersion:getBankInfo().key,seed,width:25,height:15,start:{x:1,y:6},exit:{x:23,y:entryY},floors:[...floors].sort(),stages,attempt,fallback:fixed,failures:[]};
}
export type CandidateBuilder=(seed:string,attempt:number)=>Level;
export function generateLevel(rawSeed:string,options:{builder?:CandidateBuilder;maxAttempts?:number}={}):Level{
 validateQuestionBank();const seed=normalizedSeed(rawSeed),failures:string[]=[];
 const count=Math.max(1,Math.min(MAX_ATTEMPTS,Math.floor(options.maxAttempts??MAX_ATTEMPTS)||MAX_ATTEMPTS));
 for(let attempt=0;attempt<count;attempt++){
  try{const level=(options.builder??candidate)(seed,attempt);const errors=validateLevel(level);if(!errors.length)return {...level,seed,attempt,fallback:false,failures};failures.push(`attempt-${attempt+1}: ${errors.join(',')}`);}catch(error){failures.push(`attempt-${attempt+1}: ${String(error)}`);}
 }
 const backup=candidate(seed,count,true);const errors=validateLevel(backup);if(errors.length)throw new Error(`Fallback validation failed: ${errors.join(',')}`);
 return {...backup,fallback:true,failures};
}
export function tutorialLevel():Level{
 const level=candidate('tutorial',0,true);
 level.stages.forEach((stage,i)=>{stage.questionId=tutorialQuestions[i].id;stage.optionIds=tutorialQuestions[i].options.map(o=>o.id);});
 const errors=validateLevel(level);if(errors.length)throw new Error(errors.join(','));return level;
}
