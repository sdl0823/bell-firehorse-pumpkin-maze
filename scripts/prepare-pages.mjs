import {cpSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
rmSync('docs/assets',{recursive:true,force:true});
mkdirSync('docs',{recursive:true});
cpSync('dist','docs',{recursive:true});
writeFileSync('docs/.nojekyll','');
