// 日志管理器类
class LogManager {
    constructor() {
        this.logs = [];
        this.currentSessionId = this.generateSessionId();
    }

    // 生成会话ID
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 记录日志
    async log(eventType, data) {
        const logEntry = {
            sessionId: this.currentSessionId,
            timestamp: new Date().toISOString(),
            eventType: eventType,
            data: data
        };

        this.logs.push(logEntry);
        console.log(`[${eventType}]`, logEntry);

        // 将日志保存到本地存储
        await this.saveLog(logEntry);
    }

    // 保存日志到本地存储
    async saveLog(logEntry) {
        try {
            // 获取现有日志
            const existingLogs = JSON.parse(localStorage.getItem('foodAppLogs') || '[]');
            existingLogs.push(logEntry);

            // 限制日志数量，只保留最近100条
            if (existingLogs.length > 100) {
                existingLogs.splice(0, existingLogs.length - 100);
            }

            // 保存到localStorage
            localStorage.setItem('foodAppLogs', JSON.stringify(existingLogs));

            // 同时尝试保存到服务器（如果后端可用）
            await this.sendLogToServer(logEntry);
        } catch (error) {
            console.error('保存日志失败:', error);
        }
    }

    // 发送日志到服务器
    async sendLogToServer(logEntry) {
        // 如果有后端日志服务，可以在这里实现
        // 目前只记录到localStorage
        try {
            // 示例：发送到后端API
            // await fetch('/api/logs', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(logEntry)
            // });
        } catch (error) {
            // 忽略服务器日志错误
        }
    }

    // 导出日志
    exportLogs() {
        const logs = JSON.parse(localStorage.getItem('foodAppLogs') || '[]');
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `food_app_logs_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // 获取所有日志
    getLogs() {
        return JSON.parse(localStorage.getItem('foodAppLogs') || '[]');
    }

    // 清空日志
    clearLogs() {
        localStorage.removeItem('foodAppLogs');
        this.logs = [];
    }
}

// 养生饮食推荐应用 - 主程序

class FoodRecommendationApp {
    constructor() {
        this.currentLocation = null;
        this.currentWeather = '晴';
        this.solarTerms = this.getSolarTerms();
        this.nutritionChart = null;
        this.logger = new LogManager();

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.autoSetDateTime();
        this.detectAndSetSeason();
        this.updateSolarTermDisplay();
        this.loadApiKeyFromEnv();
    }

    // 设置事件监听器
    setupEventListeners() {
        // 自动获取时间按钮
        document.getElementById('autoTimeBtn').addEventListener('click', () => {
            this.autoSetDateTime();
            this.updateSolarTermDisplay();
        });

        // 自动获取位置按钮（已移除位置功能）
        document.getElementById('autoLocationBtn').addEventListener('click', () => {
            this.autoGetLocation();
        });

        // 日期变化时更新节气显示
        document.getElementById('dateInput').addEventListener('change', () => {
            this.updateSolarTermDisplay();
            this.detectAndSetSeason();
        });

        // 生成推荐按钮
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateRecommendation();
        });
    }

    // 从环境变量加载API Key（通过后端代理）
    async loadApiKeyFromEnv() {
        try {
            // 尝试从后端获取环境变量中的API Key
            const response = await fetch('/api/env-api-key');
            if (response.ok) {
                const data = await response.json();
                if (data.apiKey) {
                    localStorage.setItem('ZHIPU_API_KEY', data.apiKey);
                    console.log('✅ API Key已从环境变量加载');
                    return;
                }
            }
        } catch (error) {
            // 后端接口不存在或不可用，忽略
            console.log('ℹ️ 未检测到后端API Key服务，将使用浏览器存储');
        }
    }

    // 自动设置当前日期时间
    autoSetDateTime() {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;

        document.getElementById('dateInput').value = dateStr;
        document.getElementById('timeInput').value = timeStr;

        // 根据时间自动设置早中晚
        this.autoSetMealPeriod(hours);

        // 更新季节背景
        this.detectAndSetSeason();

        // 更新天干地支和节气显示
        this.updateSolarTermDisplay();
    }

    // 根据时间自动设置早中晚
    autoSetMealPeriod(hours) {
        const mealPeriod = parseInt(hours);
        let period;

        if (mealPeriod >= 5 && mealPeriod < 9) {
            period = '早餐';
        } else if (mealPeriod >= 11 && mealPeriod < 14) {
            period = '午餐';
        } else if (mealPeriod >= 17 && mealPeriod < 20) {
            period = '晚餐';
        } else {
            // 默认设置为午餐
            period = '午餐';
        }

        document.querySelector(`input[name="mealPeriod"][value="${period}"]`).checked = true;
    }

    // 自动获取位置信息
    async autoGetLocation() {
        const locationInput = document.getElementById('locationInput');

        if (!navigator.geolocation) {
            locationInput.value = '浏览器不支持定位';
            return;
        }

        locationInput.value = '正在定位...';

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                this.currentLocation = { lat: latitude, lng: longitude };

                // 使用逆地理编码获取城市名
                const location = await this.reverseGeocode(latitude, longitude);
                locationInput.value = location.city || location.address || '未知位置';

                console.log('定位成功:', location);
            },
            async (error) => {
                console.error('获取位置失败:', error);

                // 使用IP定位作为备选方案
                locationInput.value = '使用IP定位...';
                const location = await this.getLocationByIP();
                if (location) {
                    locationInput.value = location;
                } else {
                    locationInput.value = '';
                    locationInput.placeholder = '定位失败，请输入地名';
                }
            }
        );
    }

    // 通过IP获取位置信息（备选方案）
    async getLocationByIP() {
        try {
            // 使用免费的IP定位API
            const response = await fetch('https://ipapi.co/json/');
            if (response.ok) {
                const data = await response.json();
                console.log('IP定位结果:', data);
                // 优先显示城市，如果没有则显示地区或国家
                return data.city || data.region || data.country_name || '未知位置';
            } else {
                console.error('IP定位API响应错误:', response.status);
            }
        } catch (error) {
            console.error('IP定位失败:', error);
        }
        return null;
    }

    // 逆地理编码 - 使用Nominatim（OpenStreetMap的免费服务）
    async reverseGeocode(lat, lng) {
        try {
            // 使用Nominatim逆地理编码API（免费，无需API Key）
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=zh-CN`
            );

            if (!response.ok) {
                throw new Error('地理编码请求失败');
            }

            const data = await response.json();
            if (data && data.address) {
                const address = data.address;
                // 优先返回城市，如果没有城市则返回省份或区
                const city = address.city || address.town || address.county || address.province || '未知位置';
                return {
                    city: city,
                    address: data.display_name.split(',')[0] // 使用地址的第一部分
                };
            }

            return { city: '未知城市', address: '' };
        } catch (error) {
            console.error('逆地理编码失败:', error);
            // 返回默认城市
            return { city: '位置获取失败', address: '' };
        }
    }

    // 获取天气信息（使用Open-Meteo免费API）
    async getWeather(lat, lng) {
        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
            );

            if (!response.ok) {
                throw new Error('天气请求失败');
            }

            const data = await response.json();
            if (data.current_weather) {
                const weatherCode = data.current_weather.weathercode;
                const weatherDescription = this.getWeatherDescription(weatherCode);

                // 更新天气选择框
                document.getElementById('weatherSelect').value = weatherDescription;
                this.currentWeather = weatherDescription;
            }
        } catch (error) {
            console.error('获取天气失败:', error);
            // 保持默认天气：晴
        }
    }

    // 天气代码转换为中文描述（Open-Meteo WMO代码）
    getWeatherDescription(code) {
        const weatherMap = {
            0: '晴',
            1: '晴',
            2: '多云',
            3: '阴',
            45: '雾',
            48: '雾',
            51: '雨',
            53: '雨',
            55: '雨',
            61: '雨',
            63: '雨',
            65: '雨',
            71: '雪',
            73: '雪',
            75: '雪',
            77: '雪',
            80: '雨',
            81: '雨',
            82: '雨',
            85: '雪',
            86: '雪',
            95: '大风',
            96: '大风',
            99: '大风'
        };
        return weatherMap[code] || '晴';
    }

    // 检测并设置季节主题
    detectAndSetSeason() {
        const dateInput = document.getElementById('dateInput').value;
        if (!dateInput) return;

        const date = new Date(dateInput);
        const month = date.getMonth() + 1; // 1-12
        const day = date.getDate();

        let season = 'spring';
        if ((month === 3 && day >= 21) || (month === 4) || (month === 5 && day <= 20)) {
            season = 'spring';
        } else if ((month === 5 && day >= 21) || (month === 6) || (month === 7) || (month === 8 && day <= 22)) {
            season = 'summer';
        } else if ((month === 8 && day >= 23) || (month === 9) || (month === 10) || (month === 11 && day <= 22)) {
            season = 'autumn';
        } else {
            season = 'winter';
        }

        document.body.className = season;
    }

    // 更新节气显示
    updateSolarTermDisplay() {
        const dateInput = document.getElementById('dateInput').value;
        const timeInput = document.getElementById('timeInput').value;
        if (!dateInput) return;

        const date = new Date(dateInput);
        const [hours, minutes] = timeInput.split(':').map(Number);

        // 更新天干地支显示
        this.updateGanzhiDisplay(date, hours, minutes);

        // 更新节气提醒显示
        this.updateSolarTermAlert(date);
    }

    // 计算并显示天干地支
    updateGanzhiDisplay(date, hours, minutes) {
        const ganzhi = this.calculateGanzhi(date, hours, minutes);
        const displayElement = document.getElementById('ganzhiDisplay');
        if (displayElement) {
            displayElement.textContent = ganzhi;
        }
    }

    // 计算天干地支
    calculateGanzhi(date, hours, minutes) {
        // 天干
        const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        // 地支
        const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

        // 生肖
        const zodiacAnimals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

        // 计算年干支（以立春为界）
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        // 简化处理：1月、2月按上一年算
        let lunarYear = year;
        if (month === 1 || (month === 2 && day < 4)) {
            lunarYear = year - 1;
        }

        const yearStemIndex = (lunarYear - 4) % 10;
        const yearBranchIndex = (lunarYear - 4) % 12;

        // 计算月干支（简化版）
        const monthStemIndex = ((lunarYear % 10) * 2 + (month - 1) % 12) % 10;
        const monthBranchIndex = (month + 1) % 12;

        // 计算日干支（基准日1900年1月1日是甲戌日）
        const baseDate = new Date(1900, 0, 1);
        const daysDiff = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));
        const dayStemIndex = (0 + daysDiff) % 10;
        const dayBranchIndex = (10 + daysDiff) % 12;

        // 计算时干支
        const hourBranchIndex = Math.floor((hours + 1) / 2) % 12;
        const hourStemIndex = (dayStemIndex * 2 + Math.floor((hours + 1) / 2)) % 10;

        // 时辰名称
        const shichenNames = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时',
                              '午时', '未时', '申时', '酉时', '戌时', '亥时'];
        const hourIndex = Math.floor((hours + 1) / 2) % 12;
        const shichen = shichenNames[hourIndex];

        return `${heavenlyStems[yearStemIndex]}${earthlyBranches[yearBranchIndex]}年 ` +
               `${heavenlyStems[monthStemIndex]}${earthlyBranches[monthBranchIndex]}月 ` +
               `${heavenlyStems[dayStemIndex]}${earthlyBranches[dayBranchIndex]}日 ` +
               `${heavenlyStems[hourStemIndex]}${earthlyBranches[hourBranchIndex]}时 ` +
               `(${shichen} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')})`;
    }

    // 更新节气提醒
    updateSolarTermAlert(date) {
        const today = new Date(date);
        const tomorrow = new Date(date);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yesterday = new Date(date);
        yesterday.setDate(yesterday.getDate() - 1);

        const todayTerm = this.getSolarTermForDate(today);
        const tomorrowTerm = this.getSolarTermForDate(tomorrow);
        const yesterdayTerm = this.getSolarTermForDate(yesterday);

        const alertElement = document.getElementById('solarTermAlert');

        if (alertElement) {
            alertElement.className = 'solar-term-alert'; // 重置类名

            if (todayTerm) {
                // 今天是节气
                alertElement.textContent = `✨ 今日${todayTerm.name} ✨`;
                alertElement.classList.add('today');
            } else if (tomorrowTerm) {
                // 明天是节气
                alertElement.textContent = `📅 明日${tomorrowTerm.name}`;
                alertElement.classList.add('upcoming');
            } else if (yesterdayTerm) {
                // 昨天是节气
                alertElement.textContent = `📅 昨日${yesterdayTerm.name}`;
                alertElement.classList.add('upcoming');
            } else {
                // 显示当前节气
                const currentTerm = this.getCurrentSolarTerm(date);
                const season = this.getSeason(date);
                const seasonName = this.getSeasonName(season);
                alertElement.textContent = `${currentTerm.name} (${seasonName})`;
            }
        }
    }

    // 获取指定日期的节气（如果在节气期间返回节气对象，否则返回null）
    getSolarTermForDate(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();

        for (const term of this.solarTerms) {
            if (term.month === month && day >= term.dayRange[0] && day <= term.dayRange[1]) {
                return term;
            }
        }
        return null;
    }

    // 获取节气信息
    getSolarTerms() {
        // 24节气数据（简化版本，使用近似日期）
        return [
            { name: '立春', month: 2, dayRange: [3, 5], season: 'spring' },
            { name: '雨水', month: 2, dayRange: [18, 20], season: 'spring' },
            { name: '惊蛰', month: 3, dayRange: [5, 7], season: 'spring' },
            { name: '春分', month: 3, dayRange: [20, 22], season: 'spring' },
            { name: '清明', month: 4, dayRange: [4, 6], season: 'spring' },
            { name: '谷雨', month: 4, dayRange: [19, 21], season: 'spring' },
            { name: '立夏', month: 5, dayRange: [5, 7], season: 'summer' },
            { name: '小满', month: 5, dayRange: [20, 22], season: 'summer' },
            { name: '芒种', month: 6, dayRange: [5, 7], season: 'summer' },
            { name: '夏至', month: 6, dayRange: [21, 22], season: 'summer' },
            { name: '小暑', month: 7, dayRange: [6, 8], season: 'summer' },
            { name: '大暑', month: 7, dayRange: [22, 24], season: 'summer' },
            { name: '立秋', month: 8, dayRange: [7, 9], season: 'autumn' },
            { name: '处暑', month: 8, dayRange: [22, 24], season: 'autumn' },
            { name: '白露', month: 9, dayRange: [7, 9], season: 'autumn' },
            { name: '秋分', month: 9, dayRange: [22, 24], season: 'autumn' },
            { name: '寒露', month: 10, dayRange: [8, 10], season: 'autumn' },
            { name: '霜降', month: 10, dayRange: [23, 25], season: 'autumn' },
            { name: '立冬', month: 11, dayRange: [7, 8], season: 'winter' },
            { name: '小雪', month: 11, dayRange: [22, 23], season: 'winter' },
            { name: '大雪', month: 12, dayRange: [6, 8], season: 'winter' },
            { name: '冬至', month: 12, dayRange: [21, 23], season: 'winter' },
            { name: '小寒', month: 1, dayRange: [5, 7], season: 'winter' },
            { name: '大寒', month: 1, dayRange: [19, 21], season: 'winter' }
        ];
    }

    // 判断当天是哪个节气
    getCurrentSolarTerm(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();

        for (const term of this.solarTerms) {
            if (term.month === month && day >= term.dayRange[0] && day <= term.dayRange[1]) {
                return term;
            }
        }

        // 如果不在节气期间，返回当前季节
        const season = this.getSeason(date);
        return { name: this.getSeasonName(season), season: season };
    }

    // 获取季节
    getSeason(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();

        if ((month === 3 && day >= 21) || (month === 4) || (month === 5 && day <= 20)) {
            return 'spring';
        } else if ((month === 5 && day >= 21) || (month === 6) || (month === 7) || (month === 8 && day <= 22)) {
            return 'summer';
        } else if ((month === 8 && day >= 23) || (month === 9) || (month === 10) || (month === 11 && day <= 22)) {
            return 'autumn';
        } else {
            return 'winter';
        }
    }

    // 获取季节名称
    getSeasonName(season) {
        const names = {
            spring: '春季',
            summer: '夏季',
            autumn: '秋季',
            winter: '冬季'
        };
        return names[season] || '春季';
    }

    // 生成饮食推荐
    async generateRecommendation() {
        console.log('=== 开始生成推荐 ===');

        const generateBtn = document.getElementById('generateBtn');
        const resultSection = document.getElementById('resultSection');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const recommendationContent = document.getElementById('recommendationContent');

        // 立即禁用按钮并显示加载状态
        generateBtn.disabled = true;
        generateBtn.innerHTML = '⏳ 正在生成...';
        generateBtn.style.opacity = '0.7';

        // 显示结果区域
        resultSection.style.display = 'block';

        // 滚动到结果区域
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // 显示加载动画,包含模型信息
        loadingSpinner.style.display = 'block';
        loadingSpinner.innerHTML = `
            <div class="spinner"></div>
            <p class="loading-text">🤖 正在调用AI模型生成推荐...</p>
            <p class="loading-subtext">尝试模型: GLM-4.7 → GLM-4.6 → GLM-4-Flash</p>
            <p class="loading-hint">⏰ 预计需要10-30秒，请耐心等待</p>
        `;
        recommendationContent.innerHTML = '';
        document.getElementById('nutritionCard').style.display = 'none';

        // 获取用户输入
        const dateInput = document.getElementById('dateInput').value;
        const timeInput = document.getElementById('timeInput').value;
        const mealPeriod = document.querySelector('input[name="mealPeriod"]:checked').value;
        const dietType = document.querySelector('input[name="dietType"]:checked').value;
        const weather = document.getElementById('weatherSelect').value;

        console.log('用户输入:', { dateInput, timeInput, mealPeriod, dietType, weather });

        // 解析日期
        const date = new Date(dateInput);
        const solarTerm = this.getCurrentSolarTerm(date);
        const season = this.getSeason(date);

        console.log('节气信息:', { solarTerm: solarTerm.name, season: this.getSeasonName(season) });

        try {
            // 调用API生成推荐 (自动降级: 4.7 -> 4.6 -> flash)
            const recommendation = await this.callGLMAPIWithFallback({
                date: dateInput,
                time: timeInput,
                mealPeriod: mealPeriod,
                dietType: dietType,
                weather: weather,
                solarTerm: solarTerm.name,
                season: this.getSeasonName(season)
            });

            console.log('API调用成功,返回推荐:', recommendation);

            // 隐藏加载动画
            loadingSpinner.style.display = 'none';

            // 恢复按钮状态
            generateBtn.disabled = false;
            generateBtn.innerHTML = '🌟 饮食推荐';
            generateBtn.style.opacity = '1';

            // 显示推荐结果
            this.displayRecommendation(recommendation);

        } catch (error) {
            console.error('生成推荐失败:', error);

            // 隐藏加载动画
            loadingSpinner.style.display = 'none';

            // 恢复按钮状态
            generateBtn.disabled = false;
            generateBtn.innerHTML = '🌟 饮食推荐';
            generateBtn.style.opacity = '1';

            recommendationContent.innerHTML = `
                <div class="error-message">
                    ❌ 生成推荐失败: ${error.message}
                </div>
            `;
        }
    }

    // 带自动降级的API调用
    async callGLMAPIWithFallback(params) {
        const models = ['glm-4.7', 'glm-4.6', 'glm-4-flash'];

        for (let i = 0; i < models.length; i++) {
            const model = models[i];
            console.log(`尝试使用模型: ${model} (${i + 1}/${models.length})`);

            try {
                const result = await this.callGLMAPI({ ...params, model });
                console.log(`✅ 模型 ${model} 调用成功`);
                return result;
            } catch (error) {
                console.error(`❌ 模型 ${model} 调用失败:`, error.message);

                if (i < models.length - 1) {
                    console.log(`⏳ 自动降级到下一个模型: ${models[i + 1]}`);
                } else {
                    throw new Error(`所有模型都失败了。最后错误: ${error.message}`);
                }
            }
        }
    }

    // 调用GLM API
    async callGLMAPI(params) {
        console.log('callGLMAPI开始,参数:', params);

        // 从系统变量获取API Key
        const apiKey = await this.getApiKey();
        console.log('获取到的API Key长度:', apiKey ? apiKey.length : 0);

        if (!apiKey) {
            throw new Error('未找到API Key，请设置系统变量 ZHIPU_API_KEY');
        }

        // 获取模型
        const model = params.model || 'glm-4-flash';
        console.log('使用模型:', model);

        // 构建提示词
        console.log('开始构建prompt...');
        const prompt = await this.buildPrompt(params);
        console.log('Prompt构建完成,长度:', prompt.length);
        console.log('Prompt前200字符:', prompt.substring(0, 200));

        try {
            console.log(`发送API请求到${model}...`);

            // 创建超时控制器
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120000); // 120秒超时

            const response = await fetch('https://open.bigmodel.cn/api/anthropic/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 4096
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            console.log('API响应状态:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API错误响应:', errorData);
                throw new Error(errorData.error?.message || 'API请求失败');
            }

            const data = await response.json();
            console.log('API返回数据:', data);

            // Anthropic格式: data.content[0].text
            // OpenAI格式: data.choices[0].message.content
            const content = data.content?.[0]?.text || data.choices?.[0]?.message?.content || '';
            console.log('返回内容长度:', content.length);
            console.log('返回内容预览:', content.substring(0, 300));

            // 检查content是否为空
            if (!content || content.trim().length === 0) {
                console.error('⚠️ API返回空内容!');
                console.error('完整响应:', JSON.stringify(data, null, 2));
                throw new Error('GLM-4.7返回空内容,请尝试使用glm-4-flash或glm-4.6');
            }

            // 解析返回的内容（期望JSON格式）
            return this.parseRecommendation(content);

        } catch (error) {
            console.error('API调用失败:', error);
            throw error;
        }
    }

    // 获取API Key（优先从环境变量）
    async getApiKey() {
        // 优先从后端API获取环境变量中的API Key
        try {
            const response = await fetch('/api/env-api-key');
            if (response.ok) {
                const data = await response.json();
                if (data.apiKey) {
                    console.log('✅ 从环境变量成功读取API Key');
                    return data.apiKey;
                }
            }
        } catch (error) {
            console.log('ℹ️ 后端API不可用，尝试其他方式');
        }

        // 如果后端不可用，尝试从localStorage获取（之前保存的）
        let apiKey = localStorage.getItem('ZHIPU_API_KEY');
        if (apiKey) {
            console.log('✅ 从localStorage读取API Key');
            return apiKey;
        }

        // 如果都没有，提示用户输入
        console.log('⚠️ 未找到API Key，提示用户输入');
        apiKey = prompt('请输入您的智谱AI API Key (ZHIPU_API_KEY):');
        if (apiKey) {
            localStorage.setItem('ZHIPU_API_KEY', apiKey);
            console.log('✅ API Key已保存到localStorage');
        }

        return apiKey;
    }

    // 构建提示词（从prompts文件夹读取）
    async buildPrompt(params) {
        try {
            // 从prompts文件夹读取提示词模板
            const promptTemplate = await this.fetchPromptTemplate();
            const { date, time, mealPeriod, dietType, weather, solarTerm, season } = params;

            // 替换模板中的占位符
            let prompt = promptTemplate
                .replace(/{date}/g, date)
                .replace(/{time}/g, time)
                .replace(/{mealPeriod}/g, mealPeriod)
                .replace(/{dietType}/g, dietType)
                .replace(/{weather}/g, weather)
                .replace(/{solarTerm}/g, solarTerm)
                .replace(/{season}/g, season);

            return prompt;
        } catch (error) {
            console.error('构建提示词失败:', error);
            // 如果读取失败，返回简化版提示词
            return this.buildFallbackPrompt(params);
        }
    }

    // 从文件读取提示词模板
    async fetchPromptTemplate() {
        try {
            const response = await fetch('prompts/food_recommendation_prompt.txt');
            if (!response.ok) {
                throw new Error('读取提示词文件失败');
            }
            return await response.text();
        } catch (error) {
            console.error('读取提示词模板失败，使用默认提示词:', error);
            throw error;
        }
    }

    // 备用简化提示词
    buildFallbackPrompt(params) {
        const { date, time, mealPeriod, dietType, weather, solarTerm, season } = params;
        return `请根据以下信息推荐${mealPeriod}的饮食方案：
日期:${date}, 时间:${time}, 饮食类型:${dietType}, 天气:${weather}, 节气:${solarTerm}, 季节:${season}
请严格按照JSON格式输出，包含菜品、营养分析和建议。`;
    }

    // 解析推荐结果（增强容错性）
    parseRecommendation(content) {
        try {
            console.log('开始解析AI返回内容...');
            console.log('原始内容长度:', content.length);

            // 尝试提取JSON部分
            let jsonStr = content;

            // 方法1: 提取```json```代码块
            const jsonStart = content.indexOf('```json');
            const jsonEnd = content.lastIndexOf('```');
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                jsonStr = content.substring(jsonStart + 7, jsonEnd);
                console.log('使用代码块提取方法');
            }
            // 方法2: 提取第一个{和最后一个}之间的内容
            else if (content.includes('{')) {
                const firstBrace = content.indexOf('{');
                const lastBrace = content.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    jsonStr = content.substring(firstBrace, lastBrace + 1);
                    console.log('使用大括号提取方法');
                }
            }

            console.log('提取的JSON字符串长度:', jsonStr.length);
            console.log('JSON预览:', jsonStr.substring(0, 100) + '...');

            // 解析JSON
            const recommendation = JSON.parse(jsonStr.trim());

            // 验证数据完整性
            if (!recommendation.dishes || !Array.isArray(recommendation.dishes)) {
                throw new Error('缺少dishes字段');
            }

            console.log('✅ JSON解析成功，菜品数量:', recommendation.dishes.length);
            return recommendation;

        } catch (error) {
            console.error('❌ 解析推荐结果失败:', error);
            console.log('原始内容:', content);

            // 如果解析失败，尝试从文本中提取信息
            return this.extractFromText(content);
        }
    }

    // 从文本中提取信息（备用方案）
    extractFromText(content) {
        console.log('尝试从文本中提取信息...');

        // 简单的文本提取逻辑
        const lines = content.split('\n');
        const dishes = [];
        let currentDish = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // 查找菜品名称（通常在行首或包含"推荐"等词）
            if (line.includes('菜品') || line.includes('推荐') || line.match(/^\d+[\.\、]/)) {
                if (currentDish) {
                    dishes.push(currentDish);
                }
                currentDish = {
                    name: line.replace(/^\d+[\.\、]\s*/, '').trim(),
                    ingredients: ['详见AI回复'],
                    nutrition: '营养丰富，符合季节特点',
                    recipe: ['请参考AI返回的详细制作方法']
                };
            }
        }

        if (currentDish) {
            dishes.push(currentDish);
        }

        // 如果还是提取失败，返回一个默认结构
        if (dishes.length === 0) {
            return {
                dishes: [
                    {
                        name: 'AI返回内容解析失败',
                        ingredients: ['请稍后重试'],
                        nutrition: '可能是AI返回格式问题',
                        recipe: ['请重新生成', '或查看浏览器控制台的完整返回内容']
                    }
                ],
                totalNutrition: {
                    calories: 0,
                    protein: 0,
                    fat: 0,
                    carbs: 0,
                    vitamins: [],
                    minerals: [],
                    summary: '数据解析失败。提示：请查看浏览器控制台(F12)获取完整的AI返回内容'
                }
            };
        }

        return {
            dishes: dishes,
            totalNutrition: {
                calories: 500,
                protein: 30,
                fat: 20,
                carbs: 60,
                vitamins: ['VA', 'VC', 'VE'],
                minerals: ['钙', '铁'],
                summary: '营养均衡，符合季节特点'
            }
        };
    }

    // 显示推荐结果
    displayRecommendation(recommendation) {
        const recommendationContent = document.getElementById('recommendationContent');

        // 生成精美的菜品卡片
        let dishesHtml = '<div class="dish-grid">';

        if (recommendation.dishes && recommendation.dishes.length > 0) {
            recommendation.dishes.forEach((dish, index) => {
                // 获取菜品类型emoji和雅致称谓
                const typeInfo = {
                    '汤品': { emoji: '🍲', name: '羹汤', label: '汤' },
                    '主食': { emoji: '🍚', name: '五谷', label: '饭' },
                    '热菜': { emoji: '🥘', name: '佳肴', label: '菜' },
                    '凉菜': { emoji: '🥗', name: '凉碟', label: '凉' },
                    '甜品': { emoji: '🍮', name: '甜点', label: '点' },
                    '药膳': { emoji: '🏮', name: '药膳', label: '方' }
                };
                const typeData = typeInfo[dish.type] || { emoji: '🍽️', name: '珍馐', label: '馔' };

                // 简化食材显示
                let ingredientsText = '';
                if (Array.isArray(dish.ingredients)) {
                    if (typeof dish.ingredients[0] === 'object') {
                        ingredientsText = dish.ingredients.map(ing => ing.item).join('、');
                    } else {
                        ingredientsText = dish.ingredients.join('、');
                    }
                }

                // 简化营养信息 - 使用雅致表述
                let nutritionBadge = '';
                if (typeof dish.nutrition === 'object') {
                    nutritionBadge = `<span class="nutrition-badge">🔥 ${dish.nutrition.calories}大卡</span>`;
                }

                // 生成菜品类型对应的渐变背景色
                const gradientColors = this.getTypeGradient(dish.type);

                dishesHtml += `
                    <div class="dish-card">
                        <div class="dish-main">
                            <div class="dish-header">
                                <span class="dish-emoji">${typeData.emoji}</span>
                                <div class="dish-title-group">
                                    <h3 class="dish-name">${dish.name}</h3>
                                    <span class="dish-type-badge-small">${typeData.name}</span>
                                </div>
                            </div>

                            <div class="dish-body">
                                <div class="dish-ingredients">
                                    <p class="label">🥘 食材</p>
                                    <p class="value">${ingredientsText}</p>
                                </div>

                            ${nutritionBadge ? `
                            <div class="dish-nutrition">
                                ${nutritionBadge}
                            </div>
                            ` : ''}

                            ${dish.suitable ? `
                            <div class="dish-suitable">
                                <p class="label">👥 宜食</p>
                                <p class="value">${dish.suitable}</p>
                            </div>
                            ` : ''}
                            </div>

                            <button class="toggle-recipe" onclick="app.toggleRecipe(${index})">
                                📜 查看制法
                            </button>

                            <div class="recipe-content" id="recipe-${index}" style="display: none;">
                                <div class="recipe-steps">
                                    ${Array.isArray(dish.recipe) ? dish.recipe.map((step, i) =>
                                        `<div class="recipe-step"><span class="step-num">${['壹','贰','叁','肆','伍','陆','柒','捌','玖','拾'][i]}</span>${step}</div>`
                                    ).join('') : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        dishesHtml += '</div>';

        // 添加推荐理由 - 使用雅致标题
        if (recommendation.reasoning) {
            dishesHtml += `
                <div class="reasoning-card">
                    <h3 class="card-title">📜 推荐缘由</h3>
                    <div class="reasoning-content">
                        ${recommendation.reasoning.solarTerm ? `
                        <div class="reason-item">
                            <span class="reason-icon">🌸</span>
                            <div>
                                <p class="reason-label">节气养生</p>
                                <p class="reason-text">${recommendation.reasoning.solarTerm}</p>
                            </div>
                        </div>
                        ` : ''}
                        ${recommendation.reasoning.season ? `
                        <div class="reason-item">
                            <span class="reason-icon">🍂</span>
                            <div>
                                <p class="reason-label">四时调养</p>
                                <p class="reason-text">${recommendation.reasoning.season}</p>
                            </div>
                        </div>
                        ` : ''}
                        ${recommendation.reasoning.weather ? `
                        <div class="reason-item">
                            <span class="reason-icon">🌤️</span>
                            <div>
                                <p class="reason-label">天时调摄</p>
                                <p class="reason-text">${recommendation.reasoning.weather}</p>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        // 添加温馨提示 - 使用雅致标题
        if (recommendation.tips) {
            dishesHtml += `
                <div class="tips-card">
                    <h3 class="card-title">💊 养生要诀</h3>
                    <div class="tips-grid">
                        ${recommendation.tips.shopping ? `
                        <div class="tip-item">
                            <span class="tip-icon">🛒</span>
                            <p>${recommendation.tips.shopping}</p>
                        </div>
                        ` : ''}
                        ${recommendation.tips.cooking ? `
                        <div class="tip-item">
                            <span class="tip-icon">🍳</span>
                            <p>${recommendation.tips.cooking}</p>
                        </div>
                        ` : ''}
                        ${recommendation.tips.pairing ? `
                        <div class="tip-item">
                            <span class="tip-icon">🍵</span>
                            <p>${recommendation.tips.pairing}</p>
                        </div>
                        ` : ''}
                        ${recommendation.tips.taboo ? `
                        <div class="tip-item">
                            <span class="tip-icon">⚠️</span>
                            <p>${recommendation.tips.taboo}</p>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        recommendationContent.innerHTML = dishesHtml;

        // 显示营养分析
        this.displayNutritionChart(recommendation.totalNutrition);
    }

    // 根据菜名生成搜索关键词
    // 根据菜品类型获取渐变背景色 - 雅致中国风配色
    getTypeGradient(dishType) {
        const gradients = {
            '汤品': 'linear-gradient(135deg, #b71c1c 0%, #d81b60 100%)',    /* 胭脂红到胭脂 */
            '主食': 'linear-gradient(135deg, #cfb53b 0%, #fbc02d 100%)',    /* 古金到金黄 */
            '热菜': 'linear-gradient(135deg, #c2185b 0%, #e91e63 100%)',    /* 海棠红到梅红 */
            '凉菜': 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',    /* 碧玉到翠绿 */
            '甜品': 'linear-gradient(135deg, #6a1b9a 0%, #8e24aa 100%)',    /* 紫藤到紫萝兰 */
            '药膳': 'linear-gradient(135deg, #8d6e63 0%, #a1887f 100%)',    /* 茶褐到浅褐 */
            '汤': 'linear-gradient(135deg, #b71c1c 0%, #d81b60 100%)',
            '饭': 'linear-gradient(135deg, #cfb53b 0%, #fbc02d 100%)',
            '菜': 'linear-gradient(135deg, #c2185b 0%, #e91e63 100%)',
            '凉': 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',
            '点': 'linear-gradient(135deg, #6a1b9a 0%, #8e24aa 100%)',
            '方': 'linear-gradient(135deg, #8d6e63 0%, #a1887f 100%)'
        };
        return gradients[dishType] || 'linear-gradient(135deg, #006064 0%, #0097a7 100%)'; /* 默认黛蓝色 */
    }

    getFoodKeywords(dishName, dishType) {
        // 提取菜名中的关键词
        const keywords = [];

        // 根据菜品类型添加关键词
        const typeKeywords = {
            '汤品': 'soup',
            '主食': 'rice,noodles',
            '热菜': 'stir-fry',
            '凉菜': 'salad',
            '甜品': 'dessert'
        };

        if (dishType && typeKeywords[dishType]) {
            keywords.push(typeKeywords[dishType]);
        }

        // 从菜名中提取关键词
        const nameLower = dishName.toLowerCase();

        // 常见食材关键词
        const foodItems = {
            '鸡': 'chicken',
            '鸭': 'duck',
            '鱼': 'fish',
            '虾': 'shrimp',
            '牛': 'beef',
            '羊': 'lamb',
            '猪肉': 'pork',
            '蛋': 'egg',
            '豆腐': 'tofu',
            '青菜': 'vegetables',
            '萝卜': 'radish',
            '冬瓜': 'winter melon',
            '南瓜': 'pumpkin',
            '土豆': 'potato',
            '西红柿': 'tomato',
            '黄瓜': 'cucumber',
            '茄子': 'eggplant',
            '辣椒': 'pepper',
            '蘑菇': 'mushroom',
            '木耳': 'fungus',
            '莲藕': 'lotus root',
            '菠菜': 'spinach',
            '白菜': 'cabbage',
            '韭菜': 'chives',
            '芹菜': 'celery',
            '山药': 'yam',
            '粥': 'porridge',
            '面': 'noodles',
            '饭': 'rice'
        };

        for (const [chinese, english] of Object.entries(foodItems)) {
            if (dishName.includes(chinese)) {
                keywords.push(english);
            }
        }

        // 如果没有找到特定关键词,使用通用词
        if (keywords.length === 0) {
            keywords.push('chinese food', 'asian food');
        }

        // 限制关键词数量
        return keywords.slice(0, 3).join(',');
    }

    // 切换制作方法显示
    toggleRecipe(index) {
        const recipeContent = document.getElementById(`recipe-${index}`);
        const button = recipeContent.previousElementSibling;

        if (recipeContent.style.display === 'none') {
            recipeContent.style.display = 'block';
            button.textContent = '🔼 收起制法';
        } else {
            recipeContent.style.display = 'none';
            button.textContent = '📜 查看制法';
        }
    }

    // 显示营养分析图表
    displayNutritionChart(nutrition) {
        const nutritionCard = document.getElementById('nutritionCard');
        const nutritionContent = document.getElementById('nutritionContent');

        nutritionCard.style.display = 'block';

        // 处理新旧格式的营养数据
        let proteinAmount, fatAmount, carbsAmount, proteinPct, fatPct, carbsPct;
        let vitaminsList = [], mineralsList = [];
        let summaryText = '';

        if (typeof nutrition.protein === 'object') {
            // 新格式
            proteinAmount = nutrition.protein.amount;
            proteinPct = nutrition.protein.percentage;
            fatAmount = nutrition.fat.amount;
            fatPct = nutrition.fat.percentage;
            carbsAmount = nutrition.carbs.amount;
            carbsPct = nutrition.carbs.percentage;

            vitaminsList = nutrition.vitamins.map(v => `${v.name} ${v.amount}`);
            mineralsList = nutrition.minerals.map(m => `${m.name} ${m.amount}`);
            summaryText = nutrition.summary;
        } else {
            // 旧格式
            proteinAmount = nutrition.protein;
            fatAmount = nutrition.fat;
            carbsAmount = nutrition.carbs;
            const total = proteinAmount + fatAmount + carbsAmount;
            proteinPct = total > 0 ? ((proteinAmount / total) * 100).toFixed(1) : 0;
            fatPct = total > 0 ? ((fatAmount / total) * 100).toFixed(1) : 0;
            carbsPct = total > 0 ? ((carbsAmount / total) * 100).toFixed(1) : 0;

            vitaminsList = nutrition.vitamins || [];
            mineralsList = nutrition.minerals || [];
            summaryText = nutrition.summary || '';
        }

        nutritionContent.innerHTML = `
            <table class="nutrition-table">
                <tr>
                    <th>营养项目</th>
                    <th>含量</th>
                </tr>
                <tr>
                    <td>🔥 总热量</td>
                    <td><strong>${nutrition.calories}</strong> 大卡</td>
                </tr>
                <tr>
                    <td>🥩 蛋白质</td>
                    <td><strong>${proteinAmount}</strong> 克 (${proteinPct}%)</td>
                </tr>
                <tr>
                    <td>🧈 脂肪</td>
                    <td><strong>${fatAmount}</strong> 克 (${fatPct}%)</td>
                </tr>
                <tr>
                    <td>🍞 碳水化合物</td>
                    <td><strong>${carbsAmount}</strong> 克 (${carbsPct}%)</td>
                </tr>
                <tr>
                    <td>💊 维生素</td>
                    <td>${vitaminsList.join('、')}</td>
                </tr>
                <tr>
                    <td>⚗️ 矿物质</td>
                    <td>${mineralsList.join('、')}</td>
                </tr>
                <tr>
                    <td colspan="2"><strong>📝 ${summaryText}</strong></td>
                </tr>
            </table>
        `;

        // 绘制饼图
        this.drawNutritionChart({ protein: proteinAmount, fat: fatAmount, carbs: carbsAmount });
    }

    // 绘制营养饼图
    drawNutritionChart(nutrition) {
        const ctx = document.getElementById('nutritionChart').getContext('2d');

        // 销毁旧图表
        if (this.nutritionChart) {
            this.nutritionChart.destroy();
        }

        // 创建新图表
        this.nutritionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['蛋白质', '脂肪', '碳水化合物'],
                datasets: [{
                    data: [nutrition.protein, nutrition.fat, nutrition.carbs],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 14
                            },
                            padding: 15
                        }
                    },
                    title: {
                        display: true,
                        text: '营养素比例分布（克）',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: {
                            bottom: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value}g (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new FoodRecommendationApp();
});
