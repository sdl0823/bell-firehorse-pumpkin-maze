import json,csv
from pathlib import Path
bank=json.loads(Path('public/data/halloween-300-v1.json').read_text(encoding='utf-8'))
headers=['啟用','題目ID（勿改）','分類','題目','選項A','選項B','選項C','選項D','正確答案','提示','A錯因','B錯因','C錯因','D錯因','A_ID（勿改）','B_ID（勿改）','C_ID（勿改）','D_ID（勿改）','標準答案ID（勿改）','提示ID（勿改）']
rows=[headers]
for q in bank['questions']:
    opts=q['options'];correct=[o['id'] for o in opts].index(q['answer']['optionId'])
    rows.append(['是',q['id'],q.get('category',''),q['prompt'],*[o['text'] for o in opts],'ABCD'[correct],q['hint']['text'],*[o.get('wrongReason','') for o in opts],*[o['id'] for o in opts],q['answer']['id'],q['hint']['id']])
Path('cloud-question-bank/maintenance-300.tsv').write_text('\n'.join('\t'.join(str(c).replace('\n',' ').replace('\t',' ') for c in row) for row in rows),encoding='utf-8')
with Path('cloud-question-bank/萬聖節300題-維護表.csv').open('w',encoding='utf-8-sig',newline='') as f:csv.writer(f).writerows(rows)
print(len(rows)-1,'questions,',len(headers),'columns')
