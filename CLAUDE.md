# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Traditional Chinese Medicine (TCM) Dietary Recommendation Web Application** that combines ancient Chinese wellness wisdom with modern AI technology. The application uses ZhipuAI GLM models (specifically GLM-4.7 based on performance testing) to generate personalized dietary recommendations based on 24 Solar Terms, TCM Ganzhi calendar, weather conditions, meal periods, and diet types.

**Latest Update (2026-01-13)**: Added 8 new health goal options + reorganized display layout (综合建议前置) + improved solar term detection logic + added tea recommendation XHS sharing.

## Quick Start

### Starting the Application

**Recommended Method** (with API Key support):
```bash
cd C:\D\CAIE_tool\MyAIProduct\food
python server_with_env.py
```

The server (`server_with_env.py`) automatically:
- Reads `ZHIPU_API_KEY` from `.env` file or system environment variable
- Serves on port 8004
- Provides `/api/env-api-key` endpoint for frontend
- Auto-opens browser on startup

**Simple Method** (without API key support):
```bash
cd C:\D\CAIE_tool\MyAIProduct\food
python -m http.server 8000
```

Application runs at:
- Recommended: `http://localhost:8004`
- Simple: `http://localhost:8000`

### API Key Configuration

**⚠️ CRITICAL**: NEVER hardcode API keys in source code!

**Configuration Methods** (in order of priority):

1. **`.env` file** (recommended for development):
   ```
   ZHIPU_API_KEY=your-api-key-here
   ```
   Location: Project root directory
   Auto-loaded by `server_with_env.py`

2. **System environment variable**:
   ```cmd
   # Windows CMD
   set ZHIPU_API_KEY=your-api-key-here

   # Windows PowerShell
   $env:ZHIPU_API_KEY="your-api-key-here"

   # Linux/Mac
   export ZHIPU_API_KEY="your-api-key-here"
   ```

3. **Browser localStorage** (fallback only):
   - Frontend will show modal if no env key found
   - Not recommended for production

**API Key Flow**:
```
.env file → os.environ → /api/env-api-key → app.js → ZhipuAI API
```

**Testing API Key**: Visit `http://localhost:8004/test_api_key.html`

## Architecture

### Core Technology Stack

**Pure HTML/CSS/JavaScript** (no build tools, no frameworks, no npm):
- **index.html** - Main UI with glassmorphism design
- **style.css** (~2200 lines) - Comprehensive theming with glassmorphism effects
- **app.js** (~2100 lines) - All business logic
- **i18n.js** (~400 lines) - Complete internationalization system

**Key Libraries** (loaded via CDN):
- **Chart.js 4.4.0** - Interactive nutrition pie chart
- **lunar-javascript** - Chinese lunar calendar and solar term calculations

**AI Integration**:
- **Direct fetch API calls** to ZhipuAI - NO Anthropic SDK used in frontend
- Native JavaScript `fetch()` with **Anthropic-compatible API format**
- **API Key sourced from environment variable** via `/api/env-api-key` endpoint
- Model prioritization: GLM-4.7 → GLM-4.6 → GLM-4-flash (fallback chain)
- **NO hardcoded API keys in source code** - all keys from runtime environment

### Internationalization System (i18n.js)

The app has a complete i18n system supporting Chinese (zh) and English (en):

**Architecture**:
- Centralized translation object with `currentLang` property
- `translations` object containing all UI text in both languages
- `updateUI()` method that updates all translatable elements
- Icons are separate from text (HTML structure: `<span class="icon">🎨</span><span data-i18n="key">Text</span>`)

**Translation Keys Structure**:
```javascript
translations: {
    zh: {
        'page.title': '页面标题',
        'section.environment': '天时地利',
        'label.date': '公历',
        'button.generate': '饮食推荐',
        // ... 100+ translation keys
    },
    en: {
        'page.title': 'Page Title',
        'section.environment': 'Heavenly Timing & Earthly Advantage',
        // ... corresponding English translations
    }
}
```

**Dynamic Content Translation**:
- AI-generated recommendations are cached and can be translated on-the-fly
- Uses `translateRecommendation()` method with GLM-4-flash
- Translated content maintains JSON structure (dishes, reasoning, tips, etc.)

**Usage in Code**:
```javascript
// Get translation
const text = i18n.t('key.name');

// Switch language
i18n.setLanguage('en'); // or 'zh'

// Update all UI elements
i18n.updateUI();
```

### Frontend Architecture (app.js)

The codebase is organized into three main classes:

#### 1. **ChineseCalendar Class** (lines 0-296)
Centralized calculation engine for all calendar functions:
- Solar to lunar conversion using simplified algorithm
- Dynamic solar term detection with ±2 day range
- Ganzhi (天干地支) calculation for year, month, day, and hour
- 24 solar terms database with specific day ranges
- Season detection (spring: Mar 21 - May 20, etc.)
- **Note**: Lunar calendar display only (Ganzhi removed per user request)

#### 2. **LogManager Class** (lines 298-410)
Browser localStorage-based logging system:
- Records all API calls with metadata, prompts, responses, timing
- Stores up to 100 log entries (auto-cycles)
- Export functionality to JSON file
- Console methods: `getLogs()`, `exportLogs()`, `clearLogs()`

#### 3. **FoodRecommendationApp Class** (lines 412+)
Main application controller with core logic:
- UI initialization and event handling
- GLM API integration with multi-model fallback
- Recommendation parsing and display
- Background image/gradient system
- Real-time UI updates for all inputs
- **Cached recommendations**: Stores last recommendation for quick language switching
- **Prompt caching**: Caches prompt templates to avoid repeated fetch calls

### Critical Backend Components

#### Model Selection Strategy (Updated 2026-01-06)

**Performance-based prioritization** (based on speed testing):
```javascript
const models = ['glm-4.7', 'glm-4.6', 'glm-4-flash'];
// GLM-4.7 is 39% faster overall while maintaining high quality
```

**Testing Results** (see `MODEL_PERFORMANCE_TEST.md`):
- Simple tasks (30 chars): GLM-4.7 faster by 18%
- Medium tasks (58 chars): GLM-4.7 faster by 133% (2.3x)
- Complex tasks (125 chars): GLM-4.7 faster by 16%
- **Overall**: GLM-4.7 is 39% faster than GLM-4-flash

#### API Endpoint
```
URL: https://open.bigmodel.cn/api/anthropic/v1/messages
Method: POST
Headers: {
  'Content-Type': 'application/json',
  'x-api-key': <API_KEY_FROM_ENV>
}
Format: Anthropic-compatible API
Body: {
  model: "glm-4.7",
  messages: [{"role": "user", "content": "..."}],
  max_tokens: 4096,
  temperature: 0.7
}
```

**Critical Implementation Details** (app.js lines 1458-1539):
```javascript
// 1. Get API Key from environment
const apiKey = await this.getApiKey(); // Fetch from /api/env-api-key

// 2. Call ZhipuAI with Anthropic-compatible format
const response = await fetch('https://open.bigmodel.cn/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey  // From environment, NOT hardcoded
    },
    body: JSON.stringify({
        model: model,  // glm-4.7, glm-4.6, or glm-4-flash
        messages: [{role: 'user', content: prompt}],
        max_tokens: 4096,
        temperature: 0.7
    })
});

// 3. Parse Anthropic-format response
const content = data.content[0].text;
```

### Prompt System

**External prompt templates** with placeholder substitution:

1. **`prompts/food_recommendation_prompt.txt`** (42 lines)
   - Main diet recommendations
   - Optimized for GLM-4.6/4.7 stability
   - Requires strict JSON output format
   - Key fields: `dishes[]`, `reasoning`, `tips`, `totalNutrition`
   - **Critical**: `amount` field must be pure number (no "g" or units)
   - **Type field classification**: 明确定义4种类型(荤菜/素菜/汤品/主食)并给出示例
   - **Language support**: Includes `{language}` placeholder for Chinese/English output

2. **`prompts/tea_recommendation_prompt.txt`**
   - Tea and herbal beverage recommendations
   - Similar structure to food recommendations
   - Supports: 绿茶/红茶/乌龙/普洱/花茶/果茶/草本茶

**Placeholders**: `{date}`, `{time}`, `{mealPeriod}`, `{dietType}`, `{weather}`, `{solarTerm}`, `{season}`, `{language}`

## Key Technical Patterns

### 1. Recipe Display (Collapsible by Default)

**Recent Update** (2026-01-06): Cooking methods are now collapsible:

```javascript
// HTML structure for each dish
<div class="dish-recipe-section">
    <button class="recipe-toggle-btn" onclick="app.toggleRecipe(${index})">
        📜 查看制法
    </button>
    <div class="recipe-content" id="recipe-${index}" style="display: none;">
        <!-- Recipe steps displayed when expanded -->
    </div>
</div>
```

**Toggle function**:
```javascript
toggleRecipe(index) {
    const recipeContent = document.getElementById(`recipe-${index}`);
    const button = document.querySelector(`#recipe-${index}`).previousElementSibling;

    if (recipeContent.style.display === 'none') {
        recipeContent.style.display = 'block';
        button.textContent = '🔼 收起制法';
    } else {
        recipeContent.style.display = 'none';
        button.textContent = '📜 查看制法';
    }
}
```

### 2. Background System (Priority-based Loading)

**Three-tier fallback system**:
1. **Local PNG images** from `images/festival_art/` (priority)
2. **CSS gradients** (automatic fallback if image missing)
3. **70% white fog overlay** (always applied for readability)

```javascript
setSolarTermBackground(solarTermName, container) {
    const imagePath = `images/festival_art/${solarTermName}.png`;
    const img = new Image();

    img.onload = () => {
        container.style.background = `url(${imagePath}) center/cover no-repeat`;
    };

    img.onerror = () => {
        // Fallback to gradient if image not found
        this.applyGradientBackground(solarTermName, container);
    };

    img.src = imagePath;
}
```

**Gradient Database**:
- 24 solar term gradients (立春 through 大寒)
- 13 traditional festival gradients (春节, 元宵节, etc.)
- Located in `app.js` `applyGradientBackground()` method (lines 920-956)

### 3. Dish Type Classification

**Critical**: AI must return correct type field. Frontend does NOT guess types.

**Prompt Requirements**:
```
⚠️ type字段分类规则：
- 荤菜：含肉类(猪牛羊鸡鸭鱼)的菜品，如"红烧肉"、"清蒸鱼"
- 素菜：不含肉类的菜品，如"菠菜炒香干"、"麻婆豆腐"(即使有少量肉末也算素菜)
- 汤品：各种汤羹，如"紫菜蛋花汤"、"银耳莲子羹"
- 主食：米饭面食，如"白米饭"、"馒头"、"面条"
```

**Display**:
```javascript
// Frontend directly displays AI's type judgment
if (normalizedType) {
    typeLabel = `<span class="dish-type-label">(${normalizedType})</span>`;
}
```

### 4. Lunar Calendar Display Only (No Ganzhi)

**Recent Update** (2026-01-07): User requested removal of Ganzhi (天干地支)

```javascript
// Before: "丙午年 丙寅月 己卯日 辛未时 2025年腊月初六"
// After: "2025年腊月初六"
```

**Implementation**:
- Removed Ganzhi calculation from display
- Only show lunar date (农历) and solar term (节气)
- Kept calculation logic for potential future use

### 5. Glassmorphism Design System

All UI components use semi-transparent backgrounds with backdrop-filter blur:

```css
.component-name {
    background: rgba(255, 255, 255, 0.7-0.85);
    backdrop-filter: blur(8px-10px);
    -webkit-backdrop-filter: blur(8px-10px);
    border: 1px solid rgba(255, 255, 255, 0.5);
}
```

**Components with glassmorphism**:
- `.app-container` - Main wrapper (0.85 opacity, blur 10px)
- `.dish-card` - Dish cards (0.7 opacity, blur 8px)
- `.info-card` - Information cards (0.75 opacity, blur 8px)
- `.radio-text` - Radio buttons (0.75 opacity, blur 8px)

**Background Fog Overlay** (70% white):
```css
.app-container::before {
    content: '';
    background: rgba(255, 255, 255, 0.7);  /* Adjust opacity 0.5-0.9 */
    pointer-events: none;
    z-index: 0;
}
```

### 6. Language Toggle Button (Minimalist Design)

**Recent Update** (v10): Redesigned to be less intrusive

**Design**:
- 32px icon in header top-right corner
- Transparent background, no border
- Default opacity: 0.6, hover: 1.0
- Grayscale filter for subtle appearance
- Absolute positioning

**Code**:
```javascript
// HTML
<button id="langToggleBtn" class="lang-icon-btn">
    <span class="lang-icon">🌐</span>
</button>

// CSS
.lang-icon-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 32px;
    height: 32px;
    background: transparent;
    opacity: 0.6;
    filter: grayscale(30%);
}

.lang-icon-btn:hover {
    opacity: 1.0;
    transform: scale(1.1);
}
```

## File Structure

```
food/
├── index.html                      # Main UI (~200 lines)
├── style.css                       # ~2200 lines, glassmorphism theming
├── app.js                          # ~2100 lines core logic
│   ├── ChineseCalendar class       # Calendar calculations (0-296)
│   ├── LogManager class             # Logging system (298-410)
│   └── FoodRecommendationApp       # Main controller (412+)
├── i18n.js                         # ~400 lines, complete i18n system
├── prompts/
│   ├── food_recommendation_prompt.txt    # Diet recommendations (42 lines)
│   └── tea_recommendation_prompt.txt     # Tea/herbal recommendations
├── images/
│   └── festival_art/              # Solar term & festival illustrations
│       ├── 立春.png, 雨水.png, ... (24 solar terms)
│       └── 春节.png, 元宵节.png, ... (festivals)
├── server_with_env.py              # Python server with env var support
├── MODEL_PERFORMANCE_TEST.md      # Speed test results (GLM-4.7 vs 4-flash)
├── RECOMMENDATION_REASONING.md    # Reasoning feature documentation
└── 修改总结.md                      # Chinese changelog (v10)
```

## Common Development Tasks

### Modifying Prompt Templates

**Food Recommendations**: Edit `prompts/food_recommendation_prompt.txt`
- Currently 42 lines (optimized for GLM-4.6/4.7)
- **Critical requirement**: `amount` field must be pure number
- **Type classification**: Ensure clear examples for 荤菜/素菜/汤品/主食
- Placeholders: `{date}`, `{time}`, `{mealPeriod}`, `{dietType}`, `{weather}`, `{solarTerm}`, `{season}`, `{language}`

**Example of amount field requirement**:
```
⚠️ 重要: amount必须是纯数字(整数或小数),单位是克。不要带"g"或单位!
例如: {"item": "大米", "amount": 150, "effect": "..."}
❌ 错误: {"item": "大米", "amount": "150g", "effect": "..."}
```

**Type field examples**:
```
⚠️ type字段分类规则：
- 荤菜：含肉类(猪牛羊鸡鸭鱼)的菜品，如"红烧肉"、"清蒸鱼"
- 素菜：不含肉类的菜品，如"菠菜炒香干"、"麻婆豆腐"(即使有少量肉末也算素菜)
- 汤品：各种汤羹，如"紫菜蛋花汤"、"银耳莲子羹"
- 主食：米饭面食，如"白米饭"、"馒头"、"面条"
```

### Adding/Modifying Translations

**Step 1**: Add translation keys to `i18n.js`

```javascript
// Chinese (zh)
'your.key': '中文文本',

// English (en)
'your.key': 'English Text',
```

**Step 2**: Use in HTML (separate icon from text)

```html
<!-- Recommended structure -->
<h2 class="section-title">
    <span class="section-icon">🎨</span>
    <span data-i18n="your.key">Default Text</span>
</h2>
```

**Step 3**: Or use dynamically in JavaScript

```javascript
const text = i18n.t('your.key');
element.innerHTML = `<p>${text}</p>`;
```

**Important**: Icons should be in separate `<span>` elements, not in translation strings.

### Changing Background Colors

**Option 1**: Modify gradients in `app.js` (lines 920-956):
```javascript
const solarTermGradients = {
    '小寒': 'linear-gradient(135deg, #e6dada 0%, #274046 100%)',
    // Edit gradients for each solar term
};
```

**Option 2**: Adjust fog overlay in `style.css` (lines 127-137):
```css
.app-container::before {
    background: rgba(255, 255, 255, 0.7);  /* Adjust 0.5-0.9 */
}
```

### Adding Custom Illustrations

1. Download Chinese-style illustrations (插画, not photos)
2. Save to: `images/festival_art/`
3. **Critical naming**: `立春.png`, `雨水.png`, etc. (exact solar term names)
4. App automatically prioritizes local images over gradients

### Debugging

**Browser Console Commands**:
```javascript
// View all logs
app.logger.getLogs()

// Export logs to JSON
app.logger.exportLogs()

// Clear logs
app.logger.clearLogs()

// View cached recommendation
app.cachedRecommendation

// View prompt cache
app.promptCache

// Check current language
i18n.currentLang

// Switch language
i18n.setLanguage('en')
```

**Important Console Checks**:
- Solar term calculation results
- API request/response details
- Model fallback attempts
- JSON parsing errors
- Translation process logs
- Recipe toggle state changes

## Known Issues & Solutions

### 1. GLM-4.7 Instability
**Problem**: GLM-4.7 sometimes returns empty content (historical issue)
**Solution**: Multi-model fallback (GLM-4.7 → GLM-4.6 → GLM-4-flash)
**Note**: Latest testing shows GLM-4.7 is actually fastest and most stable

### 2. JSON Parsing - Amount Field Format
**Problem**: AI returns `"amount": "150g"` instead of `"amount": 150`
**Solution**: Explicit prompt requirement with examples of correct/incorrect format
**Status**: Fixed in prompt template

### 3. Dish Type Classification Errors
**Problem**: Frontend guessing types based on keywords (e.g., "菠菜炒香干" labeled as meat dish)
**Solution**:
- Removed all frontend type-guessing logic
- AI must return correct `type` field
- Prompt provides clear classification rules with examples
**Status**: Fixed - AI handles type classification

### 4. Translation Not Showing After Language Switch
**Problem**: Content remains in Chinese after switching to English
**Solution**:
- Recommendation is cached in `this.cachedRecommendation`
- On language switch, `translateCachedRecommendation()` is called
- Uses GLM-4-flash to translate entire JSON structure
- Preserves `items` field and data structure
**Status**: Fixed with comprehensive translation system

### 5. Performance Issues on Subsequent Generations
**Problem**: Second recommendation generation is very slow
**Solution**:
- Added prompt template caching in `this.promptCache`
- First load: fetches from file system
- Subsequent loads: reads from cache (instant)
- Added detailed timing logs for diagnosis
**Status**: Fixed with caching system

### 6. Solar Term Calculation Error
**Problem**: `prevJie.getYear is not a function` with lunar-javascript library
**Solution**: Use `toString()` and regex extraction instead of non-existent methods
```javascript
const prevJieStr = prevJie.toString();
const match = prevJieStr.match(/(\d{4})-(\d{2})-(\d{2})/);
```

### 7. Tea vs Dish Field Name
**Problem**: AI returns `teas` field but code expects `dishes`
**Solution**: Support both field names and normalize to unified `items` field
```javascript
const hasDishes = recommendation.dishes && Array.isArray(recommendation.dishes);
const hasTeas = recommendation.teas && Array.isArray(recommendation.teas);
const items = hasDishes ? recommendation.dishes : recommendation.teas;
recommendation.items = items;
```

## Design Philosophy

### Chinese Cultural Integration

**Color symbolism**:
- Traditional pigments (胭脂红, 古金, 碧玉青, 徽墨)
- Seasonal gradients reflect natural phenomena
- Solar term gradients carry cultural meaning

**Classical terminology**:
- 黄历, 时辰, 天候, 天地
- Emphasis on "天人合一" (harmony between heaven and humanity)
- Removed: Ganzhi (天干地支) per user request

### User Experience Principles

**Recent improvements** (2026-01-07):
1. **Complete internationalization** - Chinese/English support
2. **Collapsible recipes** - Default collapsed, click to expand
3. **Simplified reasoning** - Three comprehensive sections only
4. **Model prioritization** - GLM-4.7 first (fastest based on testing)
5. **Glassmorphism design** - Modern semi-transparent components
6. **70% fog overlay** - Ensures text readability
7. **Local image support** - 41 PNG files with automatic fallback
8. **Prompt caching** - Faster subsequent generations
9. **Recommendation caching** - Instant language switching
10. **Minimalist language button** - 32px icon, transparent background

### Internationalization Design

**Icon + Text Separation**:
- Icons are decorative elements (emoji)
- Text is translatable via i18n system
- Structure: `<span class="icon">🎨</span><span data-i18n="key">Text</span>`
- Never include icons in translation strings

**Comprehensive Coverage**:
- All static UI elements: ✅ Internationalized
- All dynamic content: ✅ Translatable via AI
- Page title: ✅ Updates with language
- Error messages: ✅ Translated
- Loading states: ✅ Translated
- AI content: ✅ Cached and translatable

## Performance Optimization

Based on speed testing (`MODEL_PERFORMANCE_TEST.md`):
- **Model selection**: GLM-4.7 (39% faster overall)
- **Prompt template caching**: Avoids repeated file reads
- **Recommendation caching**: Instant language switching
- **Local image prioritization**: Preloads with graceful degradation
- **Hardware acceleration**: backdrop-filter uses GPU
- **Event debouncing**: 10ms setTimeout for rapid input changes
- **Multi-step feedback**: Reduces perceived wait time

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Requires ES6+ support
- Requires Geolocation API
- Requires localStorage
- No polyfills - modern browsers only

## Security Best Practices

### API Key Management

**✅ DO:**
- Store API keys in `.env` file (not in version control)
- Use environment variables for API keys
- Load API keys at runtime from server endpoint
- Rotate API keys regularly
- Use different API keys for dev/prod

**❌ DON'T:**
- Hardcode API keys in JavaScript/Python files
- Commit API keys to version control
- Share API keys in public forums
- Use the same API key across multiple environments

### Environment Variable Flow

```
1. .env file (server-side, not in git)
   ↓
2. server_with_env.py (reads .env on startup)
   ↓
3. os.environ['ZHIPU_API_KEY']
   ↓
4. /api/env-api-key endpoint
   ↓
5. app.js fetch('/api/env-api-key')
   ↓
6. ZhipuAI API call
```

### Files That Should Contain API Keys

- ✅ `.env` - Server environment configuration
- ✅ System environment variables

### Files That MUST NOT Contain API Keys

- ❌ `app.js` - Frontend code
- ❌ `index.html` - HTML files
- ❌ `server_with_env.py` - Python source (read from env, don't hardcode)
- ❌ `test_*.py` - Test scripts (read from env)
- ❌ `test_*.html` - Test pages (fetch from server)
- ❌ `*.md` - Documentation files

### Verification

To verify no hardcoded keys:
```bash
# Search for API key patterns in source code
grep -r "8760a192a" --exclude-dir=node_modules --exclude-dir=.git
```

Should only find:
- `.env` file
- Test reports/documentation (not source code)

## Testing Checklist

1. **Solar term detection** - Try dates near each 节气 (±2 days)
2. **Season theming** - Try dates in each season
3. **Recipe toggle** - Verify expand/collapse works
4. **Language switching** - Test Chinese ⇄ English for all UI elements
5. **Content translation** - Generate recommendation, switch language, verify AI content translates
6. **Model fallback** - Test with different GLM models
7. **Background images** - Verify all 41 PNG images load
8. **Fog overlay** - Check text readability
9. **Glassmorphism** - Verify backdrop-filter works
10. **Dish types** - Verify AI returns correct types (no frontend guessing)
11. **Prompt caching** - Verify second generation is faster
12. **Lunar display** - Verify only lunar date shows (no Ganzhi)

## Important Files to Read

- **README.md** - User-facing documentation
- **MODEL_PERFORMANCE_TEST.md** - Detailed speed test results
- **RECOMMENDATION_REASONING.md** - Reasoning feature documentation
- **修改总结.md** - Recent changes summary (in Chinese)
- **i18n.js** - Complete internationalization system

## Version History

- **v8**: Basic functionality, JSON parsing fixes
- **v9**: Heat optimization + language button redesign + UI compaction
- **v10**: Ingredient gram display + minimalist language button + heat icon optimization
- **v11** (2026-01-07): Complete internationalization system + prompt caching + recommendation caching + Ganzhi removal + comprehensive language support
- **v12** (2026-01-13): Added 8 new health goal options (益气、补血、润肺、疏肝、生津、滋阴、温阳、固表) with comprehensive TCM dietary theory support for both food and tea recommendations
- **v13** (2026-01-13): Reorganized display layout (综合建议/茶道品评前置) + improved solar term detection (全年节气判断) + DOM safety checks + tea XHS sharing + removed button icon
