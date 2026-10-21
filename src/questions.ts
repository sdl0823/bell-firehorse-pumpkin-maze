import bundled from '../public/data/halloween-100-v2.json';
import legacy from './tutorial-bank.json';
export interface Option {id:string;text:string;wrongReason?:string}
export interface Question {id:string;category?:string;prompt:string;options:Option[];answer:{id:string;optionId:string};hint:{id:string;text:string}}
export interface QuestionBank {schemaVersion:1;version:string;title:string;questions:Question[]}
export const tutorialQuestions=legacy.questions as Question[];
export let questions:Question[]=bundled.questions;
let info={version:bundled.version,title:bundled.title,source:'內建備用',key:''};
export function validateQuestionBank(items:Question[]=questions){const ids=new Set<string>();if(items.length<3||items.length>10000)throw new Error('題庫必須包含3至10000題');for(const q of items){if(!q||typeof q.id!=='string'||typeof q.prompt!=='string'||!q.prompt.trim()||!q.answer||!q.hint||!q.hint.text?.trim()||!Array.isArray(q.options)||q.options.length!==4)throw new Error('題目結構不完整');for(const id of [q.id,q.answer.id,q.hint.id,...q.options.map(o=>o.id)]){if(typeof id!=='string'||!id.trim()||ids.has(id))throw new Error(`ID遺失或重複：${id}`);ids.add(id);}if(!q.options.some(o=>o.id===q.answer.optionId)||new Set(q.options.map(o=>o.text)).size!==4)throw new Error(`答案或選項無效：${q.id}`);for(const o of q.options){if(typeof o.text!=='string'||!o.text.trim())throw new Error(`選項文字遺失：${o.id}`);if(o.id!==q.answer.optionId&&(typeof o.wrongReason!=='string'||!o.wrongReason.trim()))throw new Error(`錯因遺失：${o.id}`);}}}
function bankKey(bank:QuestionBank){let h=2166136261;const text=JSON.stringify(bank.questions);for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return `${bank.version}@${(h>>>0).toString(16).padStart(8,'0')}`;}
export function installQuestionBank(raw:unknown,source:string){const bank=raw as QuestionBank;if(!bank||bank.schemaVersion!==1||typeof bank.version!=='string'||!bank.version.trim()||typeof bank.title!=='string'||!Array.isArray(bank.questions))throw new Error('不支援的題庫格式，請使用schemaVersion 1的JSON');validateQuestionBank(bank.questions);const nextKey=bankKey(bank);questions=bank.questions;info={version:bank.version,title:bank.title,source,key:nextKey};return getBankInfo();}
export function getBankInfo(){return {...info,count:questions.length};}
export function getQuestion(id:string):Question{const q=questions.find(q=>q.id===id)??tutorialQuestions.find(q=>q.id===id);if(!q)throw new Error(`Unknown question ID: ${id}`);return q;}
installQuestionBank(bundled,'內建備用');
