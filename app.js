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

        // 自动获取位置按钮
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
        const locationInfo = document.getElementById('locationInfo');

        if (!navigator.geolocation) {
            locationInfo.innerHTML = '<span class="location-text">❌ 浏览器不支持定位</span>';
            return;
        }

        locationInfo.innerHTML = '<span class="location-text">📍 正在获取位置...</span>';

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                this.currentLocation = { lat: latitude, lng: longitude };

                // 使用IP定位API作为备选
                const location = await this.reverseGeocode(latitude, longitude);
                locationInfo.innerHTML = `<span class="location-text">📍 ${location.city}</span>`;

                // 自动获取天气
                this.getWeather(latitude, longitude);
            },
            async (error) => {
                console.error('获取位置失败:', error);

                // 使用IP定位作为备选方案
                locationInfo.innerHTML = '<span class="location-text">🌐 使用IP定位...</span>';
                const location = await this.getLocationByIP();
                if (location) {
                    locationInfo.innerHTML = `<span class="location-text">📍 ${location}</span>`;
                } else {
                    locationInfo.innerHTML = '<span class="location-placeholder">请手动选择位置</span>';
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

    // 逆地理编码 - 使用高德地图API（免费额度）
    async reverseGeocode(lat, lng) {
        try {
            // 使用高德地图逆地理编码API
            const response = await fetch(
                `https://restapi.amap.com/v3/geocode/regeo?key=YOUR_AMAP_KEY&location=${lng},${lat}&extensions=base`
            );

            if (!response.ok) {
                throw new Error('地理编码请求失败');
            }

            const data = await response.json();
            if (data.status === '1' && data.regeocode) {
                const addressComponent = data.regeocode.addressComponent;
                return {
                    city: addressComponent.city || addressComponent.province,
                    province: addressComponent.province,
                    district: addressComponent.district
                };
            }

            return { city: '未知城市' };
        } catch (error) {
            console.error('逆地理编码失败:', error);
            // 返回默认城市
            return { city: '北京' };
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
        if (!dateInput) return;

        const date = new Date(dateInput);
        const solarTerm = this.getCurrentSolarTerm(date);
        const season = this.getSeason(date);
        const seasonName = this.getSeasonName(season);

        const displayElement = document.getElementById('currentSolarTerm');
        if (displayElement) {
            displayElement.innerHTML = `🌿 ${solarTerm.name} (${seasonName})`;
        }
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

        const resultSection = document.getElementById('resultSection');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const recommendationContent = document.getElementById('recommendationContent');

        // 显示结果区域
        resultSection.style.display = 'block';

        // 显示加载动画,包含模型信息
        loadingSpinner.style.display = 'block';
        loadingSpinner.innerHTML = `
            <div class="spinner"></div>
            <p class="loading-text">🤖 正在调用AI模型生成推荐...</p>
            <p class="loading-subtext">尝试模型: GLM-4.7 → GLM-4.6 → GLM-4-Flash</p>
            <p class="loading-hint">预计需要10-30秒，请耐心等待</p>
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

            // 显示推荐结果
            this.displayRecommendation(recommendation);

        } catch (error) {
            console.error('生成推荐失败:', error);
            loadingSpinner.style.display = 'none';
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

        // 生成菜品列表HTML（支持新的详细JSON结构）
        let dishesHtml = '<ul class="dish-list">';

        if (recommendation.dishes && recommendation.dishes.length > 0) {
            recommendation.dishes.forEach(dish => {
                // 处理食材列表（新旧格式兼容）
                let ingredientsHtml = '';
                if (Array.isArray(dish.ingredients)) {
                    if (typeof dish.ingredients[0] === 'object') {
                        // 新格式：对象数组
                        ingredientsHtml = dish.ingredients.map(ing =>
                            `<li>${ing.item} ${ing.amount} - ${ing.effect}</li>`
                        ).join('');
                    } else {
                        // 旧格式：字符串数组
                        ingredientsHtml = dish.ingredients.map(ing => `<li>${ing}</li>`).join('');
                    }
                }

                // 处理营养信息
                let nutritionInfo = '';
                if (typeof dish.nutrition === 'object') {
                    nutritionInfo = `
                        <p><strong>🔥 热量:</strong> ${dish.nutrition.calories} 大卡</p>
                        <p><strong>🥩 蛋白质:</strong> ${dish.nutrition.protein}克</p>
                        <p><strong>🧈 脂肪:</strong> ${dish.nutrition.fat}克</p>
                        <p><strong>🍞 碳水:</strong> ${dish.nutrition.carbs}克</p>
                        <p><strong>💡 营养说明:</strong> ${dish.nutrition.description}</p>
                    `;
                } else {
                    nutritionInfo = `<p><strong>💪 营养价值:</strong> ${dish.nutrition}</p>`;
                }

                dishesHtml += `
                    <li>
                        <strong>${dish.type ? `[${dish.type}] ` : ''}${dish.name}</strong>
                        <div style="margin-top: 8px;">
                            <p><strong>🥘 主要食材:</strong></p>
                            <ul style="margin-left: 20px; margin-top: 5px;">
                                ${ingredientsHtml}
                            </ul>
                            ${nutritionInfo}
                            <p><strong>👨‍🍳 制作方法:</strong></p>
                            <ol style="margin-left: 20px; margin-top: 5px;">
                                ${Array.isArray(dish.recipe) ? dish.recipe.map(step => `<li>${step}</li>`).join('') : ''}
                            </ol>
                            ${dish.suitable ? `<p><strong>👥 适宜人群:</strong> ${dish.suitable}</p>` : ''}
                        </div>
                    </li>
                `;
            });
        }

        dishesHtml += '</ul>';

        // 添加专业建议部分
        if (recommendation.tips) {
            dishesHtml += `
                <div class="tips-section" style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 10px;">
                    <h4 style="margin-bottom: 10px; color: var(--primary-color);">💡 专业建议</h4>
                    ${recommendation.tips.shopping ? `<p><strong>🛒 食材选购:</strong> ${recommendation.tips.shopping}</p>` : ''}
                    ${recommendation.tips.cooking ? `<p><strong>🍳 烹饪要点:</strong> ${recommendation.tips.cooking}</p>` : ''}
                    ${recommendation.tips.pairing ? `<p><strong>🍵 搭配建议:</strong> ${recommendation.tips.pairing}</p>` : ''}
                    ${recommendation.tips.taboo ? `<p><strong>⚠️ 禁忌提醒:</strong> ${recommendation.tips.taboo}</p>` : ''}
                </div>
            `;
        }

        recommendationContent.innerHTML = dishesHtml;

        // 显示营养分析
        this.displayNutritionChart(recommendation.totalNutrition);
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
