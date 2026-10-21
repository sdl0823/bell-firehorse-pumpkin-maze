import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GameAudio} from '../src/audio';
class FakeAudio {
 static all:FakeAudio[]=[];src='';id='';hidden=false;loop=false;volume=1;paused=true;onended:null|(()=>void)=null;onerror:null|(()=>void)=null;
 constructor(src=''){this.src=src;FakeAudio.all.push(this);}
 load(){} async play(){this.paused=false;} pause(){this.paused=true;}
}
test('音樂切換不疊播；暫停、靜音清除音效；通關音效可播放',async()=>{
 const globals=globalThis as unknown as {Audio:unknown;document:unknown};globals.Audio=FakeAudio;globals.document={body:{append(){}}};
 const audio=new GameAudio();const music=FakeAudio.all[0];audio.setScene(true,false);audio.enable();audio.enable();assert.equal(audio.enabled,true);assert.equal(music.src,'./audio/menu.wav');assert.equal(music.paused,false);
 for(let i=0;i<20;i++)audio.setScene(false,false);assert.equal(FakeAudio.all.length,1);assert.equal(music.src,'./audio/level.wav');
 audio.effect('read');assert.equal(FakeAudio.all[1].paused,false);audio.setScene(false,true);assert.equal(music.paused,true);assert.equal(FakeAudio.all[1].paused,true);
 audio.setScene(false,false);assert.equal(music.paused,false);audio.finish();assert.equal(music.paused,true);assert.equal(FakeAudio.all.at(-1)?.src,'./audio/win.wav');assert.equal(FakeAudio.all.at(-1)?.paused,false);
 await audio.toggle();assert.ok(FakeAudio.all.every(a=>a.paused));audio.setScene(false,false);audio.enable();assert.equal(audio.enabled,true);assert.equal(music.paused,false);audio.effect('click');assert.equal(FakeAudio.all.at(-1)?.paused,false);audio.dispose();
});
