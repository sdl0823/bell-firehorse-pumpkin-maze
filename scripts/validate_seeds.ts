import {writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {generateLevel,candidate} from '../src/generator';
import {validateLevel} from '../src/validation';
import {initial,command,tick,path,type State} from '../src/core';
import {getQuestion} from '../src/questions';
import {key,type Pos,type Level} from '../src/level';
function run(level:Level){const s=initial(false,level.seed,false,level);let moves=0;const go=(to:Pos)=>{const route=path(s,s.player,to);assert.ok(route.length);for(const p of route.slice(1)){command(s,{type:'move',dx:p.x-s.player.x,dy:p.y-s.player.y});tick(s,220);moves++;}};const cases=[];for(let i=0;i<3;i++){const stage=level.stages[i],q=getQuestion(stage.questionId);assert.equal(path(s,s.player,level.exit).length,0);go(stage.lamp);command(s,{type:'interact'});const correct=stage.optionIds.indexOf(q.answer.optionId);for(let a=0;a<4;a++)if(a!==correct){go(stage.answers[a]);command(s,{type:'interact'});assert.equal(s.solved[i],false);go(stage.lamp);}go(stage.answers[correct]);command(s,{type:'interact'});assert.deepEqual(s.solved,[0,1,2].map(j=>j<=i));cases.push({questionId:q.id,answerId:q.answer.id,answerOptionId:q.answer.optionId,correctLocation:'ABCD'[correct],hintId:q.hint.id,lamp:stage.lamp,gate:stage.gate});}go(level.exit);let horseTicks=0;for(;horseTicks<200&&!s.won;horseTicks++)tick(s,220);assert.ok(s.won);return {seed:level.seed,fallback:level.fallback,attempt:level.attempt+1,floors:level.floors.length,mapHash:createHash('sha256').update(JSON.stringify(level.floors)).digest('hex').slice(0,12),cases,wrongAttempts:s.mistakes,moves,horseTicks,won:s.won};}
const seeds=['pumpkin','halloween-2026','0','42','小貝爾與火馬','🎃','000042','boundary-4294967295'];
const examples=seeds.map(seed=>run(generateLevel(seed)));
const total=1000;let fallbackCount=0,retryCount=0;const maps=new Set<string>(),correctPositions=new Set<string>();
for(let i=0;i<total;i++){const seed=`audit-${i}`,level=generateLevel(seed);assert.deepEqual(validateLevel(level),[],seed);assert.deepEqual(level,generateLevel(seed));assert.equal(new Set(level.stages.map(s=>s.questionId)).size,3);maps.add(JSON.stringify(level.floors));fallbackCount+=Number(level.fallback);retryCount+=Number(level.attempt>0);for(const st of level.stages)correctPositions.add('ABCD'[st.optionIds.indexOf(getQuestion(st.questionId).answer.optionId)]);if(i<100)run(level);}
let retries=0;const recovered=generateLevel('retry-case',{builder:(seed,attempt)=>{retries++;const level=candidate(seed,attempt);if(attempt<2)level.floors=level.floors.filter(p=>p!==key(level.exit));return level;}});assert.equal(retries,3);assert.equal(recovered.attempt,2);
let failedCalls=0;const backup=generateLevel('fallback-case',{builder:()=>{failedCalls++;throw new Error('Injected failure');}});assert.equal(failedCalls,4);const fallback=run(backup);
const report={version:examples.length&&generateLevel('42').version,bulk:{seeds:'audit-0 through audit-999',total,uniqueMaps:maps.size,retryCount,fallbackCount,correctPositions:[...correctPositions].sort(),fullPlaythroughsWithNineWrongAnswers:100},examples,injectedRetry:{seed:'retry-case',calls:retries,successfulAttempt:recovered.attempt+1,failures:recovered.failures},injectedFallback:{calls:failedCalls,failures:backup.failures,result:fallback}};
writeFileSync('SEED-VALIDATION.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
