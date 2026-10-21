import {GameAudio} from './audio';
import Phaser from 'phaser';
import {initial,command,tick,type Command} from './core';
import {same,CELL_SIZE,normalizedSeed} from './level';
import {isFloor} from './navigation';
import {keyboardCommand} from './input';
import {saveResult,bestResult} from './save';
import './style.css';
import {installQuestionBank} from './questions';
import {loadQuestionBank} from './questionLoader';
import {advanceRound,NEXT_ROUND_DELAY} from './session';
async function bootstrap(){
await loadQuestionBank();
try{const saved=localStorage.getItem('pumpkin-imported-bank-v1');if(saved)installQuestionBank(JSON.parse(saved),'已儲存的匯入題庫');}catch{/* Keep the valid bundled/data-file bank. */}

const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`<main><div class="soundbar"><button id="sound-toggle" aria-pressed="false">♫ 開啟音樂與音效</button></div>
<section id="menu" aria-label="開頭選單">
 <div class="menu-top"><span>HALLOWEEN · 南瓜燈迷徑</span><span>單人冒險 / 三題四選一</span></div>
 <div class="menu-body"><div class="menu-copy"><p class="eyebrow">跟著燈火，找到你的答案</p><h1>小貝爾與火馬<br><em>南瓜燈迷徑</em></h1><p class="intro">南瓜燈準備了三道萬聖節小謎題。<br>先讀題，再走進 A、B、C、D 岔路，<br>帶著火馬一起找到出口！</p><div class="seed-choice"><p>本次種子：<output id="seed-value"></output></p><button id="random-seed">🎲 隨機種子</button></div><div class="menu-actions"><button class="primary" data-c="skip">開始冒險</button><button data-c="tutorial">操作教學</button></div><p class="menu-note">開始後自動計時；通關3秒後自動下一關，直到按「離開不玩」。</p></div><div class="cast"><figure><img class="portrait bell" src="./characters/bell-animated.png" alt="去背小貝爾轉身動畫"><figcaption>小貝爾 <small>由你操作</small></figcaption></figure><figure><img class="portrait horse" src="./characters/horse-animated.png" alt="去背火馬幼駒轉身動畫"><figcaption>火馬幼駒 <small>沿通路跟隨</small></figcaption></figure></div></div>
 <p id="session-summary" class="menu-note"></p><div class="menu-steps"><span>01 靠近南瓜燈讀題</span><span>02 走到答案格按 E</span><span>03 一起抵達出口</span></div>
</section>
<section id="play" hidden><header><p class="eyebrow">萬聖節小謎題 · 三題四選一</p><h1>小貝爾與火馬：南瓜燈迷徑</h1><p>每題四條答案岔路。先靠近南瓜燈，再選擇你要走的路。</p></header>
<section class="toolbar"><button data-c="menu">離開不玩</button><button data-c="skip" id="skip">跳過教學</button><button data-c="interact">互動 E</button><button data-c="help">協助 H</button><button data-c="pause">暫停 P</button><button data-c="replay">同種子重玩 R</button><button data-c="new">新的一關</button></section><div id="status"></div><div class="seed-info"><span id="seed-info"></span> <a id="seed-link">重現此種子</a></div><div id="game"></div><section id="message" role="status" aria-live="polite"></section><section class="controls"><button data-dir="0,-1" aria-label="向上">↑</button><div><button data-dir="-1,0" aria-label="向左">←</button><button data-dir="0,1" aria-label="向下">↓</button><button data-dir="1,0" aria-label="向右">→</button></div></section><footer>方向鍵 / WASD 移動 · E / 空白鍵互動 · H 協助 · P / Esc 暫停 · R 重玩<br>角色已去背；移動時依方向轉身，停下時輕微呼吸。<br>未讀題時四個答案格皆鎖定；答對只開啟該題門障。</footer></section></main>`;
const audio=new GameAudio();
const freshSeed=()=>crypto.randomUUID().slice(0,8);
const requestedSeed=normalizedSeed(new URL(location.href).searchParams.get('seed')??freshSeed());
const seedValue=document.querySelector<HTMLOutputElement>('#seed-value')!;let selectedSeed=requestedSeed;seedValue.textContent=selectedSeed;
let state=initial(true,requestedSeed),saved=false;
document.querySelector<HTMLButtonElement>('#random-seed')!.onclick=()=>{let seed=freshSeed();while(seed===selectedSeed)seed=freshSeed();selectedSeed=seed;seedValue.textContent=seed;};
let playerFacing=0,horseFacing=0,lastPlayerMove=-10000,lastHorseMove=-10000;
let animationClock=0;
function dispatch(c:Command){
 const before={player:{...state.player},read:state.read.filter(Boolean).length,solved:state.solved.filter(Boolean).length,mistakes:state.mistakes,paused:state.paused};
 state=command(state,c);
 if(['skip','tutorial','menu','new','replay'].includes(c.type)){selectedSeed=state.seed;seedValue.textContent=selectedSeed;const url=new URL(location.href);url.searchParams.set('seed',state.seed);history.replaceState(null,'',url);}
 if(['replay','skip','tutorial','menu','new'].includes(c.type)){saved=false;playerFacing=0;horseFacing=0;lastPlayerMove=lastHorseMove=-10000;}
 audio.setScene(state.menu,state.paused||state.won);
 if(['skip','tutorial','new','replay'].includes(c.type))audio.enable();
 if(!same(before.player,state.player)){playerFacing=state.player.x<before.player.x?2:state.player.x>before.player.x?3:state.player.y<before.player.y?1:0;lastPlayerMove=animationClock;audio.effect('step');}
 else if(state.solved.filter(Boolean).length>before.solved)audio.effect('correct');
 else if(state.mistakes>before.mistakes)audio.effect('wrong');
 else if(state.read.filter(Boolean).length>before.read)audio.effect('read');
 else if(c.type==='pause'&&!state.paused)audio.effect('pause');
 else if(['menu','skip','tutorial','replay','new'].includes(c.type))audio.effect('click');
 refresh();if(!state.menu)requestAnimationFrame(()=>game.scale.refresh());
}
const soundButton=document.querySelector<HTMLButtonElement>('#sound-toggle')!;
soundButton.onclick=async()=>{audio.setScene(state.menu,state.paused||state.won);await audio.toggle();soundButton.textContent=audio.enabled?'♫ 音樂音效：開啟（點擊靜音）':'♫ 開啟音樂與音效';soundButton.setAttribute('aria-pressed',String(audio.enabled));};
window.addEventListener('pagehide',()=>audio.dispose(),{once:true});
function refresh(){soundButton.textContent=audio.enabled?'♫ 音樂音效：開啟（點擊靜音）':'♫ 開啟音樂與音效';soundButton.setAttribute('aria-pressed',String(audio.enabled));document.querySelector<HTMLElement>('#menu')!.hidden=!state.menu;document.querySelector<HTMLElement>('#play')!.hidden=state.menu;document.querySelector('#message')!.textContent=state.won?`${state.tutorial?'教學通關！小貝爾與火馬都抵達出口。':'第 '+state.round+' 關通關！本關 '+(state.elapsed/1000).toFixed(1)+' 秒。'}${state.paused?'已暫停換關倒數。':Math.max(0,Math.ceil((NEXT_ROUND_DELAY-state.winCountdown)/1000))+(state.tutorial?' 秒後進入正式第 1 關。':' 秒後自動進入下一關。')} 可按「離開不玩」結束。`:state.message;document.querySelector('#session-summary')!.textContent=state.menu&&state.cleared?`本次完成 ${state.cleared} 關，累計遊戲 ${(state.totalElapsed/1000).toFixed(1)} 秒。`:'';document.querySelector('#status')!.textContent=`${state.tutorial?'教學模式':state.paused?'已暫停':state.won?'已通關':'第 '+state.round+' 關'}　｜　已完成 ${state.cleared} 關　｜　累計 ${(state.totalElapsed/1000).toFixed(1)} 秒　｜　進度 ${state.solved.filter(Boolean).length}/3　｜　${(state.elapsed/1000).toFixed(1)} 秒　｜　最佳 ${bestResult(state.seed)}`;document.querySelector('[data-c="pause"]')!.textContent=state.paused?'繼續 P':'暫停 P';document.querySelector<HTMLElement>('#skip')!.hidden=!state.tutorial;document.querySelector('#seed-info')!.textContent=`${state.tutorial?'固定教學；正式關種子':'種子'}：${state.seed} ｜ ${state.level.version} ｜ 題庫 ${state.level.bankVersion} ｜ ${state.tutorial?'固定教學':state.level.fallback?'備用地圖（'+state.level.failures.length+' 次生成失敗）':'生成第 '+(state.level.attempt+1)+' 次，驗證通過'}`;const link=document.querySelector<HTMLAnchorElement>('#seed-link')!;link.href='?seed='+encodeURIComponent(state.seed)+'&bank='+encodeURIComponent(state.level.bankVersion);}
for(const b of document.querySelectorAll<HTMLButtonElement>('[data-c]'))b.onclick=()=>{const type=b.dataset.c!;if(type==='new')dispatch({type:'new',seed:freshSeed()});else if(type==='skip'||type==='tutorial')dispatch({type,seed:state.menu?selectedSeed:state.seed});else dispatch({type:type as 'interact'|'help'|'pause'|'replay'|'menu'});};
for(const b of document.querySelectorAll<HTMLButtonElement>('[data-dir]'))b.onclick=()=>{const [dx,dy]=b.dataset.dir!.split(',').map(Number);dispatch({type:'move',dx,dy});};
window.addEventListener('keydown',e=>{if(state.menu)return;if((e.target as HTMLElement)?.tagName==='BUTTON'&&(e.code==='Space'||e.code==='Enter'))return;const c=keyboardCommand(e.code);if(c){e.preventDefault();dispatch(c);}});
const cell=CELL_SIZE,ox=15,oy=18;
class GameScene extends Phaser.Scene{
 lastFrameStamp=performance.now();lastRender='';graphics!:Phaser.GameObjects.Graphics;labels:Phaser.GameObjects.Text[]=[];playerIcon!:Phaser.GameObjects.Image;horseIcon!:Phaser.GameObjects.Image;
 preload(){this.load.spritesheet('bell','./characters/bell-sheet.png',{frameWidth:256,frameHeight:256});this.load.spritesheet('horse','./characters/horse-sheet.png',{frameWidth:256,frameHeight:256});}
 create(){this.graphics=this.add.graphics();this.horseIcon=this.add.image(0,0,'horse',0).setDisplaySize(39,39).setDepth(3);this.playerIcon=this.add.image(0,0,'bell',0).setDisplaySize(39,39).setDepth(4);}
 update(_time:number,_delta:number){
 const stamp=performance.now();const delta=Math.max(0,stamp-this.lastFrameStamp);this.lastFrameStamp=stamp;
 const previousHorse={...state.horse};
 tick(state,delta);
 if(!state.menu&&!state.paused&&!state.won)animationClock+=Math.min(delta,100);
 if(!same(previousHorse,state.horse)){horseFacing=state.horse.x<previousHorse.x?2:state.horse.x>previousHorse.x?3:state.horse.y<previousHorse.y?1:0;lastHorseMove=animationClock;}
 if(state.won&&!saved){if(!state.tutorial)saveResult(state);saved=true;audio.finish();}
 const next=advanceRound(state);if(next!==state){state=next;saved=false;playerFacing=horseFacing=0;lastPlayerMove=lastHorseMove=-10000;selectedSeed=state.seed;seedValue.textContent=selectedSeed;const url=new URL(location.href);url.searchParams.set('seed',state.seed);url.searchParams.set('bank',state.level.bankVersion);history.replaceState(null,'',url);audio.setScene(false,false);}
 const signature=JSON.stringify([state.player,state.horse,state.read,state.solved,state.paused,state.won,state.menu,state.level.seed,state.level.attempt,state.round,state.won?Math.ceil(state.winCountdown/1000):0]);
 if(signature!==this.lastRender){this.renderMap();this.lastRender=signature;}
 this.animateCharacters();refresh();
 }
 animateCharacters(){
 const overlap=same(state.player,state.horse);
 const pose=(icon:Phaser.GameObjects.Image,p:{x:number;y:number},face:number,moved:number,offset:number)=>{
 const walking=animationClock-moved<220;
 const bob=Math.sin(animationClock/(walking?48:380))*(walking?2:0.6);
 icon.setFrame(icon===this.horseIcon?[0,3,1,2][face]:face).setPosition(ox+p.x*cell+offset,oy+p.y*cell+(overlap&&icon===this.horseIcon?24:13)+bob);
 icon.setScale(39/256,(39+(walking?0:Math.sin(animationClock/380)*.7))/256);
 };
 pose(this.playerIcon,state.player,playerFacing,lastPlayerMove,overlap?8:17);
 pose(this.horseIcon,state.horse,horseFacing,lastHorseMove,overlap?28:17);
 }
 renderMap(){const g=this.graphics;g.clear();for(const l of this.labels)l.destroy();this.labels=[];const label=(x:number,y:number,t:string,color='#fff',size=12)=>this.labels.push(this.add.text(ox+x*cell+cell/2,oy+y*cell+cell/2,t,{fontFamily:'sans-serif',fontSize:size,color,align:'center'}).setOrigin(.5).setDepth(5));
 for(let y=0;y<state.level.height;y++)for(let x=0;x<state.level.width;x++){g.fillStyle(isFloor(state.level,{x,y})?0x504446:0x232135);g.fillRoundedRect(ox+x*cell+1,oy+y*cell+1,cell-2,cell-2,5);}
 state.level.stages.forEach((s,i)=>{g.fillStyle(0xf3ac43);g.fillCircle(ox+s.lamp.x*cell+17,oy+s.lamp.y*cell+17,13);label(s.lamp.x,s.lamp.y,`${i+1}`, '#302111',16);s.answers.forEach((p,a)=>{g.lineStyle(2,state.solved[i]?0x75ba9a:state.read[i]?0xffdd7a:0x77827d);g.strokeRoundedRect(ox+p.x*cell+3,oy+p.y*cell+3,28,28,4);label(p.x,p.y,'ABCD'[a]);label(p.x,p.y-.7,state.read[i]?'答案 '+ 'ABCD'[a]:'未讀題',state.read[i]?'#ffe2a1':'#9ca7a1',10);});g.fillStyle(state.solved[i]?0x628f63:0xc05555);g.fillRect(ox+s.gate.x*cell+8,oy+s.gate.y*cell+2,18,30);label(s.gate.x,s.gate.y,state.solved[i]?'✓':'鎖');});
 g.fillStyle(0x71c69b);g.fillRoundedRect(ox+state.level.exit.x*cell+2,oy+state.level.exit.y*cell+2,30,30,4);label(state.level.exit.x,state.level.exit.y-1,'出口','#9ee9ba');
 const overlap=same(state.player,state.horse);this.playerIcon.setPosition(ox+state.player.x*cell+(overlap?10:17),oy+state.player.y*cell+13);this.horseIcon.setPosition(ox+state.horse.x*cell+(overlap?27:17),oy+state.horse.y*cell+(overlap?26:13));
 label(state.player.x,state.player.y-.9,'小貝爾','#e2c7ff',10);label(state.horse.x,state.horse.y+1,'火馬','#ffc38e',10);
 if(state.paused||state.won){const backdrop=this.add.text(440,210,state.paused?'已暫停\n角色與計時皆停止':`${state.tutorial?'教學通關！':'第 '+state.round+' 關完成！'}\n${Math.max(0,Math.ceil((NEXT_ROUND_DELAY-state.winCountdown)/1000))} 秒後${state.tutorial?'進入正式關':'自動下一關'}`,{fontSize:24,color:'#ffdfa3',align:'center',backgroundColor:'#161326',padding:{x:65,y:30}}).setOrigin(.5).setDepth(10);this.labels.push(backdrop);}
 }
}
const game=new Phaser.Game({type:Phaser.AUTO,width:880,height:550,parent:'game',backgroundColor:'#201d30',scene:GameScene,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH}});
refresh();



}
void bootstrap().catch(error=>{document.querySelector('#app')!.textContent=`遊戲啟動失敗：${String(error)}`;});

