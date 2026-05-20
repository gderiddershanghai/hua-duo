# 花朵 Baby Tracker

## Project
Web app tracking baby 花朵's daily care. Data entered by uploading photos of yuesao (月嫂) handwritten logs or natural language text, parsed via OpenAI API.

## Baby
- Name: 花朵 | DOB: May 12, 2026 | Sex: Girl
- Birth: 4.25 kg, 51 cm (~P93 weight, ~P85 length for girls)

## Parents
- 爸爸: start 90.0 kg, goal 85.0 kg (daily weigh-ins)
- 妈妈: start 70.0 kg, goal 57.0 kg (daily weigh-ins)

## Stack
- **Frontend**: vanilla HTML/CSS/JS, ES modules, no framework. 4 color themes (linen/sky/sage/night)
- **Backend** (planned): Node.js + Express + SQLite
- **LLM**: OpenAI API (Vision for image OCR, chat for natural language)
- **Deployment**: Coolify on China-based VPS (GitHub Pages blocked)

## How to run
ES modules require a server (won't work with `file://`). From the project root:
```bash
python3 -m http.server 3000
```
Then open http://localhost:3000

## File structure
```
index.html            Shell: header, 5 tabs (Stats/Pattern/Log/Growth/Parents), FAB
styles.css            All CSS + 4 theme variable blocks + segment classes
.env                  OPENAI_API_KEY, ADMIN_PASSWORD, PORT
js/
  app.js              Entry: theme toggle, tab switching, imports all renderers
  data.js             Mock data: BABY, WEEKLY, PATTERN, WEIGHT, LOG, PARENT_WEIGHT
  svg.js              SVG helpers: el(), mkSvg(), barChart()
  predict.js          OLS linear regression (min 3 points, returns slope/intercept/predict/r2)
  stats.js            Stats tab: weekly averages + 2×2 daily bar charts
  pattern.js          Pattern tab: 7-day segmented activity timeline (sleep/feed/skin/markers)
  log.js              Log tab: chronological event list
  growth.js           Growth tab: baby weight chart (WHO percentiles) + prediction dashed line
  parent.js           Parents tab: dad & mom weight charts + predictions + goals + progress bars
  upload-router.js    Routes uploads: image → /api/parse/image, text → /api/parse/text
prompts/
  ocr-parse.txt       System prompt for OpenAI Vision (yuesao photo → JSON)
  nl-parse.txt        System prompt for OpenAI chat (text → JSON)
sample_images/        Yuesao handwritten log photos (3 images)
```

## CSS theme variables (all 4 themes have these)
--bg, --surf, --surf2, --acc, --acc-soft, --text, --mut, --bdr,
--feed-bg, --feed-fg, --slp-bg, --slp-fg, --diaper-bg, --diaper-fg,
--note-bg, --note-fg, --skin-bg, --skin-fg

## SVG CSS classes
- `.s-block` sleep segment | `.f-block` feed segment | `.sk-block` skin-to-skin segment
- `.tl-bg` timeline background bar | `.f-dot` feed dot (legacy)
- `.pred` prediction dashed line | `.goal-ln` goal dashed line
- `.cl` chart line | `.cd` chart dot | `.cdl` chart dot (last, with stroke)
- `.clbl` chart label | `.cg`/`.cgd` chart grid | `.ct` chart text | `.cp` percentile line
- `.bar-accent`/`.bar-partial` bar chart fills

## Data model
### Events (per occurrence, timestamped)
- Feed: always both breasts, duration (min), optional formula supplement (ml)
- Sleep: start/end → derived wake windows
- Poop / pee: checkmark
- Skin-to-skin: duration (min)
- Tummy time: duration (min)
- Bath: once/day
- Notes: free text (natural language poop description morning + evening)

### PATTERN data format (js/data.js)
```js
{
  label: 'May 14',
  sleeps:  [[startH, endH], ...],              // hours, 0-24
  feeds:   [{h, dur, formula: ml|null}, ...],  // h=hour, dur=hours
  skin:    [{h, dur}, ...],                    // skin-to-skin
  markers: [{h, emoji}, ...],                  // 🛁 bath, 💪 tummy time
  partial: true,                               // optional, for incomplete days
}
```

### Weight
- Baby: kg (1 decimal), sporadic length (cm)
- Dad & Mom: kg (1 decimal), daily

## Pattern chart design
Continuous 24h segmented bar per day (7 days), clip-path for rounded edges:
- **Sleep**: blue segment (.s-block, --slp-bg)
- **Feed**: warm segment (.f-block, --feed-bg). 🍼 emoji INSIDE bar when formula
- **Skin-to-skin**: pink segment (.sk-block, --skin-bg)
- **Tummy time**: 💪 emoji inside bar, no color segment
- **Bath**: 🛁 emoji inside bar, no color segment
- **Awake**: transparent (background shows through)
- All emojis contained within bar bounds, not floating above

## Predictions
Linear regression (OLS) in js/predict.js. Projects 3-5 days forward as dashed line on charts. Min 3 points required. Used by growth.js (baby weight) and parent.js (parent weight).

## Upload flow
1. User uploads photo OR types natural language text
2. upload-router.js classifies input → sends to appropriate server endpoint
3. Server sends to OpenAI API with system prompt from prompts/
4. OpenAI returns structured JSON (events for the day)
5. Confirm screen: user reviews, edits, approves
6. Saved to SQLite database

## Yuesao log format (from sample images)
Columns: 时间 | 母乳 | 奶粉 | 大便 | 小便 | 其他
- 母乳: "左右" (both sides) or ✓ = breastfed; sometimes "每次10分钟" for duration
- 奶粉: "30ml" = formula supplement
- 大便/小便: ✓ = occurred
- Date headers: "5月16日"
- Multiple days may appear on one page

## Navigation (planned)
- Arrow buttons (< >) to move by day or week
- Day/week toggle
- Swipe on mobile

## Key decisions
- No manual data entry — all data from photo/NL upload only
- Weekly stats preferred over daily (data uploaded in batches)
- Baby always feeds both breasts → single feed event
- Sleep inferred from gaps between events
- Coolify for deployment (China-friendly)

## Status
- [x] 5-tab dashboard with theme switching (linen/sky/sage/night)
- [x] Weekly stats + daily trend bar charts (2×2 grid)
- [x] 7-day segmented pattern chart (sleep/feed/skin segments + emoji markers)
- [x] Baby weight chart with WHO P75/P90/P97 + prediction dashed line
- [x] Parent weight charts with predictions + goal lines + progress bars
- [x] Linear regression prediction utility (predict.js)
- [x] .env + .gitignore
- [x] Parsing prompts (OCR + NL)
- [x] Upload router (frontend, routes to /api/parse/image or /api/parse/text)
- [x] Log tab (chronological event list)
- [ ] **NEEDS VISUAL CHECK**: preview the app in browser, verify all tabs render correctly
- [ ] Backend (Node.js + Express + SQLite)
- [ ] OpenAI API integration (connect upload-router to real endpoints)
- [ ] Confirm screen (review parsed data before saving)
- [ ] Day/week navigation + swipe
- [ ] Coolify deployment
