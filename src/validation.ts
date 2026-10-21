import {COLLIDER_DIAMETER,CORRIDOR_WIDTH,key,type Level,type Pos} from './level';
import {getQuestion} from './questions';
import {isFloor,reachable,walkable} from './navigation';
export function validateLevel(level:Level):string[]{
 const errors:string[]=[];const check=(ok:boolean,message:string)=>{if(!ok)errors.push(message);};
 check(level.stages.length===3,'exactly-three-stages');
 check(COLLIDER_DIAMETER<CORRIDOR_WIDTH,'collider-fits-corridor');
 check(new Set(level.floors).size===level.floors.length,'duplicate-floor');
 for(const cell of level.floors){const [x,y]=cell.split(',').map(Number);check(Number.isInteger(x)&&Number.isInteger(y)&&x>0&&x<level.width-1&&y>0&&y<level.height-1,'floor-bounds');}
 check(new Set(level.stages.map(s=>s.questionId)).size===3,'unique-questions');
 // Sweep the same actor footprint over each axis-aligned grid edge, including tile boundaries.
 const radius=COLLIDER_DIAMETER/2;
 for(const cell of level.floors){const [x,y]=cell.split(',').map(Number);for(const [dx,dy] of [[1,0],[0,1]])if(isFloor(level,{x:x+dx,y:y+dy}))for(const t of [0,.25,.5,.75,1])for(const sx of [-radius,radius])for(const sy of [-radius,radius])check(isFloor(level,{x:Math.floor(x+dx*t+sx+.5),y:Math.floor(y+dy*t+sy+.5)}),'actor-footprint-wall');}

 const special:Pos[]=[level.start,level.exit];
 for(const stage of level.stages){special.push(stage.lamp,stage.gate,...stage.answers);check(stage.answers.length===4,'four-answer-locations');try{const q=getQuestion(stage.questionId);check(stage.optionIds.length===4&&new Set(stage.optionIds).size===4&&stage.optionIds.every(id=>q.options.some(o=>o.id===id)),'option-id-mapping');}catch{errors.push('unknown-question');}}
 check(new Set(special.map(key)).size===special.length,'distinct-special-cells');check(special.every(p=>isFloor(level,p)),'special-cells-on-floor');
 if(errors.length)return [...new Set(errors)];
 const all={level,read:[true,true,true],solved:[true,true,true]};
 check(reachable(all,level.start).size===level.floors.length,'all-floor-connected');
 // Every gate combination, including non-prefix masks: no later gate can bypass an earlier one.
 for(let mask=0;mask<8;mask++){
  const s={level,read:[true,true,true],solved:[0,1,2].map(i=>!!(mask&(1<<i)))};
  const area=reachable(s,level.start);
  check(area.has(key(level.exit))===(mask===7),`exit-order-mask-${mask}`);
  level.stages.forEach((stage,i)=>{const expected=s.solved.slice(0,i).every(Boolean);check(area.has(key(stage.lamp))===expected,`lamp-order-${i}-mask-${mask}`);});
 }
 for(let i=0;i<3;i++){
  const s={level,read:[false,false,false],solved:[0,1,2].map(j=>j<i)};
  check(reachable(s,level.start).has(key(level.stages[i].lamp)),`lamp-before-reading-${i}`);
  check(level.stages[i].answers.every(p=>!walkable(s,p)),`answers-locked-unread-${i}`);
  s.read[i]=true;const area=reachable(s,level.stages[i].lamp);
  for(let a=0;a<4;a++){const p=level.stages[i].answers[a];check(area.has(key(p)),`answer-access-${i}-${a}`);check(reachable(s,p).has(key(level.stages[i].lamp)),`safe-return-${i}-${a}`);}
  check(!area.has(key(level.stages[i].gate)),`gate-locked-${i}`);
 }
 return [...new Set(errors)];
}
