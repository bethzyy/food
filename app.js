// 农历和节气计算工具类 - 使用lunar-javascript库
class ChineseCalendar {
    constructor() {
        // 24节气的儒略日（ approximate 1900-2100）
        // 格式：[月, 日范围]
        this.solarTerms = [
            { name: '立春', month: 2, dayRange: [3, 5] },
            { name: '雨水', month: 2, dayRange: [18, 20] },
            { name: '惊蛰', month: 3, dayRange: [5, 7] },
            { name: '春分', month: 3, dayRange: [20, 22] },
            { name: '清明', month: 4, dayRange: [4, 6] },
            { name: '谷雨', month: 4, dayRange: [19, 21] },
            { name: '立夏', month: 5, dayRange: [5, 7] },
            { name: '小满', month: 5, dayRange: [20, 22] },
            { name: '芒种', month: 6, dayRange: [5, 7] },
            { name: '夏至', month: 6, dayRange: [21, 22] },
            { name: '小暑', month: 7, dayRange: [6, 8] },
            { name: '大暑', month: 7, dayRange: [22, 24] },
            { name: '立秋', month: 8, dayRange: [7, 9] },
            { name: '处暑', month: 8, dayRange: [22, 24] },
            { name: '白露', month: 9, dayRange: [7, 9] },
            { name: '秋分', month: 9, dayRange: [22, 24] },
            { name: '寒露', month: 10, dayRange: [8, 10] },
            { name: '霜降', month: 10, dayRange: [23, 25] },
            { name: '立冬', month: 11, dayRange: [7, 8] },
            { name: '小雪', month: 11, dayRange: [22, 23] },
            { name: '大雪', month: 12, dayRange: [6, 8] },
            { name: '冬至', month: 12, dayRange: [21, 23] },
            { name: '小寒', month: 1, dayRange: [5, 7] },
            { name: '大寒', month: 1, dayRange: [19, 21] }
        ];
    }

    // 公历转农历 - 使用lunar-javascript库
    solarToLunar(solarDate) {
        try {
            // 使用lunar库进行转换
            const solar = Solar.fromDate(solarDate);
            const lunar = solar.getLunar();

            const year = lunar.getYear();
            const month = lunar.getMonth();
            const day = lunar.getDay();

            // 使用lunar库内置的方法获取完整的农历字符串
            // 格式: 一九八六年四月廿一
            const lunarString = lunar.toString(); // 例如: 二〇二五年冬月十七
            const lunarStringShort = lunar.toFullString().split(' ')[0]; // 只取年月日部分

            // 解析lunar库返回的字符串格式
            // lunar.toString() 返回如: "二〇二五年冬月十七"
            const display = lunarString;

            return {
                year: year,
                month: month,
                day: day,
                display: display
            };
        } catch (error) {
            console.error('农历转换错误:', error);
            // 降级到简化算法
            return this.fallbackSolarToLunar(solarDate);
        }
    }

    // 降级算法(当lunar库不可用时)
    fallbackSolarToLunar(solarDate) {
        // 基准日期：2024年1月11日 = 农历2023年腊月初一
        const baseDate = new Date(2024, 0, 11);
        const baseLunarYear = 2023;
        const baseLunarMonth = 12;
        const baseLunarDay = 1;

        const diffDays = Math.floor((solarDate - baseDate) / (1000 * 60 * 60 * 24));

        let lunarYear = baseLunarYear;
        let lunarMonth = baseLunarMonth;
        let lunarDay = baseLunarDay + diffDays;

        const lunarMonthNames = [
            '正月', '二月', '三月', '四月', '五月', '六月',
            '七月', '八月', '九月', '十月', '冬月', '腊月'
        ];

        const lunarDayNames = [
            '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
            '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
            '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
        ];

        while (lunarDay > 30) {
            const daysInMonth = (lunarMonth % 2 === 1) ? 30 : 29;
            if (lunarDay > daysInMonth) {
                lunarDay -= daysInMonth;
                lunarMonth++;
                if (lunarMonth > 12) {
                    lunarMonth = 1;
                    lunarYear++;
                }
            } else {
                break;
            }
        }

        let dayIndex = lunarDay - 1;
        if (dayIndex < 0) dayIndex = 0;
        if (dayIndex >= lunarDayNames.length) dayIndex = lunarDayNames.length - 1;

        return {
            year: lunarYear,
            month: lunarMonth,
            day: lunarDay,
            display: `${lunarYear}年${lunarMonthNames[lunarMonth - 1]}${lunarDayNames[dayIndex]}`
        };
    }

    // 动态计算当前节气 - 使用lunar-javascript库
    getCurrentSolarTerm(date) {
        try {
            // 使用lunar库获取精确的节气
            const solar = Solar.fromDate(date);
            const lunar = solar.getLunar();

            // 获取上一个节气
            const prevJie = lunar.getPrevJie(false);
            // 获取下一个节气
            const nextJie = lunar.getNextJie(false);

            let result = null;

            if (prevJie) {
                // Jie对象直接有toString()方法可以获取日期字符串
                const prevJieStr = prevJie.toString();
                // 从字符串中提取年月日 (格式: 2024-01-05)
                const match = prevJieStr.match(/(\d{4})-(\d{2})-(\d{2})/);
                if (match) {
                    const prevJieDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
                    const daysDiff = Math.floor((date - prevJieDate) / (1000 * 60 * 60 * 24));

                    // 如果在上一个节气后0-14天内,显示该节气
                    if (daysDiff >= 0 && daysDiff < 15) {
                        result = {
                            name: prevJie.getName(),
                            month: parseInt(match[2]),
                            dayRange: [parseInt(match[3]), parseInt(match[3])]
                        };
                    }
                }
            }

            // 检查下一个节气是否在2天以内
            if (nextJie && !result) {
                const nextJieStr = nextJie.toString();
                const match = nextJieStr.match(/(\d{4})-(\d{2})-(\d{2})/);
                if (match) {
                    const nextJieDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
                    const daysDiff = Math.floor((nextJieDate - date) / (1000 * 60 * 60 * 24));

                    if (daysDiff >= 0 && daysDiff <= 2) {
                        result = {
                            name: nextJie.getName(),
                            month: parseInt(match[2]),
                            dayRange: [parseInt(match[3]), parseInt(match[3])]
                        };
                    }
                }
            }

            return result;
        } catch (error) {
            console.error('节气计算错误:', error);
            // 降级到简化算法
            return this.fallbackGetSolarTerm(date);
        }
    }

    // 降级算法(当lunar库不可用时) - 也遵守2天规则
    fallbackGetSolarTerm(date) {
        // 简化处理:降级算法不计算节气,直接返回null
        // 避免显示不准确的节气信息
        return null;
    }

    // 判断是否在节气期间
    isSolarTermPeriod(date, termName) {
        const currentTerm = this.getCurrentSolarTerm(date);
        return currentTerm && currentTerm.name === termName;
    }

    // 计算天干地支 - 使用lunar-javascript库
    calculateGanzhi(date, hours, minutes) {
        try {
            // 使用lunar库进行计算
            const solar = Solar.fromDate(date);
            const lunar = solar.getLunar();

            // 获取八字(四柱)
            const eightChar = lunar.getEightChar();
            const yearGanzhi = eightChar.getYear();
            const monthGanzhi = eightChar.getMonth();
            const dayGanzhi = eightChar.getDay();
            const hourGanzhi = eightChar.getTime(hours);

            // 时辰名称 - 使用lunar库的getTimeZhi获取地支
            const shichenZhi = lunar.getTimeZhi(hours); // 返回地支,如"子"
            const shichen = shichenZhi + '时'; // 组合成"子时"

            const zodiacAnimals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
            const zodiac = lunar.getYearShengXiao();

            return {
                year: yearGanzhi + '年',
                month: monthGanzhi + '月',
                day: dayGanzhi + '日',
                hour: hourGanzhi + '时',
                shichen: shichen,
                zodiac: zodiac,
                display: `${yearGanzhi}年 ${monthGanzhi}月 ${dayGanzhi}日 ${hourGanzhi}时 (${shichen} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')})`
            };
        } catch (error) {
            console.error('天干地支计算错误:', error);
            // 降级到简化算法
            return this.fallbackCalculateGanzhi(date, hours, minutes);
        }
    }

    // 降级算法(当lunar库不可用时)
    fallbackCalculateGanzhi(date, hours, minutes) {
        const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        const zodiacAnimals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

        // 年干支 - 以立春为界(立春大约在2月4日)
        const year = date.getFullYear();
        const isBeforeLichun = (date.getMonth() === 0) ||
                               (date.getMonth() === 1 && date.getDate() < 4);
        const ganzhiYear = isBeforeLichun ? year - 1 : year;

        const yearStemIndex = ((ganzhiYear - 4) % 10 + 10) % 10;
        const yearBranchIndex = ((ganzhiYear - 4) % 12 + 12) % 12;

        // 月干支
        const month = date.getMonth() + 1;
        const monthBranchIndex = (month + 1) % 12;
        const monthStemIndex = ((yearStemIndex * 2 + month) % 10 + 10) % 10;

        // 日干支（基准：1949年10月1日 = 甲子日）
        const baseDate = new Date(1949, 9, 1);
        const daysDiff = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));
        const dayStemIndex = ((0 + daysDiff) % 10 + 10) % 10;
        const dayBranchIndex = ((0 + daysDiff) % 12 + 12) % 12;

        // 时干支
        const hourBranchIndex = Math.floor((hours + 1) / 2) % 12;
        const hourStemIndex = ((dayStemIndex * 2 + hourBranchIndex) % 10 + 10) % 10;

        const shichenNames = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时',
                              '午时', '未时', '申时', '酉时', '戌时', '亥时'];
        const shichen = shichenNames[hourBranchIndex];

        return {
            year: `${heavenlyStems[yearStemIndex]}${earthlyBranches[yearBranchIndex]}年`,
            month: `${heavenlyStems[monthStemIndex]}${earthlyBranches[monthBranchIndex]}月`,
            day: `${heavenlyStems[dayStemIndex]}${earthlyBranches[dayBranchIndex]}日`,
            hour: `${heavenlyStems[hourStemIndex]}${earthlyBranches[hourBranchIndex]}时`,
            shichen: shichen,
            zodiac: zodiacAnimals[yearBranchIndex],
            display: `${heavenlyStems[yearStemIndex]}${earthlyBranches[yearBranchIndex]}年 ` +
                     `${heavenlyStems[monthStemIndex]}${earthlyBranches[monthBranchIndex]}月 ` +
                     `${heavenlyStems[dayStemIndex]}${earthlyBranches[dayBranchIndex]}日 ` +
                     `${heavenlyStems[hourStemIndex]}${earthlyBranches[hourBranchIndex]}时 ` +
                     `(${shichen} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')})`
        };
    }
}

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
        console.log('============================================================');
        console.log('🍲 养生饮食推荐应用 - 初始化开始');
        console.log('============================================================');
        console.log('初始化时间:', new Date().toLocaleString());
        console.log('浏览器:', navigator.userAgent);

        this.currentLocation = null;
        this.currentWeather = '晴';
        this.chineseCalendar = new ChineseCalendar();
        this.nutritionChart = null;
        this.logger = new LogManager();
        this.translationCache = {}; // 翻译缓存
        this.currentLanguage = 'zh'; // 当前语言

        console.log('✓ 核心组件初始化完成');
        console.log('  - ChineseCalendar: 已创建');
        console.log('  - LogManager: 已创建，会话ID:', this.logger.currentSessionId);
        console.log('  - 当前语言:', this.currentLanguage);

        console.log('开始初始化应用...');
        this.init();
    }

    init() {
        console.log('init() - 开始初始化应用功能...');

        this.setupEventListeners();
        console.log('  ✓ 事件监听器已设置');

        this.autoSetDateTime();
        console.log('  ✓ 日期时间已自动设置');

        this.autoGetLocation(); // 自动获取位置
        console.log('  ✓ 位置获取已触发');

        this.detectAndSetSeason();
        console.log('  ✓ 季节检测完成');

        this.updateSolarTermDisplay();
        console.log('  ✓ 节气显示已更新');

        this.loadApiKeyFromEnv();
        console.log('  ✓ API Key加载完成');

        console.log('============================================================');
        console.log('✅ 应用初始化完成');
        console.log('============================================================');
        console.log('');
        console.log('💡 提示: 打开浏览器开发者工具(F12)查看完整日志');
        console.log('');
    }

    // 设置事件监听器
    setupEventListeners() {
        // 语言切换按钮
        document.getElementById('langToggleBtn').addEventListener('click', () => {
            const newLang = i18n.currentLang === 'zh' ? 'en' : 'zh';
            i18n.setLanguage(newLang);
            this.updateSolarTermDisplay(); // 更新节气显示
        });

        // 日期变化时更新天干地支、农历、节气和季节背景
        const dateInput = document.getElementById('dateInput');
        dateInput.addEventListener('change', () => {
            this.updateSolarTermDisplay();
            this.detectAndSetSeason();
        });
        // 添加 input 事件监听器，确保实时更新
        dateInput.addEventListener('input', () => {
            // 使用 setTimeout 确保日期值已更新
            setTimeout(() => {
                this.updateSolarTermDisplay();
                this.detectAndSetSeason();
            }, 10);
        });

        // 时间变化时更新天干地支、时辰、农历和节气
        const timeInput = document.getElementById('timeInput');
        timeInput.addEventListener('change', () => {
            this.updateSolarTermDisplay();
        });
        // 添加 input 事件监听器，确保实时更新
        timeInput.addEventListener('input', () => {
            setTimeout(() => {
                this.updateSolarTermDisplay();
            }, 10);
        });

        // 生成推荐按钮
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateRecommendation();
        });

        // 监听语言变化事件
        window.addEventListener('languageChanged', (e) => {
            this.onLanguageChanged(e.detail.lang);
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
        // 使用本地时间而不是UTC时间
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
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
        const locationSelect = document.getElementById('locationSelect');

        // 设置默认城市为北京
        const defaultCity = '北京';

        if (!navigator.geolocation) {
            locationSelect.value = defaultCity;
            this.currentLocation = { city: defaultCity };
            return;
        }

        // 先显示默认值
        locationSelect.value = defaultCity;

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                this.currentLocation = { lat: latitude, lng: longitude };

                // 使用逆地理编码获取城市名
                const location = await this.reverseGeocode(latitude, longitude);
                const cityName = location.city || location.address || defaultCity;

                // 尝试在下拉列表中匹配城市
                const options = Array.from(locationSelect.options);
                const matchedOption = options.find(option =>
                    option.value.includes(cityName) || cityName.includes(option.value)
                );

                if (matchedOption) {
                    locationSelect.value = matchedOption.value;
                    this.currentLocation = { city: matchedOption.value };
                } else {
                    locationSelect.value = defaultCity;
                    this.currentLocation = { city: defaultCity };
                }

                console.log('定位成功:', cityName, '→', locationSelect.value);
            },
            async (error) => {
                console.error('获取位置失败:', error);

                // 使用IP定位作为备选方案
                const location = await this.getLocationByIP();
                if (location) {
                    // 尝试在下拉列表中匹配
                    const options = Array.from(locationSelect.options);
                    const matchedOption = options.find(option =>
                        option.value.includes(location) || location.includes(option.value)
                    );

                    if (matchedOption) {
                        locationSelect.value = matchedOption.value;
                        this.currentLocation = { city: matchedOption.value };
                    } else {
                        locationSelect.value = defaultCity;
                        this.currentLocation = { city: defaultCity };
                    }
                } else {
                    locationSelect.value = defaultCity;
                    this.currentLocation = { city: defaultCity };
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

    // 处理语言切换事件
    async onLanguageChanged(lang) {
        console.log('语言已切换为:', lang);
        this.currentLanguage = lang;

        if (lang === 'en') {
            // 翻译页面文本
            await this.translatePage();
        }

        // 重新更新节气显示
        this.updateSolarTermDisplay();
    }

    // 翻译页面内容
    async translatePage() {
        try {
            const apiKey = localStorage.getItem('ZHIPU_API_KEY');
            if (!apiKey) {
                console.log('未找到API Key，跳过翻译');
                return;
            }

            // 收集需要翻译的文本
            const textsToTranslate = [
                document.querySelector('.app-header h1').textContent,
                document.querySelector('.subtitle').textContent,
            ];

            // 调用翻译API
            const translatedTexts = await this.translateText(textsToTranslate, 'en');

            // 更新页面文本
            const titleEl = document.querySelector('.app-header h1');
            const subtitleEl = document.querySelector('.subtitle');

            if (titleEl && translatedTexts[0]) titleEl.textContent = translatedTexts[0];
            if (subtitleEl && translatedTexts[1]) subtitleEl.textContent = translatedTexts[1];

        } catch (error) {
            console.error('翻译失败:', error);
        }
    }

    // 翻译文本（使用GLM模型）
    async translateText(texts, targetLang) {
        const apiKey = localStorage.getItem('ZHIPU_API_KEY');
        if (!apiKey) return texts;

        // 检查缓存
        const cacheKey = `${targetLang}_${texts.join('|')}`;
        if (this.translationCache[cacheKey]) {
            return this.translationCache[cacheKey];
        }

        try {
            const prompt = `Please translate the following texts to ${targetLang === 'en' ? 'English' : 'Chinese'}. Return ONLY a JSON array with the translations in the same order:\n${JSON.stringify(texts)}`;

            const response = await fetch('https://open.bigmodel.cn/api/anthropic/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify({
                    model: 'glm-4-flash',
                    max_tokens: 1000,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('翻译请求失败');
            }

            const data = await response.json();

            // 移除可能存在的markdown代码块标记
            let responseText = data.content[0].text;
            responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            const result = JSON.parse(responseText);

            // 缓存结果
            this.translationCache[cacheKey] = result;
            return result;

        } catch (error) {
            console.error('翻译错误:', error);
            return texts; // 失败时返回原文
        }
    }

    // 更新节气显示
    updateSolarTermDisplay() {
        const dateInput = document.getElementById('dateInput').value;
        const timeInput = document.getElementById('timeInput').value;
        if (!dateInput) return;

        const date = new Date(dateInput);
        const [hours, minutes] = timeInput.split(':').map(Number);

        // 更新天干地支+农历+节气合并显示（一行）
        this.updateGanzhiDisplay(date, hours, minutes);

        // 更新节气UI效果(添加/移除CSS类)
        this.updateSolarTermUIEffects(date);
    }

    // 计算并显示天干地支、农历、节气（全部合并到一行）
    updateGanzhiDisplay(date, hours, minutes) {
        console.log('=== updateGanzhiDisplay 开始 ===');
        console.log('输入日期:', date.toISOString().split('T')[0], '时间:', hours, ':', minutes);

        const ganzhi = this.chineseCalendar.calculateGanzhi(date, hours, minutes);
        const lunarDate = this.chineseCalendar.solarToLunar(date);

        console.log('天干地支:', ganzhi);
        console.log('农历:', lunarDate);

        // 使用新的方法获取节气关系
        const termRelation = this.getSolarTermDayRelation(date);

        console.log('节气关系结果:', termRelation);

        // 构建节气信息 - 只在节气前后2天内显示
        let termInfo = '';
        if (termRelation) {
            console.log('✓ 有节气信息, relation:', termRelation.relation, 'name:', termRelation.name);
            switch(termRelation.relation) {
                case 'today':
                    termInfo = `  ✨ 今日${termRelation.name} ✨`;
                    break;
                case 'yesterday':
                    termInfo = `  📅 昨日${termRelation.name}`;
                    break;
                case 'dayBeforeYesterday':
                    termInfo = `  📅 前日${termRelation.name}`;
                    break;
                case 'tomorrow':
                    termInfo = `  📅 明日${termRelation.name}`;
                    break;
                case 'dayAfterTomorrow':
                    termInfo = `  📅 后日${termRelation.name}`;
                    break;
            }
        } else {
            console.log('✗ 没有节气信息(termRelation为null)');
        }
        // 注意:如果不在节气前后2天内,不显示任何节气信息

        // 合并显示:新格式 - 丙午年 丙寅月 己卯日 辛未时 2025年腊月初六 ✨ 今日小寒 ✨
        const ganzhiCompact = `${ganzhi.year} ${ganzhi.month} ${ganzhi.day} ${ganzhi.hour}`;
        const displayElement = document.getElementById('ganzhiDisplay');

        console.log('最终显示内容:', ganzhiCompact, '+', lunarDate.display, '+', termInfo);

        // 直接显示中文（天干地支、农历、节气保持中文,避免频繁API调用）
        if (displayElement) {
            displayElement.textContent = `${ganzhiCompact}  ${lunarDate.display}${termInfo}`;
        }

        console.log('=== updateGanzhiDisplay 结束 ===');
    }

    // 更新节气UI效果（添加/移除CSS类，用于华丽视觉效果）
    updateSolarTermUIEffects(date) {
        const today = new Date(date);

        // 检查前后两天是否是节气
        const isSolarTermPeriod = this.isNearSolarTerm(today);

        // 获取当前或附近的节气名称
        const solarTerm = this.getNearbySolarTerm(today);
        const solarTermName = solarTerm ? solarTerm.name : '';

        // 添加或移除特殊的节气样式类
        const bodyElement = document.body;
        const appContainer = document.querySelector('.app-container');

        // 设置节气名称到data属性,用于CSS选择器
        if (solarTermName) {
            bodyElement.setAttribute('data-solar-term', solarTermName);

            // 设置节气背景图
            this.setSolarTermBackground(solarTermName, appContainer);
        } else {
            // 没有节气时移除背景图
            if (appContainer) {
                appContainer.style.backgroundImage = 'none';
            }
        }

        if (isSolarTermPeriod) {
            bodyElement.classList.add('is-solar-term-day');
            if (appContainer) {
                appContainer.classList.add('is-solar-term-day');
            }
        } else {
            bodyElement.classList.remove('is-solar-term-day');
            if (appContainer) {
                appContainer.classList.remove('is-solar-term-day');
            }
        }
    }

    // 获取附近的节气（今天、昨天、前天或明天）
    getNearbySolarTerm(date) {
        // 使用新的方法获取节气关系
        const termRelation = this.getSolarTermDayRelation(date);

        if (termRelation) {
            return {
                name: termRelation.name,
                month: 0, // 不需要month字段
                dayRange: [0, 0] // 不需要dayRange字段
            };
        }

        return null;
    }

    // 检测传统节日
    getTraditionalFestival(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();

        // 传统节日数据（农历和公历）
        const festivals = [
            // 春节（农历正月初一）- 简化为公历1月下旬到2月中旬
            { name: '春节', month: 1, dayRange: [[21, 31], [1, 15]], image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&q=80' },
            // 元宵节（农历正月十五）- 简化为公历2月
            { name: '元宵节', month: 2, dayRange: [[1, 28]], image: 'https://images.unsplash.com/photo-1518176258769-f227c798150e?w=1920&q=80' },
            // 清明节（公历4月4-6日）
            { name: '清明节', month: 4, dayRange: [[4, 6]], image: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=1920&q=80' },
            // 端午节（农历五月初五）- 简化为公历6月
            { name: '端午节', month: 6, dayRange: [[1, 30]], image: 'https://images.unsplash.com/photo-1533565406508-97d5cc661319?w=1920&q=80' },
            // 七夕节（农历七月初七）- 简化为公历8月
            { name: '七夕节', month: 8, dayRange: [[1, 31]], image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80' },
            // 中秋节（农历八月十五）- 简化为公历9月
            { name: '中秋节', month: 9, dayRange: [[1, 30]], image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996cd?w=1920&q=80' },
            // 重阳节（农历九月初九）- 简化为公历10月
            { name: '重阳节', month: 10, dayRange: [[1, 31]], image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80' },
            // 冬至（公历12月21-23日）
            { name: '冬至', month: 12, dayRange: [[21, 23]], image: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1920&q=80' },
            // 除夕（农历腊月三十）- 简化为公历1月或2月
            { name: '除夕', month: 1, dayRange: [[20, 31]], image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&q=80' },
            { name: '除夕', month: 2, dayRange: [[1, 10]], image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&q=80' }
        ];

        // 检查是否在节日范围内
        for (const festival of festivals) {
            if (festival.month === month) {
                for (const range of festival.dayRange) {
                    if (day >= range[0] && day <= range[1]) {
                        return festival;
                    }
                }
            }
        }

        return null;
    }

    // 设置节气背景图（优先使用本地图片，否则使用渐变背景）
    setSolarTermBackground(solarTermName, container) {
        if (!container) return;

        // 尝试使用本地图片
        const imagePath = `images/festival_art/${solarTermName}.png`;

        // 创建Image对象预加载图片
        const img = new Image();
        img.onload = () => {
            // 图片加载成功，使用背景图
            container.style.background = `url(${imagePath}) center/cover no-repeat`;
            container.style.transition = 'background 0.5s ease';
            console.log(`✓ 使用本地图片背景: ${solarTermName}`);
        };

        img.onerror = () => {
            // 图片加载失败，使用渐变背景
            this.applyGradientBackground(solarTermName, container);
        };

        // 开始加载图片
        img.src = imagePath;
    }

    // 应用渐变背景（当本地图片不存在时使用）
    applyGradientBackground(solarTermName, container) {
        // 24节气中国风纯色背景
        const solarTermColors = {
            '立春': '#a8e063',      // 春竹新生
            '雨水': '#89f7fe',      // 春雨绵绵
            '惊蛰': '#ffecd2',      // 春雷始鸣
            '春分': '#a8edea',      // 春分百花
            '清明': '#d299c2',      // 清明雨纷纷
            '谷雨': '#96fbc4',      // 谷雨播种
            '立夏': '#ffecd2',      // 立夏繁茂
            '小满': '#ffd89b',      // 小满麦粒
            '芒种': '#f093fb',      // 芒种播种
            '夏至': '#4facfe',      // 夏至阳极
            '小暑': '#fa709a',      // 小暑热浪
            '大暑': '#ff0844',      // 大暑荷花
            '立秋': '#f6d365',      // 立秋暑去
            '处暑': '#ffecd2',      // 处暑夏尽
            '白露': '#e0c3fc',      // 白露成霜
            '秋分': '#fddb92',      // 秋分平衡
            '寒露': '#a1c4fd',      // 寒露深秋
            '霜降': '#c471f5',      // 霜降露霜
            '立冬': '#e6e9f0',      // 立冬收藏
            '小雪': '#e0c3fc',      // 小雪寒意
            '大雪': '#a8c0ff',      // 大雪银装
            '冬至': '#c7c9d8',      // 冬至阳生
            '小寒': '#e6dada',      // 小寒严寒
            '大寒': '#c9d6ff',      // 大寒腊八
            '龙抬头': '#a8e063'     // 龙抬头（二月二）
        };

        // 传统节日中国风纯色背景
        const festivalColors = {
            '春节': '#ff416c',      // 春节红妆
            '小年': '#f093fb',      // 小年祭灶
            '元宵节': '#ffd89b',    // 元宵灯火
            '清明节': '#89f7fe',    // 清明踏青
            '端午节': '#56ab2f',    // 端午粽香
            '七夕节': '#ffecd2',    // 七夕乞巧
            '中秋节': '#2c3e50',    // 中秋月圆
            '重阳节': '#fddb92',    // 重阳登高
            '腊八节': '#ffecd2',    // 腊八粥香
            '除夕': '#ff0844',      // 除夕守岁
            '寒食节': '#a8edea',    // 寒食禁火
            '中元节': '#89f7fe'     // 中元节
        };

        // 优先使用节日背景，然后是节气背景
        const color = festivalColors[solarTermName] || solarTermColors[solarTermName];
        if (color) {
            container.style.background = color;
            container.style.transition = 'background 0.5s ease';
            console.log(`✓ 使用纯色背景: ${solarTermName}`);
        }
    }

    // 判断是否在节气附近（前后2天内）
    isNearSolarTerm(date) {
        const termRelation = this.getSolarTermDayRelation(date);
        return termRelation !== null;
    }

    // 获取指定日期的节气（使用lunar库精确计算）
    getSolarTermForDate(date) {
        try {
            const solar = Solar.fromDate(date);
            const lunar = solar.getLunar();

            // 获取该日期所在节气的精确日期
            const prevJie = lunar.getPrevJie(false);
            const nextJie = lunar.getNextJie(false);

            // 检查是否正好是节气当天
            if (prevJie) {
                const prevJieStr = prevJie.toString();
                const match = prevJieStr.match(/(\d{4})-(\d{2})-(\d{2})/);
                if (match) {
                    const prevJieDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
                    const daysDiff = Math.floor((date - prevJieDate) / (1000 * 60 * 60 * 24));

                    // 如果正好是节气当天(相差0天)
                    if (daysDiff === 0) {
                        return {
                            name: prevJie.getName(),
                            month: parseInt(match[2]),
                            dayRange: [parseInt(match[3]), parseInt(match[3])]
                        };
                    }
                }
            }

            // 如果当天不是节气,返回null
            return null;
        } catch (error) {
            console.error('获取节气日期错误:', error);
            return null;
        }
    }

    // 获取节气与指定日期的关系(返回相对天数)
    getSolarTermDayRelation(date) {
        try {
            console.log('=== 调试节气关系 ===');
            console.log('查询日期:', date.toISOString().split('T')[0]);

            // 使用ChineseCalendar中已定义的节气数据(更可靠)
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const year = date.getFullYear();

            console.log('年月日:', year, month, day);

            let result = null;

            // 遍历所有节气
            for (const term of this.chineseCalendar.solarTerms) {
                const [startDay, endDay] = term.dayRange;

                // 检查当前日期是否在节气范围内(前后各2天)
                if (term.month === month && day >= startDay - 2 && day <= endDay + 2) {
                    // 计算当前日期与节气开始日的距离
                    const daysDiff = day - startDay;

                    console.log('在节气范围内:', term.name, '范围:', startDay + '-' + endDay, '相差:', daysDiff, '天');

                    // 判断关系
                    if (daysDiff === 0) {
                        // 今天是节气开始日
                        console.log('✓ 今日节气:', term.name);
                        return { name: term.name, relation: 'today', daysDiff: 0 };
                    } else if (daysDiff === 1) {
                        // 昨日是节气开始日
                        console.log('✓ 昨日节气:', term.name);
                        return { name: term.name, relation: 'yesterday', daysDiff: 1 };
                    } else if (daysDiff === 2) {
                        // 前日是节气开始日
                        console.log('✓ 前日节气:', term.name);
                        return { name: term.name, relation: 'dayBeforeYesterday', daysDiff: 2 };
                    } else if (daysDiff === -1) {
                        // 明日是节气开始日
                        console.log('✓ 明日节气:', term.name);
                        return { name: term.name, relation: 'tomorrow', daysDiff: -1 };
                    } else if (daysDiff === -2) {
                        // 后日是节气开始日
                        console.log('✓ 后日节气:', term.name);
                        return { name: term.name, relation: 'dayAfterTomorrow', daysDiff: -2 };
                    }
                }
            }

            console.log('✗ 没有找到符合条件的节气');
            return null;
        } catch (error) {
            console.error('获取节气关系错误:', error);
            console.error('错误堆栈:', error.stack);
            return null;
        }
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
        console.log('当前时间:', new Date().toLocaleString());

        const generateBtn = document.getElementById('generateBtn');
        const resultSection = document.getElementById('resultSection');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const recommendationContent = document.getElementById('recommendationContent');

        console.log('✓ DOM元素获取完成');

        // 立即禁用按钮并显示加载状态
        generateBtn.disabled = true;
        generateBtn.innerHTML = '⏳ 正在生成...';
        generateBtn.style.opacity = '0.7';

        // 显示结果区域(添加安全检查)
        if (resultSection) {
            resultSection.style.display = 'block';
            // 滚动到结果区域
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // 显示加载动画,包含步骤进度
        loadingSpinner.style.display = 'block';
        loadingSpinner.innerHTML = `
            <div class="spinner"></div>
            <p class="loading-text">🤖 正在生成推荐...</p>
            <div class="loading-steps">
                <div class="step active" id="step1">✓ 收集信息</div>
                <div class="step" id="step2">○ 分析节气</div>
                <div class="step" id="step3">○ AI生成推荐</div>
                <div class="step" id="step4">○ 整理结果</div>
            </div>
            <p class="loading-hint">⏰ 预计需要5-15秒</p>
        `;
        recommendationContent.innerHTML = '';
        document.getElementById('nutritionCard').style.display = 'none';

        // 获取用户输入
        const dateInput = document.getElementById('dateInput').value;
        const timeInput = document.getElementById('timeInput').value;
        const mealPeriod = document.querySelector('input[name="mealPeriod"]:checked').value;
        const dietType = document.querySelector('input[name="dietType"]:checked').value;
        const weather = document.getElementById('weatherSelect').value;

        console.log('✓ 用户输入获取成功');
        console.log('  - 日期:', dateInput);
        console.log('  - 时间:', timeInput);
        console.log('  - 餐次:', mealPeriod);
        console.log('  - 饮食类型:', dietType);
        console.log('  - 天气:', weather);

        // 更新步骤1完成
        this.updateLoadingStep(2);

        // 解析日期
        console.log('开始计算节气和季节...');
        const date = new Date(dateInput);
        const solarTerm = this.chineseCalendar.getCurrentSolarTerm(date);
        const season = this.getSeason(date);

        console.log('✓ 节气计算完成');
        console.log('  - 节气:', solarTerm ? solarTerm.name : '未找到');
        console.log('  - 季节:', this.getSeasonName(season));

        if (!solarTerm) {
            console.warn('⚠️ 警告: 未能识别节气，将使用默认值');
        }

        // 更新步骤2完成
        this.updateLoadingStep(3);

        try {
            console.log('准备调用GLM API...');
            const apiParams = {
                date: dateInput,
                time: timeInput,
                mealPeriod: mealPeriod,
                dietType: dietType,
                weather: weather,
                solarTerm: solarTerm ? solarTerm.name : '立春',
                season: this.getSeasonName(season)
            };
            console.log('API参数:', apiParams);

            // 调用API生成推荐 (优先使用快速模型: flash -> 4.6 -> 4.7)
            const recommendation = await this.callGLMAPIWithFallback(apiParams);

            console.log('✓ API调用成功');
            console.log('  - 返回数据类型:', typeof recommendation);
            console.log('  - 是否有items字段:', recommendation && 'items' in recommendation);
            console.log('  - items数量:', recommendation && recommendation.items ? recommendation.items.length : 0);

            // 更新步骤3完成
            this.updateLoadingStep(4);

            console.log('开始渲染推荐结果...');

            // 隐藏加载动画
            loadingSpinner.style.display = 'none';

            // 恢复按钮状态
            generateBtn.disabled = false;
            generateBtn.innerHTML = '🍲 生成推荐';
            generateBtn.style.opacity = '1';

            console.log('✓ 推荐生成完成');
            generateBtn.innerHTML = '🌟 饮食推荐';
            generateBtn.style.opacity = '1';

            // 显示推荐结果
            console.log('调用displayRecommendation渲染结果...');
            this.displayRecommendation(recommendation);

            console.log('=== 推荐生成流程完成 ===');

        } catch (error) {
            console.error('❌ 生成推荐失败');
            console.error('错误类型:', error.constructor.name);
            console.error('错误消息:', error.message);
            console.error('错误堆栈:', error.stack);

            // 隐藏加载动画
            loadingSpinner.style.display = 'none';

            // 恢复按钮状态
            generateBtn.disabled = false;
            generateBtn.innerHTML = '🌟 饮食推荐';
            generateBtn.style.opacity = '1';

            recommendationContent.innerHTML = `
                <div class="error-message">
                    <h3>❌ 生成失败</h3>
                    <p><strong>错误信息:</strong> ${error.message}</p>
                    <p class="error-hint">💡 提示: 请检查网络连接和API Key配置，查看浏览器控制台获取详细日志</p>
                </div>
            `;

            console.log('=== 推荐生成失败，流程终止 ===');
        }
    }

    // 更新加载步骤显示
    updateLoadingStep(stepNumber) {
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            if (index + 1 < stepNumber) {
                step.classList.remove('active');
                step.classList.add('completed');
                step.innerHTML = `✓ ${step.textContent.replace(/^[✓○]\s*/, '')}`;
            } else if (index + 1 === stepNumber) {
                step.classList.add('active');
                step.classList.remove('completed');
                step.innerHTML = `→ ${step.textContent.replace(/^[✓○→]\s*/, '')}`;
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }

    // 带自动降级的API调用（优先使用高质量模型）
    async callGLMAPIWithFallback(params) {
        // 根据测试结果，GLM-4.7速度最快且质量最高
        const models = ['glm-4.7', 'glm-4.6', 'glm-4-flash'];

        for (let i = 0; i < models.length; i++) {
            const model = models[i];
            console.log(`尝试使用模型: ${model} (${i + 1}/${models.length})`);

            // 更新加载提示
            const loadingText = document.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = `🤖 使用模型 ${model} 生成推荐...`;
            }

            try {
                const result = await this.callGLMAPI({ ...params, model });
                console.log(`✅ 模型 ${model} 调用成功`);
                return result;
            } catch (error) {
                console.error(`❌ 模型 ${model} 调用失败:`, error.message);

                if (i < models.length - 1) {
                    console.log(`⏳ 自动切换到下一个模型: ${models[i + 1]}`);
                } else {
                    throw new Error(`所有模型都失败了。最后错误: ${error.message}`);
                }
            }
        }
    }

    // 调用GLM API
    async callGLMAPI(params) {
        console.log('========== callGLMAPI开始 ==========');
        console.log('参数:', JSON.stringify(params, null, 2));

        // 从系统变量获取API Key
        console.log('正在获取API Key...');
        const apiKey = await this.getApiKey();

        if (!apiKey) {
            console.error('❌ API Key获取失败');
            throw new Error('未找到API Key，请设置系统变量 ZHIPU_API_KEY');
        }

        console.log('✓ API Key获取成功，长度:', apiKey.length, '字符');

        // 获取模型
        const model = params.model || 'glm-4-flash';
        console.log('使用模型:', model);

        // 构建提示词
        console.log('开始构建prompt...');
        const prompt = await this.buildPrompt(params);
        console.log('Prompt构建完成,长度:', prompt.length);
        console.log('Prompt前200字符:', prompt.substring(0, 200));

        try {
            console.log(`正在发送API请求到 ${model}...`);
            const requestStartTime = Date.now();

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
            const requestElapsed = Date.now() - requestStartTime;
            console.log(`✓ API请求完成，耗时: ${requestElapsed}ms (${(requestElapsed/1000).toFixed(2)}秒)`);
            console.log('响应状态:', response.status, response.statusText);

            if (!response.ok) {
                console.error('❌ API请求失败');
                const errorData = await response.json();
                console.error('错误详情:', JSON.stringify(errorData, null, 2));
                throw new Error(errorData.error?.message || 'API请求失败');
            }

            console.log('正在解析响应JSON...');
            const data = await response.json();
            console.log('✓ 响应JSON解析成功');
            console.log('响应结构:', {
                id: data.id,
                type: data.type,
                role: data.role,
                content_exists: !!data.content,
                content_length: data.content ? data.content.length : 0
            });

            // Anthropic格式: data.content[0].text
            // OpenAI格式: data.choices[0].message.content
            const content = data.content?.[0]?.text || data.choices?.[0]?.message?.content || '';

            if (!content || content.trim().length === 0) {
                console.error('❌ API返回空内容!');
                console.error('完整响应:', JSON.stringify(data, null, 2));
                throw new Error('GLM模型返回空内容,请尝试使用glm-4-flash或glm-4.6');
            }

            console.log('✓ 获取返回内容，长度:', content.length, '字符');
            console.log('内容预览(前200字符):', content.substring(0, 200));

            // 解析返回的内容（期望JSON格式）
            console.log('========== 开始解析推荐内容 ==========');
            const parsed = this.parseRecommendation(content);
            console.log('========== 推荐内容解析完成 ==========');

            return parsed;

        } catch (error) {
            console.error('❌ API调用异常');
            console.error('错误类型:', error.constructor.name);
            console.error('错误消息:', error.message);
            if (error.name === 'AbortError') {
                console.error('请求超时(>120秒)');
            }
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

        // 如果都没有，显示模态框让用户输入
        console.log('⚠️ 未找到API Key，显示输入框');
        return await this.showApiKeyModal();
    }

    // 显示API Key输入模态框
    showApiKeyModal() {
        return new Promise((resolve) => {
            const modal = document.getElementById('apiKeyModal');
            const input = document.getElementById('apiKeyInput');
            const saveBtn = document.getElementById('saveApiKeyBtn');

            // 显示模态框
            modal.style.display = 'flex';

            // 聚焦输入框
            setTimeout(() => input.focus(), 100);

            // 保存按钮点击事件
            const handleSave = () => {
                const apiKey = input.value.trim();
                if (apiKey) {
                    localStorage.setItem('ZHIPU_API_KEY', apiKey);
                    console.log('✅ API Key已保存到localStorage');
                    modal.style.display = 'none';
                    // 清理事件监听
                    saveBtn.removeEventListener('click', handleSave);
                    input.removeEventListener('keypress', handleKeyPress);
                    resolve(apiKey);
                } else {
                    alert('请输入有效的API Key');
                    input.focus();
                }
            };

            // 回车键保存
            const handleKeyPress = (e) => {
                if (e.key === 'Enter') {
                    handleSave();
                }
            };

            saveBtn.addEventListener('click', handleSave);
            input.addEventListener('keypress', handleKeyPress);
        });
    }

    // 构建提示词（从prompts文件夹读取）
    async buildPrompt(params) {
        try {
            // 从prompts文件夹读取提示词模板（根据dietType选择）
            const promptTemplate = await this.fetchPromptTemplate(params.dietType);
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

    // 从文件读取提示词模板（根据饮食类型选择）
    async fetchPromptTemplate(dietType) {
        try {
            // 根据饮食类型选择不同的提示词文件
            let promptFile = 'prompts/food_recommendation_prompt.txt';
            if (dietType === '茶饮推荐') {
                promptFile = 'prompts/tea_recommendation_prompt.txt';
            }

            const response = await fetch(promptFile);
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
            console.log('🔍 开始解析AI返回内容...');
            console.log('  - 原始内容长度:', content.length, '字符');

            // 尝试提取JSON部分
            let jsonStr = content;

            // 方法1: 提取```json```代码块
            const jsonStart = content.indexOf('```json');
            const jsonEnd = content.lastIndexOf('```');
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                jsonStr = content.substring(jsonStart + 7, jsonEnd);
                console.log('  ✓ 使用代码块提取方法');
            }
            // 方法2: 提取第一个{和最后一个}之间的内容
            else if (content.includes('{')) {
                const firstBrace = content.indexOf('{');
                const lastBrace = content.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    jsonStr = content.substring(firstBrace, lastBrace + 1);
                    console.log('  ✓ 使用大括号提取方法');
                }
            }

            console.log('  - 提取的JSON字符串长度:', jsonStr.length, '字符');
            console.log('  - JSON预览:', jsonStr.substring(0, 100) + '...');

            // 解析JSON
            console.log('  - 正在解析JSON...');
            const recommendation = JSON.parse(jsonStr.trim());

            // 验证数据完整性 - 支持dishes和teas两种字段
            const hasDishes = recommendation.dishes && Array.isArray(recommendation.dishes);
            const hasTeas = recommendation.teas && Array.isArray(recommendation.teas);

            if (!hasDishes && !hasTeas) {
                console.error('❌ JSON缺少dishes或teas字段');
                throw new Error('缺少dishes或teas字段');
            }

            // 标准化：统一使用items字段
            const items = hasDishes ? recommendation.dishes : recommendation.teas;
            recommendation.items = items;

            console.log(`✅ JSON解析成功`);
            console.log(`  - ${hasDishes ? 'dishes' : 'teas'}数组长度: ${items.length}`);
            console.log(`  - 第一个项目名称: ${items[0]?.name || '未知'}`);
            console.log(`  - 是否有reasoning: ${!!recommendation.reasoning}`);
            console.log(`  - 是否有tips: ${!!recommendation.tips}`);
            console.log(`  - 是否有totalNutrition: ${!!recommendation.totalNutrition}`);

            return recommendation;

        } catch (error) {
            console.error('❌ 解析推荐结果失败');
            console.error('  - 错误类型:', error.constructor.name);
            console.error('  - 错误消息:', error.message);
            console.error('  - 原始内容(前500字符):', content.substring(0, 500));

            // 如果解析失败，尝试从文本中提取信息
            console.log('⏳ 尝试备用方案:从文本中提取信息...');
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
        const dietType = document.querySelector('input[name="dietType"]:checked').value;

        // 判断是茶饮推荐还是食物推荐（使用标准化后的items字段）
        const isTeaRecommendation = dietType === '茶饮推荐' && recommendation.items && recommendation.items.length > 0;
        const isTeaData = recommendation.teas && recommendation.teas.length > 0;

        if (isTeaRecommendation || isTeaData) {
            this.displayTeaRecommendation(recommendation);
            return;
        }

        // 原有的食物推荐逻辑
        // 生成精美的菜品卡片
        let dishesHtml = '<div class="dish-grid">';

        // 使用标准化的items字段（支持dishes和teas）
        const items = recommendation.items || [];
        if (items.length > 0) {
            // 排序：主食放在最后
            const sortedDishes = [...items].sort((a, b) => {
                if (a.type === '主食') return 1;
                if (b.type === '主食') return -1;
                return 0;
            });

            sortedDishes.forEach((dish, index) => {
                // 获取菜品类型(不使用emoji和标签)
                const typeInfo = {
                    '汤品': { emoji: '', name: '', label: '' },
                    '主食': { emoji: '', name: '', label: '' },
                    '热菜': { emoji: '', name: '', label: '' },
                    '凉菜': { emoji: '', name: '', label: '' },
                    '甜品': { emoji: '', name: '', label: '' },
                    '药膳': { emoji: '', name: '', label: '' }
                };
                const typeData = typeInfo[dish.type] || { emoji: '', name: '', label: '' };

                // 简化食材显示 - 包含克数
                let ingredientsText = '';
                if (Array.isArray(dish.ingredients)) {
                    if (typeof dish.ingredients[0] === 'object') {
                        ingredientsText = dish.ingredients.map(ing => `${ing.item}${ing.amount ? ing.amount + '克' : ''}`).join('、');
                    } else {
                        ingredientsText = dish.ingredients.join('、');
                    }
                }

                // 简化营养信息 - 使用雅致表述
                let nutritionBadge = '';
                if (typeof dish.nutrition === 'object') {
                    nutritionBadge = `<span class="dish-calories-badge"><span class="fire-icon">🔥</span>${dish.nutrition.calories}大卡</span>`;
                }

                // 生成菜品类型对应的渐变背景色
                const gradientColors = this.getTypeGradient(dish.type);

                dishesHtml += `
                    <div class="dish-card">
                        <div class="dish-header">
                            <span class="dish-emoji">${typeData.emoji}</span>
                            <div class="dish-title-group">
                                <h3 class="dish-name">${dish.name}</h3>
                                ${nutritionBadge ? `
                                <span class="dish-calories-badge">${nutritionBadge}</span>
                                ` : ''}
                            </div>
                        </div>

                        <div class="dish-ingredients">
                            <p class="label">🥘 食材</p>
                            <p class="value">${ingredientsText}</p>
                        </div>

                        <div class="dish-recipe-section">
                            <button class="recipe-toggle-btn" onclick="app.toggleRecipe(${index})">
                                📜 查看制法
                            </button>
                            <div class="recipe-content" id="recipe-${index}" style="display: none;">
                                ${Array.isArray(dish.recipe) ? dish.recipe.map((step, i) =>
                                    `<p class="recipe-step-inline">${i + 1}. ${step}</p>`
                                ).join('') : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        dishesHtml += '</div>';

        recommendationContent.innerHTML = dishesHtml;

        // 显示营养分析
        this.displayNutritionChart(recommendation.totalNutrition);

        // 显示推荐理由
        this.displayReasoning(recommendation);
    }

    // 显示推荐理由
    displayReasoning(recommendation) {
        const reasoningCard = document.getElementById('reasoningCard');
        const reasoningContent = document.getElementById('reasoningContent');

        reasoningCard.style.display = 'block';

        // 生成推荐理由HTML - 三段式论述
        let reasoningHtml = '<div class="reasoning-container">';

        if (recommendation.reasoning) {
            // 新格式 - 简化的三段式
            if (typeof recommendation.reasoning.chineseMedicine === 'string') {
                reasoningHtml += `
                    <div class="reasoning-section">
                        <h4>🏥 中医养生角度</h4>
                        <p>${recommendation.reasoning.chineseMedicine}</p>
                    </div>
                    <div class="reasoning-section">
                        <h4>🌸 时令养生角度</h4>
                        <p>${recommendation.reasoning.seasonal}</p>
                    </div>
                    <div class="reasoning-section">
                        <h4>🔬 现代营养学角度</h4>
                        <p>${recommendation.reasoning.nutrition}</p>
                    </div>
                `;
            }
            // 兼容旧格式 - 嵌套对象
            else if (recommendation.reasoning.chineseMedicine && typeof recommendation.reasoning.chineseMedicine === 'object') {
                const cm = recommendation.reasoning.chineseMedicine;
                const sl = recommendation.reasoning.seasonal;
                const nt = recommendation.reasoning.nutrition;

                reasoningHtml += `
                    <div class="reasoning-section">
                        <h4>🏥 中医养生角度</h4>
                        <p>${cm.compatibility || ''} ${cm.natureFlavor || ''} ${cm.organNourishment || ''} ${cm.effects || ''}</p>
                    </div>
                    <div class="reasoning-section">
                        <h4>🌸 时令养生角度</h4>
                        <p>${sl.solarTerm || ''} ${sl.weather || ''} ${sl.season || ''} ${sl.timing || ''}</p>
                    </div>
                    <div class="reasoning-section">
                        <h4>🔬 现代营养学角度</h4>
                        <p>${nt.balance || ''} ${nt.micronutrients || ''} ${nt.calories || ''} ${nt.science || ''}</p>
                    </div>
                `;
            }
            // 兼容更旧的格式
            else if (recommendation.reasoning.solarTerm || recommendation.reasoning.weather) {
                reasoningHtml += `
                    <div class="reasoning-section">
                        <h4>🌟 综合推荐</h4>
                        <p>${recommendation.reasoning.solarTerm || ''} ${recommendation.reasoning.weather || ''} ${recommendation.reasoning.season || ''} ${recommendation.reasoning.nutrition || ''} ${recommendation.reasoning.materiaMedica || ''}</p>
                    </div>
                `;
            }
        }

        reasoningHtml += '</div>';

        reasoningContent.innerHTML = reasoningHtml;
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
        const button = document.querySelector(`#recipe-${index}`).previousElementSibling;

        if (recipeContent.style.display === 'none') {
            recipeContent.style.display = 'block';
            button.textContent = '🔼 收起制法';
        } else {
            recipeContent.style.display = 'none';
            button.textContent = '📜 查看制法';
        }
    }

    // 显示茶饮推荐
    displayTeaRecommendation(recommendation) {
        const recommendationContent = document.getElementById('recommendationContent');

        let teasHtml = '<div class="dish-grid">';

        // 使用标准化的items字段（支持dishes和teas）
        const teas = recommendation.teas || recommendation.items || [];
        if (teas.length > 0) {
            teas.forEach((tea, index) => {
                // 茶类型对应的emoji和雅致称谓
                const teaTypes = {
                    '绿茶': { emoji: '🍃', name: '绿茶' },
                    '红茶': { emoji: '🍂', name: '红茶' },
                    '乌龙': { emoji: '🌿', name: '乌龙' },
                    '普洱': { emoji: '🍵', name: '普洱' },
                    '花茶': { emoji: '🌸', name: '花茶' },
                    '草本茶': { emoji: '🌱', name: '草本' }
                };
                const teaType = teaTypes[tea.type] || { emoji: '🍵', name: '茶饮' };

                // 配料显示 - 包含克数
                let ingredientsText = '';
                if (Array.isArray(tea.ingredients)) {
                    if (typeof tea.ingredients[0] === 'object') {
                        ingredientsText = tea.ingredients.map(ing => `${ing.item}${ing.amount ? ing.amount + '克' : ''}`).join('、');
                    } else {
                        ingredientsText = tea.ingredients.join('、');
                    }
                }

                teasHtml += `
                    <div class="dish-card">
                        <div class="dish-header">
                            <span class="dish-emoji">${teaType.emoji}</span>
                            <div class="dish-title-group">
                                <h3 class="dish-name">${tea.name}</h3>
                            </div>
                        </div>

                        <div class="dish-ingredients">
                            <p class="label">🌿 配料</p>
                            <p class="value">${ingredientsText}</p>
                        </div>

                        ${tea.benefits ? `
                        <div class="dish-nutrition">
                            <span class="nutrition-badge">✨ ${tea.benefits}</span>
                        </div>
                        ` : ''}

                        ${tea.suitable ? `
                        <div class="dish-suitable">
                            <p class="label">👥 宜饮</p>
                            <p class="value">${tea.suitable}</p>
                        </div>
                        ` : ''}

                        ${tea.contraindications ? `
                        <div class="dish-suitable">
                            <p class="label">⚠️ 禁忌</p>
                            <p class="value">${tea.contraindications}</p>
                        </div>
                        ` : ''}

                        <div class="dish-recipe-section">
                            <button class="recipe-toggle-btn" onclick="app.toggleRecipe(${index})">
                                📜 查看制法
                            </button>
                            <div class="recipe-content" id="recipe-${index}" style="display: none;">
                                ${Array.isArray(tea.method) ? tea.method.map((step, i) =>
                                    `<p class="recipe-step-inline">${i + 1}. ${step}</p>`
                                ).join('') : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        teasHtml += '</div>';

        // 添加茶道评语
        if (recommendation.overallEvaluation) {
            teasHtml += `
                <div class="info-card">
                    <h3 class="card-title">📜 茶道品评</h3>
                    <div class="card-content">
                        <p><strong>茶性：</strong>${recommendation.overallEvaluation.teaNature || '未注明'}</p>
                        <p><strong>功效：</strong>${recommendation.overallEvaluation.mainEffects || '未注明'}</p>
                        <p><strong>最佳饮用时间：</strong>${recommendation.overallEvaluation.bestTime || '未注明'}</p>
                        <p style="margin-top: 12px; line-height: 1.8;">${recommendation.overallEvaluation.summary || ''}</p>
                    </div>
                </div>
            `;
        }

        // 添加推荐理由
        if (recommendation.reasoning) {
            teasHtml += `
                <div class="reasoning-card">
                    <h3 class="card-title">📜 推荐缘由</h3>
                    <div class="reasoning-content">
                        ${recommendation.reasoning.solarTerm ? `
                        <div class="reason-item">
                            <span class="reason-icon">🌸</span>
                            <div>
                                <p class="reason-label">节气茶理</p>
                                <p class="reason-text">${recommendation.reasoning.solarTerm}</p>
                            </div>
                        </div>
                        ` : ''}
                        ${recommendation.reasoning.season ? `
                        <div class="reason-item">
                            <span class="reason-icon">🍂</span>
                            <div>
                                <p class="reason-label">四时茶道</p>
                                <p class="reason-text">${recommendation.reasoning.season}</p>
                            </div>
                        </div>
                        ` : ''}
                        ${recommendation.reasoning.weather ? `
                        <div class="reason-item">
                            <span class="reason-icon">🌤️</span>
                            <div>
                                <p class="reason-label">天时调茶</p>
                                <p class="reason-text">${recommendation.reasoning.weather}</p>
                            </div>
                        </div>
                        ` : ''}
                        ${recommendation.reasoning.timePeriod ? `
                        <div class="reason-item">
                            <span class="reason-icon">⏰</span>
                            <div>
                                <p class="reason-label">时辰茶韵</p>
                                <p class="reason-text">${recommendation.reasoning.timePeriod}</p>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        // 添加茶道叮嘱
        if (recommendation.teaTips) {
            teasHtml += `
                <div class="tips-card">
                    <h3 class="card-title">💡 茶道叮嘱</h3>
                    <div class="tips-grid">
                        ${recommendation.teaTips.selection ? `
                        <div class="tip-item">
                            <span class="tip-icon">🛒</span>
                            <p><strong>选茶：</strong>${recommendation.teaTips.selection}</p>
                        </div>
                        ` : ''}
                        ${recommendation.teaTips.brewing ? `
                        <div class="tip-item">
                            <span class="tip-icon">♨️</span>
                            <p><strong>烹泡：</strong>${recommendation.teaTips.brewing}</p>
                        </div>
                        ` : ''}
                        ${recommendation.teaTips.drinking ? `
                        <div class="tip-item">
                            <span class="tip-icon">🍵</span>
                            <p><strong>饮用：</strong>${recommendation.teaTips.drinking}</p>
                        </div>
                        ` : ''}
                        ${recommendation.teaTips.storage ? `
                        <div class="tip-item">
                            <span class="tip-icon">🏺</span>
                            <p><strong>存茶：</strong>${recommendation.teaTips.storage}</p>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        recommendationContent.innerHTML = teasHtml;

        // 显示推荐理由卡片（如果有tea.reasoning字段）
        if (recommendation.items && recommendation.items.some(tea => tea.reasoning)) {
            this.displayReasoning(recommendation);
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
                    <td>总热量</td>
                    <td><strong>${nutrition.calories}</strong> 大卡</td>
                </tr>
                <tr>
                    <td>蛋白质</td>
                    <td><strong>${proteinAmount}</strong> 克 (${proteinPct}%)</td>
                </tr>
                <tr>
                    <td>脂肪</td>
                    <td><strong>${fatAmount}</strong> 克 (${fatPct}%)</td>
                </tr>
                <tr>
                    <td>碳水化合物</td>
                    <td><strong>${carbsAmount}</strong> 克 (${carbsPct}%)</td>
                </tr>
                <tr>
                    <td>维生素</td>
                    <td>${vitaminsList.join('、')}</td>
                </tr>
                <tr>
                    <td>矿物质</td>
                    <td>${mineralsList.join('、')}</td>
                </tr>
                <tr>
                    <td colspan="2"><strong>${summaryText}</strong></td>
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
