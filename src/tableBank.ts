import type {Question,QuestionBank} from './questions';
/** Quoted CSV parser: commas/newlines inside quotes and doubled quotes are retained. */
export function parseCsv(text:string):string[][]{const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;for(let i=0;i<text.length;i++){const ch=text[i];if(ch==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(ch===','&&!quoted){row.push(cell);cell='';}else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';}else cell+=ch;}if(quoted)throw new Error('CSV引號沒有正確結束');if(cell||row.length){row.push(cell);rows.push(row);}return rows;}
export function tableToBank(rows:readonly (readonly unknown[])[]):QuestionBank{
 const clean=(value:unknown)=>value==null?'':String(value).replace(/^\uFEFF/,'').trim();
 const head=rows[0]?.map(clean)??[];
 const need=['啟用','題目ID（勿改）','分類','題目','選項A','選項B','選項C','選項D','正確答案','提示','A錯因','B錯因','C錯因','D錯因','A_ID（勿改）','B_ID（勿改）','C_ID（勿改）','D_ID（勿改）','標準答案ID（勿改）','提示ID（勿改）'];
 const indexes=need.map(name=>{const i=head.indexOf(name);if(i<0)throw new Error(`請使用「題庫」工作表下載的檔案，缺少欄位：${name}`);return i;});
 const items:Question[]=[];
 for(let r=1;r<rows.length;r++){const row=rows[r];if(row.every(v=>!clean(v)))continue;const col=(i:number)=>clean(row[indexes[i]]);if(['否','false','0','停用'].includes(col(0).toLowerCase()))continue;const correct='ABCD'.indexOf(col(8).toUpperCase());if(correct<0||col(8).length!==1)throw new Error(`第${r+1}列的正確答案請填A、B、C或D`);const id=col(1);if(!id)throw new Error(`第${r+1}列缺少題目ID；新增題目請填不重複的英文ID`);const options=[0,1,2,3].map(i=>({id:col(14+i)||`${id}.choice-${i+1}`,text:col(4+i),...(i!==correct?{wrongReason:col(10+i)}:{})}));items.push({id,category:col(2),prompt:col(3),options,answer:{id:col(18)||`${id}.answer`,optionId:options[correct].id},hint:{id:col(19)||`${id}.hint`,text:col(9)}});}
 return {schemaVersion:1,version:'halloween-sheet-v3',title:'雲端試算表題庫',questions:items};
}
export async function readBankFile(file:File):Promise<unknown>{if(file.name.toLowerCase().endsWith('.xlsx')){const {readSheet}=await import('read-excel-file/browser');return tableToBank(await readSheet(file,'題庫'));}const text=await file.text();return file.name.toLowerCase().endsWith('.csv')?tableToBank(parseCsv(text)):JSON.parse(text);}

