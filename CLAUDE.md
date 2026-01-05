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
   - **Glassmorphism design** - Semi-transparent components with backdrop-filter blur
   - **Background fog effect** - 70% white overlay on illustrations for readability

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

**Priority-based background loading** - Local images first, then gradients:

```javascript
setSolarTermBackground(solarTermName, container) {
    // 1. Try local illustration image first
    const imagePath = `images/festival_art/${solarTermName}.png`;
    const img = new Image();

    img.onload = () => {
        // Use local image if available
        container.style.background = `url(${imagePath}) center/cover no-repeat`;
    };

    img.onerror = () => {
        // Fallback to gradient if image not found
        this.applyGradientBackground(solarTermName, container);
    };

    img.src = imagePath;
}
```

**Gradient fallback system** for each solar term and traditional festival:
- 24 solar term gradients (立春 through 大寒)
- 13 traditional festival gradients (春节, 元宵节, etc.)
- Automatic fallback if local images missing

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
│       ├── 立春.png
│       ├── 小寒.png
│       ├── 春节.png
│       └── ... (41 PNG files - 24 solar terms + festivals)
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

**Option 1: Modify gradient fallbacks** in `app.js` around line 920-956 (`applyGradientBackground` method):

```javascript
const solarTermGradients = {
    '小寒': 'linear-gradient(135deg, #e6dada 0%, #274046 100%)',  // Edit gradient
    // ...
};
```

**Option 2: Adjust fog overlay** in `style.css` line 127-137:

```css
.app-container::before {
    background: rgba(255, 255, 255, 0.7);  /* Adjust opacity (0.5-0.9) */
}
```

**Background System**:
- Prioritizes local PNG images from `images/festival_art/`
- Falls back to CSS gradients if images missing
- Applies 70% white fog overlay for readability

### Adjusting Ganzhi Display Format

Edit `updateGanzhiDisplay()` in `app.js` (line ~724-763):

```javascript
// Current format: "丙午年 丙寅月 己卯日 辛未时  2025年腊月初六  ✨ 今日小寒 ✨"
const ganzhiCompact = `${ganzhi.year} ${ganzhi.month} ${ganzhi.day} ${ganzhi.hour}`;
const displayElement = document.getElementById('ganzhiDisplay');
displayElement.textContent = `${ganzhiCompact}  ${lunarDate.display}${termInfo}`;
```

### Adding Manual Illustrations

If users want custom illustration backgrounds:

1. Use `illustration_download_guide.html` to find Baidu Image search links
2. Download Chinese-style illustrations (插画, not photos)
3. Save to: `images/festival_art/`
4. **Critical naming convention**:
   - 24 solar terms: `立春.png`, `雨水.png`, ..., `大寒.png`
   - Traditional festivals: `春节.png`, `元宵节.png`, etc.
5. Application automatically uses local images if they exist, falls back to gradients if missing

**Current setup**:
- 41 PNG illustration files already downloaded
- Local images prioritized over gradients
- Automatic Image preload with graceful degradation
- 70% white fog overlay ensures readability

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
- Created gradient background system as primary fallback
- Created manual download guide for custom illustrations
- Users manually downloaded 41 PNG files from Baidu Images
- Automatic image prioritization with graceful degradation

### 4. Visual Clarity with Backgrounds
**Problem**: Background illustrations make text hard to read
**Solution**:
- Implemented 70% white fog overlay (`rgba(255, 255, 255, 0.7)`)
- Applied glassmorphism design with backdrop-filter blur
- Semi-transparent components (rgba with alpha 0.7-0.85)
- Softened borders and shadows for better contrast

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
6. **Glassmorphism visual design** - Modern semi-transparent components
7. **Background fog effect** - 70% white overlay for readability
8. **Local illustration support** - 41 PNG files with automatic fallback

## Testing

### Manual Testing Checklist

1. **Solar term detection** - Try dates near each节气 (±2 days)
2. **Season theming** - Try dates in each season
3. **Real-time updates** - Change date/time and verify instant updates
4. **Loading steps** - Verify all 4 steps complete correctly
5. **Dish sorting** - Verify 主食 appears last in list
6. **Model fallback** - Test with different GLM models
7. **Background images** - Verify all 41 PNG images load correctly
8. **Fog overlay** - Check text readability with different backgrounds
9. **Glassmorphism effects** - Verify backdrop-filter works on all components

### Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Requires ES6+ support
- Requires Geolocation API
- Requires localStorage

No polyfills included - modern browsers only.

## Performance Notes

- **Loading optimization**: Uses fastest model first (glm-4-flash)
- **Local image prioritization**: Preloads images with graceful fallback
- **70% fog overlay**: Improves readability without obscuring backgrounds
- **Glassmorphism effects**: Hardware-accelerated backdrop-filter
- **Event debouncing**: 10ms setTimeout for rapid input changes
- **Step-by-step feedback**: Reduces perceived wait time

## Key CSS Patterns

### Glassmorphism Component Styling

All UI components follow this pattern for visual consistency:

```css
.component-name {
    background: rgba(255, 255, 255, 0.7-0.85);
    backdrop-filter: blur(8px-10px);
    -webkit-backdrop-filter: blur(8px-10px);
    border: 1px solid rgba(255, 255, 255, 0.5);
}
```

**Components with glassmorphism**:
- `.app-container` - Main application wrapper (0.85 opacity, blur 10px)
- `.dish-card` - Individual dish cards (0.7 opacity, blur 8px)
- `.input-group input` - Text input fields (0.8 opacity)
- `.styled-select` - Dropdown selects (0.75 opacity, blur 8px)
- `.primary-btn` / `.secondary-btn` - Buttons (with blur effects)
- `.radio-text` - Radio button labels (0.75 opacity, blur 8px)
- `.info-card` - Information cards (0.75 opacity, blur 8px)
- `.loading-steps` - Loading progress container (0.7 opacity, blur 8px)

### Background Fog Overlay

Located at `style.css` lines 127-137:

```css
.app-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.7);  /* Adjust for more/less fog */
    pointer-events: none;
    z-index: 0;
}
```

**Note**: Fog overlay is positioned above background images but below content (z-index: 0 vs content z-index: 1).
