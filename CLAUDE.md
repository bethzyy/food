# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Traditional Chinese Medicine (TCM) Dietary Recommendation Web Application** that combines ancient Chinese wellness wisdom with modern AI technology. The application uses ZhipuAI GLM models (specifically GLM-4.7 based on performance testing) to generate personalized dietary recommendations based on 24 Solar Terms, TCM Ganzhi calendar, weather conditions, meal periods, and diet types.

## Quick Start

### Starting the Application

```bash
cd C:\D\CAIE_tool\MyAIProduct\food
python -m http.server 8000
```

Application runs at: `http://localhost:8000`

### API Key Configuration

**Required**: `ZHIPU_API_KEY` environment variable
- Format: `id.secret` (e.g., `12345.abcde67890`)
- The app can read from:
  1. Environment variable (recommended)
  2. Browser localStorage (fallback via UI modal)

**Setting API Key (Windows)**:
```cmd
set ZHIPU_API_KEY=your-api-key-here
python -m http.server 8000
```

## Architecture

### Core Technology Stack

**Pure HTML/CSS/JavaScript** (no build tools, no frameworks):
- **index.html** - Main UI with glassmorphism design
- **style.css** (~2200 lines) - Comprehensive theming with glassmorphism effects
- **app.js** (~1900 lines) - All business logic

**Key Libraries**:
- **Chart.js 4.4.0** - Interactive nutrition pie chart
- **lunar-javascript** - Chinese lunar calendar and solar term calculations
- **ZhipuAI GLM API** - AI model for recommendation generation

### Frontend Architecture (app.js)

The codebase is organized into three main classes:

#### 1. **ChineseCalendar Class** (lines 0-296)
Centralized calculation engine for all calendar functions:
- Solar to lunar conversion using simplified algorithm
- Dynamic solar term detection with ±2 day range
- Ganzhi (天干地支) calculation for year, month, day, and hour
- 24 solar terms database with specific day ranges
- Season detection (spring: Mar 21 - May 20, etc.)

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
Headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }
Format: Anthropic-compatible API
```

### Prompt System

**External prompt templates** with placeholder substitution:

1. **`prompts/food_recommendation_prompt.txt`** (42 lines)
   - Main diet recommendations
   - Optimized for GLM-4.6/4.7 stability
   - Requires strict JSON output format
   - Key fields: `dishes[]`, `reasoning`, `tips`, `totalNutrition`
   - **Critical**: `amount` field must be pure number (no "g" or units)

2. **`prompts/tea_recommendation_prompt.txt`**
   - Tea and herbal beverage recommendations
   - Similar structure to food recommendations

**Placeholders**: `{date}`, `{time}`, `{mealPeriod}`, `{dietType}`, `{weather}`, `{solarTerm}`, `{season}`

## Key Technical Patterns

### 1. Solar Term Detection (Priority System)

Checks dates in priority order: today > yesterday > dayBeforeYesterday > tomorrow

```javascript
const todayTerm = this.getSolarTermForDate(today);
const yesterdayTerm = this.getSolarTermForDate(yesterday);
const dayBeforeYesterdayTerm = this.getSolarTermForDate(dayBeforeYesterday);
const tomorrowTerm = this.getSolarTermForDate(tomorrow);

// Build display with special markers
if (todayTerm) {
    termInfo = `  ✨ 今日${todayTerm.name} ✨`;
} else if (yesterdayTerm) {
    termInfo = `  📅 昨日${yesterdayTerm.name}`;
}
// etc...
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

### 3. Recipe Display (Collapsible by Default)

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

### 4. Reasoning Display (Simplified Three-Section Format)

**Recent Update** (2026-01-06): Reasoning now shows only three comprehensive sections:

```javascript
// Display structure
displayReasoning(recommendation) {
    // Three sections only:
    // 1. 🏥 中医养生角度 (100-150 words)
    // 2. 🌸 时令养生角度 (100-150 words)
    // 3. 🔬 现代营养学角度 (100-150 words)
}
```

**No per-dish reasoning** - Removed individual dish recommendations in favor of overall analysis.

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

## File Structure

```
food/
├── index.html                      # Main UI (~170 lines)
├── style.css                       # ~2200 lines, glassmorphism theming
├── app.js                          # ~1900 lines core logic
│   ├── ChineseCalendar class       # Calendar calculations (0-296)
│   ├── LogManager class             # Logging system (298-410)
│   └── FoodRecommendationApp       # Main controller (412+)
├── prompts/
│   ├── food_recommendation_prompt.txt    # Diet recommendations (42 lines)
│   └── tea_recommendation_prompt.txt     # Tea/herbal recommendations
├── images/
│   └── festival_art/              # Solar term & festival illustrations
│       ├── 立春.png, 雨水.png, ... (24 solar terms)
│       └── 春节.png, 元宵节.png, ... (festivals)
├── server_with_env.py              # Python server with env var support
├── MODEL_PERFORMANCE_TEST.md      # Speed test results (GLM-4.7 vs 4-flash)
└── RECOMMENDATION_REASONING.md    # Reasoning feature documentation
```

## Common Development Tasks

### Modifying Prompt Templates

**Food Recommendations**: Edit `prompts/food_recommendation_prompt.txt`
- Currently 42 lines (optimized for GLM-4.6/4.7)
- **Critical requirement**: `amount` field must be pure number
- Placeholders: `{date}`, `{time}`, `{mealPeriod}`, `{dietType}`, `{weather}`, `{solarTerm}`, `{season}`

**Example of amount field requirement**:
```
⚠️ 重要: amount必须是纯数字(整数或小数),单位是克。不要带"g"或单位!
例如: {"item": "大米", "amount": 150, "effect": "..."}
❌ 错误: {"item": "大米", "amount": "150g", "effect": "..."}
```

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
```

**Important Console Checks**:
- Solar term calculation results
- API request/response details
- Model fallback attempts
- JSON parsing errors
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

### 3. Solar Term Calculation Error
**Problem**: `prevJie.getYear is not a function` with lunar-javascript library
**Solution**: Use `toString()` and regex extraction instead of non-existent methods
```javascript
const prevJieStr = prevJie.toString();
const match = prevJieStr.match(/(\d{4})-(\d{2})-(\d{2})/);
```

### 4. Tea vs Dish Field Name
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

### User Experience Principles

**Recent improvements** (2026-01-06):
1. **Collapsible recipes** - Default collapsed, click to expand
2. **Simplified reasoning** - Three comprehensive sections only
3. **Model prioritization** - GLM-4.7 first (fastest based on testing)
4. **Glassmorphism design** - Modern semi-transparent components
5. **70% fog overlay** - Ensures text readability
6. **Local image support** - 41 PNG files with automatic fallback

## Performance Optimization

Based on speed testing (`MODEL_PERFORMANCE_TEST.md`):
- **Model selection**: GLM-4.7 (39% faster overall)
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

## Testing Checklist

1. **Solar term detection** - Try dates near each 节气 (±2 days)
2. **Season theming** - Try dates in each season
3. **Recipe toggle** - Verify expand/collapse works
4. **Reasoning display** - Verify three sections show correctly
5. **Model fallback** - Test with different GLM models
6. **Background images** - Verify all 41 PNG images load
7. **Fog overlay** - Check text readability
8. **Glassmorphism** - Verify backdrop-filter works

## Important Files to Read

- **README.md** - User-facing documentation
- **MODEL_PERFORMANCE_TEST.md** - Detailed speed test results
- **RECOMMENDATION_REASONING.md** - Reasoning feature documentation
- **修改总结.md** - Recent changes summary (in Chinese)
