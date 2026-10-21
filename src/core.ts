import {getQuestion} from './questions';
import {same} from './level';
import {initial,type State} from './state';
import type {Command} from './commands';
import {walkable,path} from './navigation';
export {initial} from './state';export type {State} from './state';export type {Command} from './commands';export {walkable,path} from './navigation';
const distance=(a:{x:number;y:number},b:{x:number;y:number})=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
function victory(s:State){if(!s.won&&same(s.player,s.level.exit)&&same(s.horse,s.level.exit)){s.won=true;if(!s.tutorial)s.cleared++;s.winCountdown=0;s.horseMode='arrived';s.message='通關！小貝爾與火馬都抵達出口。3 秒後自動更換種子進入下一關；可暫停或按「離開不玩」。';}}
export function command(s:State,c:Command):State{
 if(c.type==='menu'){const next=initial(true,s.seed);next.round=s.round;next.cleared=s.cleared;next.totalElapsed=s.totalElapsed;return next;}
 if(c.type==='tutorial')return initial(false,c.seed??s.seed);
 if(c.type==='skip'||c.type==='new')return initial(false,c.seed??s.seed,false);
 if(s.menu)return s;
 if(c.type==='replay')return initial(false,s.seed,s.tutorial,s.level);
 if(c.type==='pause'){s.paused=!s.paused;return s;}
 if(s.paused||s.won)return s;
 if(c.type==='move'){if(Math.abs(c.dx)+Math.abs(c.dy)!==1)return s;const p={x:s.player.x+c.dx,y:s.player.y+c.dy};if(walkable(s,p)){s.player=p;if(s.messageStageId){const owner=s.level.stages.find(stage=>stage.id===s.messageStageId);if(owner&&(p.x<owner.lamp.x-1||p.x>owner.gate.x)){s.message='';s.messageStageId=null;}}}victory(s);return s;}
 const i=s.solved.findIndex(v=>!v);if(i<0){s.message='三道題都完成了！帶火馬一起前往出口。';return s;}
 const stage=s.level.stages[i],q=getQuestion(stage.questionId);
 if(c.type==='help'){s.messageStageId=s.read[i]?stage.id:null;s.message=s.read[i]?`提示：${q.hint.text}`:'先走到目前的南瓜燈旁，按 E 閱讀題目。';return s;}
 const choice=stage.answers.findIndex(p=>same(p,s.player));
 if(choice>=0){s.messageStageId=stage.id;if(!s.read[i])s.message='尚未讀題。請先回南瓜燈旁按 E。';else if(stage.optionIds[choice]===q.answer.optionId){s.solved[i]=true;s.message=`答對了！第 ${i+1} 道門已開啟。${i===2?'帶火馬一起前往出口。':'繼續前往下一盞南瓜燈。'}`;}else {s.mistakes++;const selected=q.options.find(o=>o.id===stage.optionIds[choice])!;s.message=`答錯了：「${selected.text}」
原因：${selected.wrongReason}
提示：${q.hint.text}
可以返回再試，已完成的進度會保留。`;}return s;}
 if(distance(s.player,stage.lamp)<=1){s.messageStageId=stage.id;s.read[i]=true;s.message=`第 ${i+1} 題：${q.prompt}\n${stage.optionIds.map((id,index)=>`${'ABCD'[index]}：${q.options.find(o=>o.id===id)!.text}`).join('\n')}\n請親自走到答案岔路標記上，按 E 選擇。`;}
 else {s.messageStageId=null;s.message='靠近目前的南瓜燈按 E 讀題；站在答案標記上按 E 選路。';}return s;
}
export function tick(s:State,dt:number){
 if(s.menu||s.paused||!Number.isFinite(dt)||dt<=0)return;
 if(s.won){s.winCountdown+=dt;return;}
 if(!s.tutorial){s.elapsed+=dt;s.totalElapsed+=dt;}
 s.horseClock+=dt;
 while(s.horseClock>=220){
  const route=path(s,s.horse,s.player);s.horseMode=route.length>1?'following':'idle';
  if(route.length<2){s.horseClock%=220;break;}
  s.horseClock-=220;s.horse={...route[1]};victory(s);if(s.won)break;
 }
}
