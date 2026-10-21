export type SoundName='click'|'step'|'read'|'wrong'|'correct'|'win'|'pause';
/** One reusable music element; a bounded, disposable effect pool. */
export class GameAudio {
 private music=new Audio();
 private effects=new Set<HTMLAudioElement>();
 private track='';
 enabled=false;
 private paused=false;
 constructor(){this.music.id='background-music';this.music.hidden=true;document.body.append(this.music);this.music.loop=true;this.music.volume=.22;}
 enable(){this.enabled=true;if(!this.paused)void this.playMusic();}
 async toggle(){this.enabled=!this.enabled;if(!this.enabled){this.music.pause();this.stopEffects();}else if(!this.paused)await this.playMusic();return this.enabled;}
 setScene(menu:boolean,paused:boolean){const next=menu?'menu':'level';if(next!==this.track){this.track=next;this.music.src=`./audio/${next}.wav`;this.music.load();}this.paused=paused;if(!this.enabled||paused){this.music.pause();this.stopEffects();}else if(this.music.paused)void this.playMusic();}
 effect(name:SoundName){if(!this.enabled||this.paused)return;if(this.effects.size>=6)return;const sound=new Audio(`./audio/${name}.wav`);sound.volume=name==='step'?.09:.32;this.effects.add(sound);const clean=()=>{this.effects.delete(sound);};sound.onended=clean;sound.onerror=clean;void sound.play().catch(clean);}
 private async playMusic(){try{await this.music.play();}catch{/* Autoplay restrictions: the sound button retries on the next gesture. */}}
 private stopEffects(){for(const effect of this.effects){effect.pause();effect.src='';}this.effects.clear();}
 finish(){this.music.pause();this.paused=false;this.effect("win");}
 dispose(){this.music.pause();this.music.src='';this.stopEffects();}
}


