import {key,same,type Level,type Pos} from './level';
export interface PassageState {level:Level;read:boolean[];solved:boolean[]}
const floorCache=new WeakMap<Level,Set<string>>();
export function isFloor(level:Level,p:Pos){let floors=floorCache.get(level);if(!floors){floors=new Set(level.floors);floorCache.set(level,floors);}return floors.has(key(p));}
/** Shared by player, horse, generator validation and tests. */
export function walkable(s:PassageState,p:Pos){return isFloor(s.level,p)&&!s.level.stages.some((g,i)=>(same(g.gate,p)&&!s.solved[i])||(g.answers.some(a=>same(a,p))&&!s.read[i]));}
export function reachable(s:PassageState,from:Pos){const queue=[from],prev=new Map<string,Pos|null>();if(!walkable(s,from))return prev;prev.set(key(from),null);for(let i=0;i<queue.length;i++){const p=queue[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const n={x:p.x+dx,y:p.y+dy};if(walkable(s,n)&&!prev.has(key(n))){prev.set(key(n),p);queue.push(n);}}}return prev;}
export function path(s:PassageState,from:Pos,to:Pos):Pos[]{const prev=reachable(s,from);if(!prev.has(key(to)))return [];const result:Pos[]=[];let p:Pos|null=to;while(p){result.unshift(p);p=prev.get(key(p))??null;}return result;}
