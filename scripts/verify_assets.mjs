import sharp from 'sharp';import UPNG from 'upng-js';import {readFile,readdir} from 'node:fs/promises';import assert from 'node:assert/strict';
for(const name of ['bell','horse']){
 const png=await readFile(`public/characters/${name}-animated.png`);const apng=UPNG.decode(png.buffer.slice(png.byteOffset,png.byteOffset+png.byteLength));assert.equal(apng.frames.length,7);assert.equal(apng.width,256);assert.equal(apng.height,256);
 for(let i=0;i<4;i++){const {data,info}=await sharp(`public/characters/${name}-${i}.png`).ensureAlpha().raw().toBuffer({resolveWithObject:true});let clear=0,opaque=0;for(let p=3;p<data.length;p+=4){if(data[p]===0)clear++;if(data[p]>200)opaque++;}assert.ok(clear>info.width*info.height*.25);assert.ok(opaque>1000);}
 console.log(`${name}: APNG 7 frames, all four PNG frames contain transparent and opaque pixels`);
}
for(const file of await readdir('public/audio')){const data=await readFile('public/audio/'+file);assert.equal(data.toString('ascii',0,4),'RIFF');assert.ok(data.length>1000);let peak=0;for(let i=44;i<data.length-1;i+=2)peak=Math.max(peak,Math.abs(data.readInt16LE(i)));assert.ok(peak>1000);console.log(`${file}: PCM WAV valid, peak ${peak}`);}
