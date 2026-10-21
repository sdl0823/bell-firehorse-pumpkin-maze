# 實際測試結果

日期：2026-10-21。

## 執行結果

- `npm test`：9 項通過，0 失敗。
- `npm run build`：TypeScript 型別檢查與 Vite 正式建置通過。
- 主 JS 約 1.49MB，Vite 提醒大於 500KB；不是編譯錯誤。

## 核心驗收

1. 未讀題無法提交答案或穿過鎖門：通過。
2. 錯答不開門、已完成進度保留；正答只開啟該題門：通過（三題皆檢查）。
3. BFS 無法跨鎖門；火馬無路徑時不移動、不傳送：通過。
4. 玩家先到出口不通關，火馬到出口後才通關：通過。
5. 暫停時 tick、移動與互動不改變角色、時間及其他狀態：通過。
6. 連續重玩 20 次仍完整重設，之後一次更新只前進一步：通過。原始碼沒有 setInterval / setTimeout，也不在重玩註冊事件。
7. 完整遊程使用合法 BFS 路徑實際逐格下達移動指令，讀燈、到答案位置、解三題、兩者到出口：通過。
8. 未讀題三條答案通道封鎖，讀題後開放；下一題維持封鎖：通過。
9. 教學正答與跳過教學都重設狀態後進入正式關：通過。

測試透過核心指令執行，不是瀏覽器按鍵錄製。部分邊界測試直接設定角色位置以隔離待測規則；完整遊程測試則沿合法通路行走。

## 預覽檢查

- 開發服務首頁與 TypeScript 入口 HTTP 200。
- 內建瀏覽器成功載入 Phaser 地圖，已檢查角色、南瓜燈、三組答案岔路、鎖門與出口的畫面。
- 實際使用 WASD / E：第一題先走 A 錯答，確認進度 0/3 與提示，再走 B 答對；第二題走 A、第三題走 B，全部開門。
- 玩家先抵達出口時顯示冒險中 3/3；火馬隨後到達才顯示已通關，時間 19.6 秒。
- 保存通關截圖 victory.png。
- 通關後按重玩：回教學模式、0/3、0.0 秒；最佳紀錄保留。
- 再次開始後未讀題向右嘗試進答案格受阻；停在南瓜燈相鄰位置後 E 可讀題。
- 暫停後時間維持 4.1 秒，嘗試移動與互動後仍為 0/3、4.1 秒。再按重玩完整重設。
- 初次服務啟動的 CLI 參數誤把 5173 當根目錄，已修正為 README 的 npm run dev 指令，重新啟動後完成上述驗收。
- 尚未做手機觸控、多解析度或跨瀏覽器測試。預覽服務若已停止，執行 npm run dev 重新啟動。

## 四選一與參考角色更新（本輪最新結果）

本節取代前文三選一題庫及舊角色圖形的驗收描述；victory.png 是前版紀錄，新選單證據為 menu-halloween.png。

- npm test：11 項全部通過，包含新增的選單凍結、選單／教學／正式關切換，以及三題各四個實體答案格的可達性和全部錯答檢查。
- npm run build：通過。仍有 Phaser 主包體積提醒。
- 題庫更新為南瓜燈照明、萬聖節糖果規律及變裝派對謎題；每題四選一。
- 瀏覽器實際操作：由開頭選單進入正式關，讀題後分別走至第一題 C、第二題 A、第三題 D，確認進度依序 1/3、2/3、3/3。
- 地圖四個答案位置以 A/B/C/D 呈現；題目文字列出四個選項，沒有遠端作答按鈕。
- 已目視確認選單與地圖載入提供的小貝爾、火馬圖片。修正初始隱藏遊戲區造成的畫布零尺寸問題。
- 已實際確認回到選單可顯示角色與兩個開始入口，並保存 menu-halloween.png。
- 本輪瀏覽器操作確認三題門障已完成；雙角色出口通關仍由完整走圖自動測試覆蓋，本輪未再等待瀏覽器中的火馬走完全程。
- 原始 JPEG 僅複製到專案，以 CSS / Phaser 顯示其中既有姿勢；保留紫底，未生成新外觀、未去背、未提供四方向行走動畫。

## 透明角色動畫與音訊更新（本輪最新結果）

- npm test：12 項全部通過。新增音訊管理測試確認場景切換重用同一背景音樂、暫停與靜音停止音效、通關旋律不被立即截斷。
- npm run build：通過，仍有既有 Phaser 主包大小提醒。
- node scripts/verify_assets.mjs：兩張 256×256 APNG 各七格；八張姿勢 PNG 均含透明及實體像素；九個 WAV 皆有有效 PCM 波形且無數位滿幅削波。
- 已目視檢查兩張透明圖集及選單：紫色底已去除，小貝爾／火馬姿勢可辨識。素材經 AI 去背整理，不能視為原圖無損像素裁切；極細輪廓仍可再人工精修。
- 瀏覽器點擊音訊按鈕後，menu.wav：readyState=4、paused=false、currentTime>0，無 media error。
- 點開始、移動並讀題後，切換 level.wav：readyState=4、paused=false，無 media error。
- 暫停後 background-music.paused=true，繼續後 false，靜音後 true。
- 遊戲使用透明精靈圖集，依方向切姿勢；動畫時間與遊戲暫停同步凍結。轉身 APNG 不是完整步態動畫，朝上使用斜向參考姿勢。
- 已保存 menu-animated-audio.png。檔案與播放狀態驗證不等於人工聽感驗收；尚未聽測音量、循環接點與裝置聲音品質。

## 種子隨機正式關（本輪最新結果）

本節取代前文固定三題、尚未實作隨機的描述。規則仍為讀燈 → 親自走到答案格 → 答對開門。

### 自動化實測

- npm test：13 項通過；npm run build：成功，仍有 Phaser 主包大小提醒。
- npx tsx scripts/validate_seeds.ts：audit-0 到 audit-999 共 1,000 個種子，同種子資料完全一致，產生 1,000 個不同地形；三題均不重複，正答位置涵蓋 A/B/C/D。
- 每張圖都檢查完整連通、全部八種門障開關組合的可達性、未讀封鎖、四個答案的往返及碰撞矩形沿邊取樣。
- audit-0 到 audit-99 另完整逐格下指令：每題三種錯答均走訪、互動、確認門未開、返回後正答，再由兩位角色抵達出口。每局九次錯答，共 100 局通關。
- 八個具名種子同樣完成每局九次錯答與通關，資料含穩定題目、選項、答案、提示 ID、門座標、地形雜湊與移動步數，見 SEED-VALIDATION.json。

| 種子 | 抽題 ID（依序） | 正答位置 | 門的 Y 座標 | 地形 SHA-256 前12碼 |
| --- | --- | --- | --- | --- |
| pumpkin | door-code / candy-share / pumpkin-shadow | A/A/B | 8/7/8 | 5e88dc4d480d |
| halloween-2026 | costume-riddle / candy-pattern / lantern-light | D/B/D | 5/8/6 | 54a6a6c93632 |
| 0 | lantern-order / lantern-light / pumpkin-shadow | A/D/C | 6/5/5 | f62532f29cd7 |
| 42 | costume-riddle / lantern-light / pumpkin-shadow | A/A/A | 5/6/7 | 56ccea10cd0b |
| 小貝爾與火馬 | party-route / ghost-count / costume-riddle | C/A/C | 7/5/6 | b3374687df57 |
| 🎃 | candy-share / door-code / candy-pattern | D/C/B | 7/6/5 | cc1adedf9489 |
| 000042 | door-code / candy-share / candy-pattern | D/D/C | 6/6/7 | 8cc32f74f541 |
| boundary-4294967295 | mummy-roll / lantern-order / party-route | A/D/C | 7/6/6 | 50b5dfa572a3 |

### 失敗及反例案例

- retry-case：測試注入移除出口格，前兩次被 special-cells-on-floor 拒絕，第三次候選有效；實際呼叫三次，保留兩條失敗診斷。
- fallback-case：測試注入每次都拋例外，實際只呼叫四次，然後改用備用地形 08ffb6d29228；備用圖再驗證通過，並完成九次錯答及全程通關。
- 上述故障由測試注入候選產生器，並非種子名稱會觸發的隱藏模式。直接輸入這些種子不會刻意失敗。
- validation-case：人工加入跨區繞門捷徑被 exit-order/lamp-order 檢查拒絕；無效選項 ID、移除正答地板也分別被拒絕。
- 新版本同種子連續重玩20次仍維持正式關、同圖同選項，全部本局狀態重設。
- 固定教學完成及跳過均進入指定種子正式關；選單凍結計時與移動。

### 瀏覽器實測

- 種子 42：從選單輸入並開始，讀題後看到第一題巫師位於 A；第二題 LED 小燈也位於 A，與舊版固定 C 的位置不同，仍以 lantern-light.led ID 判定答對；第三題靠近燈光位於 A。
- 使用合法路徑鍵盤移動依序解三題，畫面顯示三道門完成；玩家先抵達時仍為冒險中，火馬跟上後才通關。初次實機紀錄為13.2秒。
- 保留種子查詢連結，畫面顯示種子42、pumpkin-v1與生成次數。重現需本版題庫及生成器，不代表未來改版會產生相同內容。

- 最終版本再次於瀏覽器用種子42完整通關，時間11.9秒，截圖 seed-42-victory.png。按「同種子重玩」後仍是正式關、0/3，第一題仍為變裝題、巫師在A，確認沒有重新洗牌。
- 瀏覽器切換種子0後，第一題變為 lantern-order（亮、亮、暗），正答A；畫面與URL皆顯示0，地形與42不同。截圖 seed-0-preview.png。

## 提示顯示修正（本輪最新結果）

- 撞牆、封鎖門障或無效移動只阻擋移動，不改變原有訊息。
- 十道題的三十個錯誤選項都有按穩定選項ID對應的具體錯因，資料在 src/wrongReasons.ts；題庫檢查會拒絕缺漏錯因。
- 題目、答錯、答對及已讀題的協助訊息記錄所屬題目區。區域從燈前一欄至該題門障；離開入口或越過門障後清空訊息，保留已讀／完成進度。回區不自動恢復文字，可到燈旁重新互動。
- npm test：18 項全部通過；npm run build：通過，既有套件大小提醒仍在。
- 瀏覽器種子 b4d3fc71：第一題選「一把糖果」，顯示原因「糖果可以吃，卻不會發出照明所需的光」。在答案支路端點向牆移動，錯因保持原樣；沿合法路線返回入口後，#message 文字為空字串。
- 畫面證據：wrong-answer-reason.png。

## 雲端100題與外部資料（本輪最新結果）

- 本輪JSON題庫總數100，保留原版10題並新增90題；題幹全不重複，400個選項、300條錯因，版本halloween-100-v2@4a0a31fa。
- 1000個抽題種子bank-0到bank-999，每關3題不重複、結果可重現，涵蓋全部100題。
- 完整核心通關案例：100-questions抽candy-double/time-start/party-mask；42抽clue-order/party-decoration/pumpkin-shadow；b4d3fc71抽classify-count/candy-pattern/party-stairs。詳見BANK-VALIDATION.json。
- 瀏覽器重新載入時，實際顯示「題庫100題，每關隨機3題」、來源「資料檔」，並顯示版本及指紋。
- 讀取、抽樣、規則分開。網路失敗、不合法JSON、重複ID、缺漏錯因均不覆蓋目前有效題庫；正常檔案載入可成功。
- 指定Drive資料夾中已建立Google文件「小貝爾與火馬｜萬聖節100題・題目答案與錯因 v2」，顯示儲存完成。匯出讀回含100個001～100題標頭、首末題皆存在（30030字元）；Drive資料夾清單亦確認文件位於指定位置。
- Chrome本機JSON/CSV/Markdown上傳被擴充功能的Allow access to file URLs權限擋住；未自行擴大權限。這三個格式的本機檔案已完成，但不能稱已上傳Drive。Google文件透過網頁直接輸入，已實際寫入雲端。
- Google文件不會自動同步成遊戲題庫；遊戲讀同來源的JSON副本，之後支援選單匯入JSON。
- 最終npm test共23項通過，正式建置成功。
- 瀏覽器種子100-questions實際抽出candy-double、time-start、party-mask，逐題走到答案位置開門，兩角色到出口後11.2秒通關。截圖100-question-game-proof.png。
- 雲端Google文件存檔證據cloud-100-questions.png；雲端讀回文字副本cloud-question-bank/cloud-doc-readback.md。未把本機JSON/CSV上傳成功誤記成雲端已保存。

## 雲端試算表及Excel維護（本輪最新結果）

- 在原指定Drive資料夾建立Google試算表「小貝爾與火馬｜萬聖節100題・維護主表」，ID：1IFCBjHPDCmoRls7V3dO4wv50TpVyX-HKgQn-THIjwVw。
- 「題庫」含101列（標題+100題）、20欄；「使用說明」含13列。主表為純文字格式，避免時間選項及ID被自動改寫；標題凍結、篩選、欄寬、換行與隱藏ID欄皆已在雲端設定。
- 使用受支援的試算表匯出取得.xlsx，scripts/validate_sheet.ts逐題核對100題題幹、提示、正答ID，以及全部400個選項文字和ID，全部一致；記錄SHEET-VALIDATION.json。
- npm test：25項通過，含實際雲端Excel讀取、CSV引號及換行、停用題目、非法正答字母拒絕。正式建置成功。
- 瀏覽器實際選取雲端匯出的.xlsx，顯示100題、halloween-sheet-v3@055fb696、「更新成功，此瀏覽器已記住」。重新整理後顯示「已儲存的匯入題庫」，資料未遺失。
- 遊戲選單提供編輯雲端題庫、下載Excel、選擇Excel更新三步入口；不是即時同步，不需改JSON或擴充功能檔案權限。
- 畫面證據：cloud-question-sheet.png及excel-bank-workflow.png。

## 自動計時及連續換關（本輪最新結果）

- npm test：29項全部通過；正式建置成功。
- 正式關自動開始本關及累計計時；使用performance.now()的實際時間差，避免低幀率下原100ms上限讓時間變慢。
- 兩角色抵達才通關；僅記一次完成，3秒後由純狀態函式advanceRound切換下一關，沒有新增setTimeout或setInterval。
- 通關倒數可暫停，離開選單後無計時及換關；測試涵蓋連續三次自動換種子、下一關完整重設及累計保留。
- 瀏覽器使用3230c4d8、Excel題庫halloween-sheet-v3@055fb696，實際解三題通關後自動進入第2關3230c4d8~round-2，畫面顯示已完成1關、進度0/3、重新計時，URL同步更新。截圖continuous-round-2.png。
- 實際按「離開不玩」回選單，顯示本次完成1關、累計43.0秒；此後不再自動換關。

## 玩家選單與設計師維護分離（本輪最新結果）

- 玩家DOM檢查：fileInputs=0、textInputs=0、cloudLinks=0。隨機種子按鈕選出df751239，按開始後URL與關卡種子一致，自動計時正常。
- 開頭移除題庫說明、編輯連結、下載、匯入及手動種子輸入；設計師維護另建designer.html，保留Excel匯入功能。
- 瀏覽器確認本機designer.html可用，玩家頁沒有前往它的連結。
- npm test：29項通過；npm run build：成功；Test-Path dist/designer.html為False，維護頁不加入預設正式建置。
- 畫面證據：player-menu-only.png。
