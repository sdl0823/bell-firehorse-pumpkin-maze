import sharp from 'sharp';
import UPNG from 'upng-js';
import {writeFile} from 'node:fs/promises';
const source='public/characters/cutout-atlas.png';
const meta=await sharp(source).metadata();
const out='public/characters/';
const size=256;
for(const [row,name] of ['bell','horse'].entries()){
 const frames=[];
 for(let col=0;col<4;col++){
  const left=Math.floor(col*meta.width/4),top=row===0?0:Math.floor(meta.height*.48);
  const width=Math.floor((col+1)*meta.width/4)-left,height=(row===0?Math.floor(meta.height*.48):meta.height)-top;
  const {data}=await sharp(source).extract({left,top,width,height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  // Remove isolated generation speckles; keep the largest connected opaque character.
  const seen=new Uint8Array(width*height);let largest=[];
  for(let k=0;k<seen.length;k++)if(!seen[k]&&data[k*4+3]>=100){const group=[k];seen[k]=1;for(let j=0;j<group.length;j++){const p=group[j],x=p%width,y=Math.floor(p/width);for(const n of [x>0?p-1:-1,x<width-1?p+1:-1,y>0?p-width:-1,y<height-1?p+width:-1])if(n>=0&&!seen[n]&&data[n*4+3]>=100){seen[n]=1;group.push(n);}}if(group.length>largest.length)largest=group;}
  const keep=new Uint8Array(width*height);for(const p of largest)keep[p]=1;
  let minx=width,miny=height,maxx=0,maxy=0;
  for(let p=0;p<keep.length;p++){if(!keep[p])data[p*4+3]=0;else{const x=p%width,y=Math.floor(p/width);minx=Math.min(minx,x);miny=Math.min(miny,y);maxx=Math.max(maxx,x);maxy=Math.max(maxy,y);}}
  const sprite=await sharp(data,{raw:{width,height,channels:4}}).extract({left:minx,top:miny,width:maxx-minx+1,height:maxy-miny+1}).resize(218,228,{fit:'inside'}).png().toBuffer();
  const info=await sharp(sprite).metadata();
  const frame=await sharp({create:{width:size,height:size,channels:4,background:'#00000000'}}).composite([{input:sprite,left:Math.floor((size-info.width)/2),top:240-info.height}]).png().toBuffer();
  await writeFile(`${out}${name}-${col}.png`,frame);frames.push(frame);
 }
 await sharp({create:{width:size*4,height:size,channels:4,background:'#00000000'}}).composite(frames.map((input,i)=>({input,left:i*size,top:0}))).png().toFile(`${out}${name}-sheet.png`);
 const sequence=[0,1,3,1,0,2,0];const pixels=[];
 for(const i of sequence){const raw=await sharp(frames[i]).ensureAlpha().raw().toBuffer();pixels.push(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));}
 await writeFile(`${out}${name}-animated.png`,Buffer.from(UPNG.encode(pixels,size,size,0,sequence.map(()=>550))));
 console.log(`${name}: four transparent frames, 1024x256 sheet, seven-frame looping APNG`);
}

