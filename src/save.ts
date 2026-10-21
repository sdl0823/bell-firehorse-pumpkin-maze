import {getBankInfo} from './questions';
import type {State} from './core';
const storageKey='pumpkin-random-v3:';
export function saveResult(s:State){try{const best=Number(localStorage.getItem(storageKey+s.level.bankVersion+":"+s.seed))||Infinity;if(s.won&&s.elapsed<best)localStorage.setItem(storageKey+s.level.bankVersion+":"+s.seed,String(s.elapsed));}catch{/* Storage is optional. */}}
export function bestResult(seed:string){try{const v=Number(localStorage.getItem(storageKey+getBankInfo().key+":"+seed));return v>0?`${(v/1000).toFixed(1)} 秒`:'尚無紀錄';}catch{return '儲存不可用';}}

