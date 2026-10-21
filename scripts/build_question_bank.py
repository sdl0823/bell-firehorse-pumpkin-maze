import json,csv,hashlib
from pathlib import Path
root=Path('cloud-question-bank');legacy=json.loads(Path('src/tutorial-bank.json').read_text(encoding='utf-8-sig'))
items=legacy['questions'];seen=set(q['id'] for q in items)
for line in (root/'questions-source.tsv').read_text(encoding='utf-8-sig').splitlines():
    parts=line.split('|');assert len(parts)==7,(len(parts),line)
    ident,cat,prompt,raw,answer,hint,explanation=parts;opts=raw.split('~');answer=int(answer);assert len(opts)==4 and 0<=answer<4
    assert ident not in seen;seen.add(ident)
    options=[{'id':f'{ident}.choice-{i+1}','text':text,**({'wrongReason':f'「{text}」不符合題目。{explanation}'} if i!=answer else {})} for i,text in enumerate(opts)]
    items.append({'id':ident,'category':cat,'prompt':prompt,'options':options,'answer':{'id':ident+'.answer','optionId':options[answer]['id']},'hint':{'id':ident+'.hint','text':hint}})
assert len(items)==100,len(items)
for q in items:q.setdefault('category','原版萬聖節精選')
assert len({q['prompt'] for q in items})==100
payload={'schemaVersion':1,'version':'halloween-100-v2','title':'小貝爾與火馬・萬聖節100題','language':'zh-Hant','roundSize':3,'cloudFolder':'https://drive.google.com/drive/folders/1gUnfHjZBOB9brin5vQ3MTg3ZBqzSSukA','questions':items}
payload['contentSha256']=hashlib.sha256(json.dumps(items,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
encoded=json.dumps(payload,ensure_ascii=False,indent=2)
for path in [root/'halloween-100-v2.json',Path('public/data/halloween-100-v2.json')]:path.write_text(encoded,encoding='utf-8')
with (root/'halloween-100-v2.csv').open('w',encoding='utf-8-sig',newline='') as f:
    writer=csv.writer(f);writer.writerow(['題目ID','分類','題目','A','B','C','D','標準答案ID','正答選項ID','正答位置（匯出順序）','提示ID','提示','A錯因','B錯因','C錯因','D錯因'])
    for q in items:writer.writerow([q['id'],q['category'],q['prompt'],*[o['text'] for o in q['options']],q['answer']['id'],q['answer']['optionId'],'ABCD'[[o['id'] for o in q['options']].index(q['answer']['optionId'])],q['hint']['id'],q['hint']['text'],*[o.get('wrongReason','（正答）') for o in q['options']]])
lines=['# 小貝爾與火馬：萬聖節100題','',f'版本：{payload["version"]}。每關隨機抽三題，不重複；遊戲另洗牌四個選項，因此下列字母只表示匯出順序。','', 'JSON 是程式讀取主檔；CSV 方便表格檢閱。本文件包含答案與錯因，適合出題者檢閱。','','更新方法：修改 JSON 保留穩定 ID，變更 version，下載後在遊戲選單按「更新題庫 JSON」。私人 Drive 需要登入，遊戲不會偷偷變更分享權限或要求玩家金鑰。','']
for n,q in enumerate(items,1):
    lines += [f'## {n:03d}｜{q["category"]}｜{q["id"]}', '',q['prompt'],'']
    for letter,o in zip('ABCD',q['options']):lines.append(f'- {letter}：{o["text"]}'+('（正答）' if o['id']==q['answer']['optionId'] else ''))
    lines += ['',f'提示：{q["hint"]["text"]}','']
    for o in q['options']:
        if 'wrongReason' in o:lines.append(f'- {o["id"]}：{o["wrongReason"]}')
    lines.append('')
(root/'萬聖節100題-題庫與更新說明.md').write_text('\n'.join(lines),encoding='utf-8')
print('100 unique questions; 400 options; 300 wrong-answer reasons; JSON/CSV/Markdown exported.')
