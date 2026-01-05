# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Traditional Chinese Medicine (TCM) Dietary Recommendation Web Application** that combines ancient Chinese wellness wisdom with modern AI technology. The application uses ZhipuAI GLM models to generate personalized dietary recommendations based on:

- **24 Solar Terms (节气)** - Traditional Chinese seasonal markers with cultural significance
- **TCM Ganzhi (天干地支) Calendar** - Year, month, day, and hour stem-branch system
- **Lunar Calendar** - Chinese lunisolar calendar integration
- **Weather conditions and geographical location** - 31 major Chinese cities
- **Meal period** - Breakfast (晨起), Lunch (日中), Dinner (日暮)
- **Diet type** - Regular diet (日常饮食), Medicinal (药膳调理), Tea recommendations (茶饮养生)

The application features an elegant Chinese aesthetic with dynamically adaptive colors based on both **season** and **solar term**, celebrating traditional Chinese culture and color theory.

## Quick Start

### Starting the Application

```bash
# Recommended: Using the unified server
cd C:\D\CAIE_tool\MyAIProduct\food
python app_server.py

# Application will auto-open at: http://localhost:8000
```

The unified server (`app_server.py`) provides:
- Static file serving
- `/api/env-api-key` endpoint for secure API key retrieval from environment variables
- Auto-browser opening
- Comprehensive status reporting

### API Key Configuration

**Required**: `ZHIPU_API_KEY` environment variable
- Format: `id.secret` (e.g., `12345.abcde67890`)
- The app automatically fetches it via `/api/env-api-key` endpoint on load
- Fallback: Browser localStorage if env variable unavailable

### Setting API Key (Windows)

```cmd
# Command Prompt
set ZHIPU_API_KEY=your-api-key-here
python app_server.py

# PowerShell
$env:ZHIPU_API_KEY="your-api-key-here"
python app_server.py
```

## Architecture

### Frontend Architecture

**Pure HTML/CSS/JavaScript** with no build process:

1. **index.html** - Main UI with minimal, elegant design
   - Simplified layout without card panels or excess borders
   - Compact ganzhi display showing: "丙午年 丙寅月 己卯日 己巳时 2025年腊月初六 ✨ 今日小寒 ✨"

2. **style.css** (~1500 lines) - Comprehensive theming system:
   - **Four-season palettes** based on traditional Chinese color theory
   - **24 solar term specific colors** - each节气 has unique cultural color
   - **Traditional Chinese color spectrum** - 25+ traditional colors (胭脂, 古金, 碧玉, 徽墨, etc.)
   - **Flat, minimalist design** - removed shadows, borders, and card backgrounds

3. **app.js** (~700 lines) - Core logic with:
   - **ChineseCalendar class** - Centralized calendar calculations
   - **LogManager class** - localStorage-based logging
   - **FoodRecommendationApp class** - Main application controller

### Backend Architecture

**Python HTTP Servers** (no server-side rendering):

- **app_server.py** (recommended) - Unified server with environment variable support
- **server_with_env.py** - Fallback with environment variable support
- **start_server.py** - Simple HTTP server (Python 3)

### Prompt System

**External prompt templates** with placeholder substitution:

- `prompts/food_recommendation_prompt.txt` - Main diet recommendations (文言文 style)
- `prompts/tea_recommendation_prompt.txt` - Tea and herbal beverage recommendations (文言文 style)

**Placeholders**: `{date}`, `{time}`, `{mealPeriod}`, `{dietType}`, `{weather}`, `{solarTerm}`, `{season}`, `{location}`

## Key Technical Patterns

### 1. ChineseCalendar Class

Centralized calculation engine for all calendar functions:

```javascript
class ChineseCalendar {
    // Solar to lunar conversion (simplified algorithm)
    solarToLunar(solarDate)

    // Dynamic solar term calculation based on date
    getCurrentSolarTerm(date)

    // Ganzhi calculation (year, month, day, hour)
    calculateGanzhi(date, hours, minutes)
}
```

**Base date reference**:
- Lunar calendar: 2024-01-11 = 农历2023年十二月初一
- Ganzhi: 1900-01-01 = 甲戌日

### 2. Dynamic Solar Term Calculation

Instead of hardcoded date ranges, uses mathematical calculation:

```javascript
// Base: 2024-03-20 (春分)
// Each solar term ≈ 15.22 days
const termDays = 15.22;
const termIndex = Math.floor(diffDays / termDays);
```

### 3. Simplified UI Architecture

**Minimalist design** - no nested card panels:

```
天时地利 Section
├─ Ganzhi Display (plain colored bar, no container)
├─ Input Row (date, time, city, weather)
└─ Action Buttons
```

**CSS simplification**:
- `.section` has `background: transparent`, `border: none`, `box-shadow: none`
- `.ganzhi-display` is a simple colored bar with no shadows/borders
- Content takes precedence over decoration

### 4. 24-Solar Term Color System

Each节气 has a unique color based on cultural and natural symbolism:

**Spring**:
- 立春 #d4a574 (杏色) - Spring awakening
- 清明 #7fb069 (嫩绿) - Fresh growth
- 谷雨 #5da9e9 (湖蓝) - Rain nourishing crops

**Summer**:
- 夏至 #e74c3c (朱砂) - Peak yang energy
- 小暑 #e91e63 (荷粉) - Lotus blossoming
- 大暑 #c0392b (丹砂) - Extreme heat

**Autumn**:
- 秋分 #fa8c16 (杏黄) - Golden harvest
- 白露 #ecf0f1 (露白) - Morning dew (gray text)
- 霜降 #9b59b6 (紫霜) - Frost descent

**Winter**:
- 冬至 #2d3436 (墨黑) - Peak yin, yang begins
- 小寒 #5b8cff (黛蓝) - Deep winter cold
- 大寒 #34495e (深蓝灰) - Extreme cold

**Implementation**:
```javascript
// Sets data-solar-term attribute on body
body.setAttribute('data-solar-term', '小寒');

// CSS selector applies term-specific color
body[data-solar-term="小寒"] .ganzhi-display {
    background: #5b8cff;
}
```

### 5. City Selection Dropdown

**31 Chinese cities** available in dropdown:
- Auto-detection on page load via geolocation
- Attempts to match detected city to dropdown option
- Fallback to "北京" if no match

**Geolocation flow**:
1. Browser Geolocation API → coordinates
2. OpenStreetMap Nominatim → city name
3. Match to dropdown list → set selected option
4. IP-based fallback if geolocation fails

### 6. Model Fallback Strategy

Automatic degradation for reliability:

```javascript
const models = ['glm-4.7', 'glm-4.6', 'glm-4-flash'];
// Tries each model in sequence until success
```

**Critical Endpoint Details**:
```
URL: https://open.bigmodel.cn/api/anthropic/v1/messages
Headers: { 'x-api-key': apiKey }  // NOT Authorization: Bearer
Format: Anthropic-compatible (NOT OpenAI)
```

## File Structure

```
food/
├── index.html                      # Minimal UI, no card panels
├── style.css                       # ~1500 lines, 24 solar term colors
├── app.js                          # ~700 lines core logic
│   ├── ChineseCalendar class       # All calendar calculations
│   ├── LogManager class             # localStorage logging
│   └── FoodRecommendationApp       # Main app controller
├── prompts/
│   ├── food_recommendation_prompt.txt    # Diet recommendations
│   └── tea_recommendation_prompt.txt     # Tea/herbal recommendations
├── app_server.py                   # Unified server (recommended)
├── server_with_env.py              # Fallback server
├── start_server.py                 # Simple server
└── test_*.py                       # Test scripts
```

## Common Development Tasks

### Modifying Prompts

Edit prompt files in `prompts/` directory directly:

**Food Recommendations**: `prompts/food_recommendation_prompt.txt`
**Tea Recommendations**: `prompts/tea_recommendation_prompt.txt`

Keep prompts under 3000 characters. Must request JSON output with specific structure matching diet type.

### Changing Solar Term Colors

Edit in `style.css` around line 997+:

```css
/* 小寒 - 小寒时节,三九严寒 */
body[data-solar-term="小寒"] .ganzhi-display {
    background: #5b8cff; /* Change this color */
}
```

### Adjusting Ganzhi Display Format

Edit `updateGanzhiDisplay()` in `app.js` (line ~553):

```javascript
// Current format: "丙午年 丙寅月 己卯日 己巳时  2025年腊月初六  ✨ 今日小寒 ✨"
const ganzhiCompact = `${ganzhi.year} ${ganzhi.month} ${ganzhi.day} ${ganzhi.hour}`;
```

### Adding New Cities

Edit `index.html` around line 42-78, add new option:

```html
<option value="城市名">城市名</option>
```

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
- Geolocation matching results

## Key Technical Details

### Display Format

The ganzhi display shows all information in ONE line:
```
丙午年 丙寅月 己卯日 己巳时  2025年腊月初六  ✨ 今日小寒 ✨
```

Components:
- **Ganzhi**: 年月日时 (without redundant shichen/time display)
- **Lunar**:农历2025年腊月初六
- **Solar term indicator**: ✨ 今日XX ✨ (today), 📅 明日XX (tomorrow), 📅 昨日XX (yesterday), · XX (other days)

### Season Detection

```javascript
// Date ranges for seasons
Spring:  March 21 - May 20
Summer:  May 21 - August 22
Autumn:  August 23 - November 22
Winter:  November 23 - March 20
```

### Solar Term Detection

Dynamic calculation using base date (2024春分) and 15.22 days per term. NOT hardcoded ranges.

**Near-solar-term detection**: Today ±2 days triggers special UI effects (华丽节气主题).

### Lunar Calendar Calculation

Simplified algorithm with reference date:
- Base: 2024-01-11 = 农历2023年十二月初一
- Average 29.53 days per lunar month
- May have slight inaccuracies but suitable for dietary recommendations

## Known Issues

1. **GLM-4.7 Instability**: Sometimes returns empty content, auto-fallback to GLM-4.6 handles this
2. **Geolocation Matching**: May not match all cities perfectly, falls back to "北京"
3. **Lunar Calendar**: Simplified calculation, not astronomically precise
4. **Browser Caching**: Use Ctrl+Shift+R to force refresh after code changes

## Design Philosophy

### Minimalist Aesthetic

- **Flat design**: No shadows, no borders, no card panels
- **Content-first**: Information density over decoration
- **Breathing room**: Spacious layout with compact elements
- **Pure colors**: Solid backgrounds without gradients

### Chinese Cultural Integration

**Color symbolism**:
- Traditional pigments (胭脂红, 古金, 碧玉青, 徽墨)
- Seasonal colors reflect natural phenomena
- Solar term colors carry cultural meaning

**Classical terminology**:
- 黄历, 时辰, 天候, 天地 instead of modern equivalents
- 文言文 style in prompts referencing TCM classics
- Emphasis on "天人合一" (harmony between heaven and humanity)

## Testing

### Manual Testing

```bash
# Test API with full prompt
python test_glm47_prompt.py

# Test environment variable
python test_env_key.py
```

### Test Areas

1. **Solar term detection** - Try dates near each节气
2. **Season theming** - Try dates in each season
3. **City selection** - Test geolocation matching
4. **Prompt loading** - Verify both food and tea prompts
5. **API fallback** - Test with different GLM models

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Requires ES6+ support
- Requires Geolocation API
- Requires localStorage

No polyfills included - modern browsers only.
