# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Traditional Chinese Medicine (TCM) Dietary Recommendation Web Application** that combines ancient Chinese wellness wisdom with modern AI technology. The application uses ZhipuAI GLM models to generate personalized dietary recommendations based on:

- **24 Solar Terms (节气)** - Traditional Chinese seasonal markers with cultural significance
- **TCM Ganzhi (天干地支) Calendar** - Year, month, day, and hour stem-branch system
- **Lunar Calendar** - Chinese lunisolar calendar integration
- **Weather conditions and geographical location** - 31 major Chinese cities
- **Meal period** - Breakfast (早餐), Lunch (午餐), Dinner (晚餐)
- **Diet type** - Regular diet (日常饮食), Medicinal (药膳调理), Tea recommendations (茶饮养生)

## Quick Start

### Starting the Application

```bash
# Recommended: Using the unified server
cd C:\D\CAIE_tool\MyAIProduct\food
python -m http.server 8000

# Or use server_with_env.py for environment variable support
python server_with_env.py
```

Application runs at: `http://localhost:8000/index.html`

### API Key Configuration

**Required**: `ZHIPU_API_KEY` environment variable
- Format: `id.secret` (e.g., `12345.abcde67890`)
- The app fetches it via `/api/env-api-key` endpoint on load (if using server_with_env.py)
- Fallback: Browser localStorage if env variable unavailable

### Setting API Key (Windows)

```cmd
# Command Prompt
set ZHIPU_API_KEY=your-api-key-here
python server_with_env.py

# PowerShell
$env:ZHIPU_API_KEY="your-api-key-here"
python server_with_env.py
```

## Architecture

### Frontend Architecture

**Pure HTML/CSS/JavaScript** with no build process:

1. **index.html** - Main UI with elegant Chinese aesthetic design
   - Ganzhi display: "丙午年 丙寅月 己卯日 辛未时 2025年腊月初六 ✨ 今日小寒 ✨"
   - Input controls for date, time, city, weather
   - Diet type selection (regular/medicinal/tea)

2. **style.css** (~1700 lines) - Comprehensive theming system:
   - **Four-season palettes** based on traditional Chinese color theory
   - **24 solar term specific gradient backgrounds** - each节气 has unique cultural gradient
   - **Traditional Chinese color spectrum** - 25+ traditional colors (胭脂, 古金, 碧玉, 徽墨, etc.)
   - **Flat, minimalist design** - optimized for readability

3. **app.js** (~1800 lines) - Core logic with:
   - **ChineseCalendar class** - Centralized calendar calculations
   - **LogManager class** - localStorage-based logging
   - **FoodRecommendationApp class** - Main application controller

### Backend Architecture

**Python HTTP Servers** (no server-side rendering):

- **server_with_env.py** (recommended) - Environment variable support with `/api/env-api-key` endpoint
- Simple HTTP server via `python -m http.server 8000`

### Prompt System

**External prompt templates** with placeholder substitution:

- `prompts/food_recommendation_prompt.txt` - Main diet recommendations (42 lines, optimized for GLM-4.6)
- `prompts/tea_recommendation_prompt.txt` - Tea and herbal beverage recommendations

**Placeholders**: `{date}`, `{time}`, `{mealPeriod}`, `{dietType}`, `{weather}`, `{solarTerm}`, `{season}`, `{location}`

## Key Technical Patterns

### 1. ChineseCalendar Class

Centralized calculation engine for all calendar functions:

```javascript
class ChineseCalendar {
    // Solar to lunar conversion
    solarToLunar(solarDate)

    // Dynamic solar term calculation based on date
    getCurrentSolarTerm(date)

    // Ganzhi calculation (year, month, day, hour)
    calculateGanzhi(date, hours, minutes)

    // Solar terms database with day ranges
    this.solarTerms = [
        { name: '立春', month: 2, dayRange: [3, 5] },
        { name: '小寒', month: 1, dayRange: [5, 7] },
        // ... all 24 solar terms
    ]
}
```

### 2. Real-time UI Updates

All date/time changes trigger immediate updates via event listeners:

```javascript
setupEventListeners() {
    // Both 'change' and 'input' events for real-time updates
    dateInput.addEventListener('change', () => {
        this.updateSolarTermDisplay();
        this.detectAndSetSeason();
    });
    dateInput.addEventListener('input', () => {
        setTimeout(() => {
            this.updateSolarTermDisplay();
            this.detectAndSetSeason();
        }, 10);
    });
}
```

### 3. Solar Term Display Logic

Priority system for nearby solar terms:

```javascript
// Check dates in order: 今日 > 昨日 > 前日 > 明日
const todayTerm = this.getSolarTermForDate(today);
const yesterdayTerm = this.getSolarTermForDate(yesterday);
const dayBeforeYesterdayTerm = this.getSolarTermForDate(dayBeforeYesterday);
const tomorrowTerm = this.getSolarTermForDate(tomorrow);

// Build display with priority
let termInfo = '';
if (todayTerm) {
    termInfo = `  ✨ 今日${todayTerm.name} ✨`;
} else if (yesterdayTerm) {
    termInfo = `  📅 昨日${yesterdayTerm.name}`;
} else if (dayBeforeYesterdayTerm) {
    termInfo = `  📅 前日${dayBeforeYesterdayTerm.name}`;
} else if (tomorrowTerm) {
    termInfo = `  📅 明日${tomorrowTerm.name}`;
}
```

### 4. Chinese Style Background System

**Gradient backgrounds** for each solar term and traditional festival:

```javascript
setSolarTermBackground(solarTermName, container) {
    const solarTermGradients = {
        '立春': 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)',  // 春竹新生
        '小寒': 'linear-gradient(135deg, #e6dada 0%, #274046 100%)',  // 小寒严寒
        // ... all 24 solar terms
    };

    const festivalGradients = {
        '春节': 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',  // 春节红妆
        '中秋': 'linear-gradient(135deg, #2c3e50 0%, #fd746c 100%)', // 中秋月圆
        // ... all traditional festivals
    };

    // Priority: festivals > solar terms
    const gradient = festivalGradients[solarTermName] || solarTermGradients[solarTermName];
    if (gradient) {
        container.style.background = gradient;
        container.style.transition = 'background 0.5s ease';
    }
}
```

**Near-solar-term detection**: Checks today ±2 days for special UI effects.

### 5. Optimized Loading Experience

Multi-step loading indicator with real-time progress:

```javascript
// Loading steps display
<div class="loading-steps">
    <div class="step active">✓ 收集信息</div>
    <div class="step">○ 分析节气</div>
    <div class="step">○ AI生成推荐</div>
    <div class="step">○ 整理结果</div>
</div>

// Update function
updateLoadingStep(stepNumber) {
    // Marks completed steps with ✓
    // Marks current step with →
    // Upcoming steps show ○
}
```

### 6. Model Fallback Strategy (Optimized)

**Fastest-first approach** for better user experience:

```javascript
const models = ['glm-4-flash', 'glm-4.6', 'glm-4.7'];
// Prioritizes speed: flash (fastest) → 4.6 → 4.7 (slowest but best quality)
```

**Critical Endpoint Details**:
```
URL: https://open.bigmodel.cn/api/anthropic/v1/messages
Headers: { 'x-api-key': apiKey }
Format: Anthropic-compatible
```

### 7. Display Format - Recent Updates

**Food Recommendation Display** (Latest Version):
- **主食 placed last** - Sorted to display at the end
- **Flattened structure** - All information in one panel, no nested layers
- **制作方法 + 推荐理由** - Each dish shows both cooking method and recommendation reason
- **No "查看制法" button** - Recipe displays directly as numbered steps

```javascript
// Sort dishes so 主食 appears last
const sortedDishes = [...recommendation.dishes].sort((a, b) => {
    if (a.type === '主食') return 1;
    if (b.type === '主食') return -1;
    return 0;
});

// Each dish card now includes:
<div class="dish-suitable">
    <p class="label">🍳 制作方法</p>
    <div class="value">
        <!-- Recipe steps displayed directly as numbered list -->
    </div>
</div>
<div class="dish-suitable">
    <p class="label">💡 推荐理由</p>
    <div class="value">
        <!-- Recommendation reasoning from AI -->
    </div>
</div>
```

## File Structure

```
food/
├── index.html                      # Main UI
├── style.css                       # ~1700 lines, theming & animations
├── app.js                          # ~1800 lines core logic
│   ├── ChineseCalendar class       # Calendar calculations (line 0-296)
│   ├── LogManager class             # Logging system (line 298-410)
│   └── FoodRecommendationApp       # Main controller (line 412+)
├── prompts/
│   ├── food_recommendation_prompt.txt    # Diet recommendations (42 lines)
│   └── tea_recommendation_prompt.txt     # Tea/herbal recommendations
├── images/
│   └── festival_art/              # Solar term & festival illustration storage
│       ├── 立春.jpg
│       ├── 小寒.jpg
│       ├── 春节.jpg
│       └── ... (37 total files)
├── server_with_env.py              # Python server with env var support
└── illustration_download_guide.html  # Manual image download guide
```

## Common Development Tasks

### Modifying Prompts

Edit prompt files in `prompts/` directory directly:

**Food Recommendations**: `prompts/food_recommendation_prompt.txt`
- Currently 42 lines (optimized for GLM-4.6 stability)
- Must request JSON output with specific structure
- Key fields: dishes[], reasoning, tips, totalNutrition

### Changing Background Colors

Edit in `app.js` around line 878-932 (`setSolarTermBackground` method):

```javascript
const solarTermGradients = {
    '小寒': 'linear-gradient(135deg, #e6dada 0%, #274046 100%)',  // Edit this
    // ...
};
```

**Background System**: Uses CSS gradients instead of image files for performance and reliability.

### Adjusting Ganzhi Display Format

Edit `updateGanzhiDisplay()` in `app.js` (line ~724-763):

```javascript
// Current format: "丙午年 丙寅月 己卯日 辛未时  2025年腊月初六  ✨ 今日小寒 ✨"
const ganzhiCompact = `${ganzhi.year} ${ganzhi.month} ${ganzhi.day} ${ganzhi.hour}`;
const displayElement = document.getElementById('ganzhiDisplay');
displayElement.textContent = `${ganzhiCompact}  ${lunarDate.display}${termInfo}`;
```

### Adding Manual Illustrations

If users want custom illustration backgrounds instead of gradients:

1. Download illustrations from Baidu Images using `illustration_download_guide.html`
2. Save to: `images/festival_art/`
3. **Naming convention** (critical - must match exactly):
   - 24 solar terms: `立春.jpg`, `雨水.jpg`, ..., `大寒.jpg`
   - Traditional festivals: `春节.jpg`, `元宵节.jpg`, ..., `上巳节.jpg`
4. Application will automatically use images if they exist, otherwise falls back to gradients

**Note**: The gradient background system is recommended as it's faster, more reliable, and carries cultural meaning through color symbolism.

### Debugging

View logs in browser console:

```javascript
// View all logs
app.logger.getLogs()

// Export logs to JSON
app.logger.exportLogs()

// Clear logs
app.logger.clearLogs()
```

**Important**: Check browser console for:
- Solar term calculation results
- API request/response details
- Model fallback attempts
- Loading step updates

## Key Technical Details

### Solar Term Detection Range

Checks **±2 days** around today for special UI effects:

```javascript
isNearSolarTerm(date) {
    // Checks: today, tomorrow, yesterday, dayBeforeYesterday
    return this.getSolarTermForDate(today) !== null ||
           this.getSolarTermForDate(tomorrow) !== null ||
           this.getSolarTermForDate(yesterday) !== null ||
           this.getSolarTermForDate(dayBeforeYesterday) !== null;
}
```

### Season Detection

```javascript
// Date ranges for seasons
Spring:  March 21 - May 20
Summer:  May 21 - August 22
Autumn:  August 23 - November 22
Winter:  November 23 - March 20
```

### Lunar Calendar Calculation

Simplified algorithm with reference date:
- Base: 2024-01-11 = 农历2023年十二月初一
- Average 29.53 days per lunar month
- Suitable for dietary recommendations (not astronomically precise)

## Known Issues & Solutions

### 1. GLM-4.7 Instability
**Problem**: GLM-4.7 sometimes returns empty content
**Solution**: Auto-fallback to GLM-4.6, optimized model order (flash → 4.6 → 4.7)

### 2. Loading Time Perception
**Problem**: Users feel API calls take too long
**Solution**:
- Multi-step loading indicator with real-time progress
- Optimized model order (flash first for speed)
- Updated estimated time display: "5-15秒" instead of "10-30秒"

### 3. Illustration vs Photo Confusion
**Problem**: Downloaded images from free sites are mostly photos, not illustrations
**Solution**:
- Created gradient background system (primary)
- Created manual download guide for users who want custom illustrations
- Users can manually download from Baidu Images using the guide

## Design Philosophy

### Chinese Cultural Integration

**Color symbolism**:
- Traditional pigments (胭脂红, 古金, 碧玉青, 徽墨)
- Seasonal gradients reflect natural phenomena
- Solar term gradients carry cultural meaning

**Classical terminology**:
- 黄历, 时辰, 天候, 天地
- Emphasis on "天人合一" (harmony between heaven and humanity)

### User Experience Optimization

**Recent improvements** (2025-01-05):
1. **Flattened display structure** - No nested accordion panels
2. **Real-time updates** - Immediate feedback on all input changes
3. **Visual progress indicators** - Multi-step loading with clear status
4. **Fastest-first model selection** - Prioritize speed over quality
5. **Comprehensive information per dish** - All info in one place

## Testing

### Manual Testing Checklist

1. **Solar term detection** - Try dates near each节气 (±2 days)
2. **Season theming** - Try dates in each season
3. **Real-time updates** - Change date/time and verify instant updates
4. **Loading steps** - Verify all 4 steps complete correctly
5. **Dish sorting** - Verify 主食 appears last in list
6. **Model fallback** - Test with different GLM models
7. **Background gradients** - Check all 24 solar terms + 13 festivals

### Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Requires ES6+ support
- Requires Geolocation API
- Requires localStorage

No polyfills included - modern browsers only.

## Performance Notes

- **Loading optimization**: Uses fastest model first (glm-4-flash)
- **Gradient backgrounds**: CSS-only, no image loading overhead
- **Event debouncing**: 10ms setTimeout for rapid input changes
- **Step-by-step feedback**: Reduces perceived wait time
