export type Pos={x:number;y:number};
export type Stage={id:string;lamp:Pos;gate:Pos;answers:Pos[];questionId:string;optionIds:string[]};
export type Level={version:string;bankVersion:string;seed:string;width:number;height:number;start:Pos;exit:Pos;floors:string[];stages:Stage[];attempt:number;fallback:boolean;failures:string[]};
export const GENERATOR_VERSION='pumpkin-v1';
export const CELL_SIZE=34;
export const COLLIDER_DIAMETER=.64; // Both actors: 21.76 px inside a 34 px corridor.
export const CORRIDOR_WIDTH=1;
export const key=(p:Pos)=>`${p.x},${p.y}`;
export const same=(a:Pos,b:Pos)=>a.x===b.x&&a.y===b.y;
export function normalizedSeed(seed:string){return seed.trim().slice(0,128)||'pumpkin';}
