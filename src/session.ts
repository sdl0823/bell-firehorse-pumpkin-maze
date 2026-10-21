import {initial,type State} from './state';
export const NEXT_ROUND_DELAY=3000;
/** Deterministic progression without timers, callbacks or scene-owned rules. */
export function advanceRound(s:State):State{
 if(s.menu||s.paused||!s.won||s.winCountdown<NEXT_ROUND_DELAY)return s;
 if(s.tutorial){const next=initial(false,s.seed,false);next.message='教學通關！正式第 1 關開始，請前往第一盞南瓜燈。';return next;}
 const round=s.round+1;const seed=`${s.sessionRootSeed.slice(0,105)}~round-${round}`;
 const next=initial(false,seed,false);next.round=round;next.cleared=s.cleared;next.totalElapsed=s.totalElapsed;next.sessionRootSeed=s.sessionRootSeed;
 next.message=`第 ${round} 關開始！已自動更換種子並開始計時，請前往第一盞南瓜燈。`;
 return next;
}
