import type {Pos,Level} from './level';
import {normalizedSeed} from './level';
import {generateLevel,tutorialLevel} from './generator';
export type State={menu:boolean;round:number;cleared:number;totalElapsed:number;winCountdown:number;sessionRootSeed:string;seed:string;level:Level;player:Pos;horse:Pos;read:boolean[];solved:boolean[];paused:boolean;won:boolean;tutorial:boolean;elapsed:number;horseClock:number;horseMode:'idle'|'following'|'arrived';message:string;messageStageId:string|null;mistakes:number};
export function initial(menu=false,seed='pumpkin',tutorial=true,provided?:Level):State{const level=provided??(tutorial?tutorialLevel():generateLevel(seed));return {menu,round:1,cleared:0,totalElapsed:0,winCountdown:0,sessionRootSeed:normalizedSeed(seed),seed:normalizedSeed(seed),level,player:{...level.start},horse:{...level.start},read:[false,false,false],solved:[false,false,false],paused:false,won:false,tutorial,elapsed:0,horseClock:0,horseMode:'idle',mistakes:0,messageStageId:null,message:tutorial?'教學：方向鍵或 WASD 移動。靠近南瓜燈按 E 讀題，再親自走到 A／B／C／D 岔路按 E 選擇。H 顯示提示。可按「跳過教學」開始。':'正式關開始：前往第一盞南瓜燈，按 E 讀題。'};}

