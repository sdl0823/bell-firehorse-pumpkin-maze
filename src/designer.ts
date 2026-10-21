import './style.css';
import {getBankInfo,installQuestionBank} from './questions';
import {readBankFile} from './tableBank';
const storageKey='pumpkin-imported-bank-v2-300';
try{const saved=localStorage.getItem(storageKey);if(saved)installQuestionBank(JSON.parse(saved),'設計師已儲存題庫');}catch{}
document.querySelector('#app')!.innerHTML=`<main><header><p class="eyebrow">僅供設計師維護 · 本機開發頁</p><h1>題庫編輯工作區</h1><p>此頁與玩家選單分開，不會加入正式遊戲建置。</p></header><section class="bank-workflow"><a href="https://docs.google.com/spreadsheets/d/1IFCBjHPDCmoRls7V3dO4wv50TpVyX-HKgQn-THIjwVw/edit#gid=0" target="_blank" rel="noopener">① 編輯雲端題庫</a><a href="https://docs.google.com/spreadsheets/d/1IFCBjHPDCmoRls7V3dO4wv50TpVyX-HKgQn-THIjwVw/export?format=xlsx" target="_blank" rel="noopener">② 下載 Excel</a><label class="bank-import">③ 匯入題庫<input id="designer-import" type="file" accept=".xlsx,.csv,.json"></label></section><p id="designer-status" role="status"></p><p>匯入成功後，在同一瀏覽器重新整理玩家頁，即會使用新題庫。此操作不會自動修改伺服器上的正式題庫檔案。</p><a href="/">開啟玩家遊戲</a></main>`;
const status=document.querySelector<HTMLElement>('#designer-status')!;
function show(note=''){const info=getBankInfo();status.textContent=`${info.count} 題 ｜ ${info.key}${note?' ｜ '+note:''}`;}
show();document.querySelector<HTMLInputElement>('#designer-import')!.onchange=async event=>{const input=event.target as HTMLInputElement,file=input.files?.[0];if(!file)return;try{if(file.size>5000000)throw new Error('檔案不得超過5MB');const raw=await readBankFile(file);installQuestionBank(raw,'設計師匯入');localStorage.setItem(storageKey,JSON.stringify(raw));show('匯入並儲存成功');}catch(error){show(String(error));}finally{input.value='';}};
