// 多语言国际化系统
const i18n = {
    currentLang: 'zh', // 默认中文

    translations: {
        zh: {
            // 界面标题
            'app.title': '食疗养生',
            'app.subtitle': '顺应四时 调和阴阳',

            // 区域标题
            'section.environment': '🌸 天时地利',
            'section.meal': '🍽️ 用膳之时',
            'section.action': '🌟 饮食推荐',
            'section.result': '📜 养生良方',

            // 标签
            'label.date': '公历',
            'label.time': '时辰',
            'label.location': '地域',
            'label.weather': '天候',

            // 按钮
            'button.update': '🔄 更新',
            'button.locate': '📍 定位',
            'button.generate': '🌟 饮食推荐',
            'button.lang': '🌐 中文',

            // 餐次
            'meal.breakfast': '🌅 晨起',
            'meal.lunch': '☀️ 日中',
            'meal.dinner': '🌙 日暮',

            // 饮食类型
            'diet.regular': '🥗 日常饮食',
            'diet.medicinal': '🏮 药膳调理',
            'diet.tea': '🍵 茶饮养生',

            // 天气
            'weather.sunny': '晴',
            'weather.cloudy': '多云',
            'weather.overcast': '阴',
            'weather.rainy': '雨',
            'weather.snowy': '雪',
            'weather.foggy': '雾',
            'weather.windy': '风',
            'weather.dusty': '尘',

            // 节气相关
            'solar-term.today': '✨ 今日',
            'solar-term.tomorrow': '📅 明日',
            'solar-term.yesterday': '📅 昨日',
            'solar-term.prefix': '· ',

            // 加载提示
            'loading.generating': '正在为您开具食疗良方...',

            // 页脚
            'footer.motto': '秉承《黄帝内经》养生之道',
            'footer.ai': '由智能大模型开具',

            // 菜品标题
            'dish.title': '🍲 时令佳肴',
            'nutrition.title': '📊 营养概览',

            // 24节气
            'term.lichun': '立春',
            'term.yushui': '雨水',
            'term.jingzhe': '惊蛰',
            'term.chunfen': '春分',
            'term.qingming': '清明',
            'term.guyu': '谷雨',
            'term.lixia': '立夏',
            'term.xiaoman': '小满',
            'term.mangzhong': '芒种',
            'term.xiazhi': '夏至',
            'term.xiaoshu': '小暑',
            'term.dashu': '大暑',
            'term.liqiu': '立秋',
            'term.shuwu': '处暑',
            'term.bailu': '白露',
            'term.qiufen': '秋分',
            'term.hanlu': '寒露',
            'term.shuangjiang': '霜降',
            'term.lidong': '立冬',
            'term.xiaoxue': '小雪',
            'term.daxue': '大雪',
            'term.dongzhi': '冬至',
            'term.xiaohan': '小寒',
            'term.dahan': '大寒',

            // 天干地支
            'ganzhi.year': '年',
            'ganzhi.month': '月',
            'ganzhi.day': '日',
            'ganzhi.hour': '时',

            // 位置和天气(中文保持不变)
            'location.beijing': '北京',
            'location.shanghai': '上海',
            'location.guangzhou': '广州',
            'location.shenzhen': '深圳',
            'location.hangzhou': '杭州',
            'location.chengdu': '成都',
            'location.chongqing': '重庆',
            'location.wuhan': '武汉',
            'location.xian': '西安',
            'location.nanjing': '南京',
            'location.suzhou': '苏州',
            'location.tianjin': '天津',
            'location.changsha': '长沙',
            'location.zhengzhou': '郑州',
            'location.jinan': '济南',
            'location.qingdao': '青岛',
            'location.dalian': '大连',
            'location.shenyang': '沈阳',
            'location.harbin': '哈尔滨',
            'location.kunming': '昆明',
            'location.xiamen': '厦门',
            'location.fuzhou': '福州',
            'location.nanning': '南宁',
            'location.guiyang': '贵阳',
            'location.lanzhou': '兰州',
            'location.taiyuan': '太原',
            'location.nanchang': '南昌',
            'location.hefei': '合肥',
            'location.wulumuqi': '乌鲁木齐',
            'location.lasa': '拉萨',
            'location.haikou': '海口',
            'location.sanya': '三亚',
        },

        en: {
            // 界面标题
            'app.title': 'Dietary Wellness',
            'app.subtitle': 'Harmonize with Nature\'s Rhythm',

            // 区域标题
            'section.environment': '🌸 Heavenly Timing & Earthly Advantage',
            'section.meal': '🍽️ Meal Time',
            'section.action': '🌟 Dietary Recommendation',
            'section.result': '📜 Wellness Prescription',

            // 标签
            'label.date': 'Date',
            'label.time': 'Time',
            'label.location': 'Location',
            'label.weather': 'Weather',

            // 按钮
            'button.update': '🔄 Update',
            'button.locate': '📍 Locate',
            'button.generate': '🌟 Get Recommendation',
            'button.lang': '🌐 English',

            // 餐次
            'meal.breakfast': '🌅 Morning',
            'meal.lunch': '☀️ Noon',
            'meal.dinner': '🌙 Evening',

            // 饮食类型
            'diet.regular': '🥗 Daily Diet',
            'diet.medicinal': '🏮 Medicinal Diet',
            'diet.tea': '🍵 Tea Wellness',

            // 天气
            'weather.sunny': 'Sunny',
            'weather.cloudy': 'Cloudy',
            'weather.overcast': 'Overcast',
            'weather.rainy': 'Rainy',
            'weather.snowy': 'Snowy',
            'weather.foggy': 'Foggy',
            'weather.windy': 'Windy',
            'weather.dusty': 'Dusty',

            // 节气相关
            'solar-term.today': '✨ Today\'s',
            'solar-term.tomorrow': '📅 Tomorrow\'s',
            'solar-term.yesterday': '📅 Yesterday\'s',
            'solar-term.prefix': '· ',

            // 加载提示
            'loading.generating': 'Prescribing your dietary wellness...',

            // 页脚
            'footer.motto': 'Based on the Yellow Emperor\'s Inner Canon',
            'footer.ai': 'Powered by AI Model',

            // 菜品标题
            'dish.title': '🍲 Seasonal Delicacies',
            'nutrition.title': '📊 Nutrition Overview',

            // 24节气 (标准翻译)
            'term.lichun': 'Beginning of Spring',
            'term.yushui': 'Rain Water',
            'term.jingzhe': 'Awakening of Insects',
            'term.chunfen': 'Spring Equinox',
            'term.qingming': 'Pure Brightness',
            'term.guyu': 'Grain Rain',
            'term.lixia': 'Beginning of Summer',
            'term.xiaoman': 'Grain Buds',
            'term.mangzhong': 'Grain in Ear',
            'term.xiazhi': 'Summer Solstice',
            'term.xiaoshu': 'Minor Heat',
            'term.dashu': 'Major Heat',
            'term.liqiu': 'Beginning of Autumn',
            'term.shuwu': 'Limit of Heat',
            'term.bailu': 'White Dew',
            'term.qiufen': 'Autumn Equinox',
            'term.hanlu': 'Cold Dew',
            'term.shuangjiang': 'Frost\'s Descent',
            'term.lidong': 'Beginning of Winter',
            'term.xiaoxue': 'Minor Snow',
            'term.daxue': 'Major Snow',
            'term.dongzhi': 'Winter Solstice',
            'term.xiaohan': 'Minor Cold',
            'term.dahan': 'Major Cold',

            // 天干地支
            'ganzhi.year': 'Year',
            'ganzhi.month': 'Month',
            'ganzhi.day': 'Day',
            'ganzhi.hour': 'Hour',

            // 位置和天气
            'location.beijing': 'Beijing',
            'location.shanghai': 'Shanghai',
            'location.guangzhou': 'Guangzhou',
            'location.shenzhen': 'Shenzhen',
            'location.hangzhou': 'Hangzhou',
            'location.chengdu': 'Chengdu',
            'location.chongqing': 'Chongqing',
            'location.wuhan': 'Wuhan',
            'location.xian': 'Xi\'an',
            'location.nanjing': 'Nanjing',
            'location.suzhou': 'Suzhou',
            'location.tianjin': 'Tianjin',
            'location.changsha': 'Changsha',
            'location.zhengzhou': 'Zhengzhou',
            'location.jinan': 'Jinan',
            'location.qingdao': 'Qingdao',
            'location.dalian': 'Dalian',
            'location.shenyang': 'Shenyang',
            'location.harbin': 'Harbin',
            'location.kunming': 'Kunming',
            'location.xiamen': 'Xiamen',
            'location.fuzhou': 'Fuzhou',
            'location.nanning': 'Nanning',
            'location.guiyang': 'Guiyang',
            'location.lanzhou': 'Lanzhou',
            'location.taiyuan': 'Taiyuan',
            'location.nanchang': 'Nanchang',
            'location.hefei': 'Hefei',
            'location.wulumuqi': 'Urumqi',
            'location.lasa': 'Lhasa',
            'location.haikou': 'Haikou',
            'location.sanya': 'Sanya',
        }
    },

    // 获取翻译文本
    t(key) {
        return this.translations[this.currentLang][key] || key;
    },

    // 切换语言
    setLanguage(lang) {
        this.currentLang = lang;
        this.updateUI();
        this.savePreference();
    },

    // 更新界面
    updateUI() {
        // 更新所有带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            el.textContent = translation;
        });

        // 更新语言切换按钮 - 只显示图标
        const langBtn = document.getElementById('langToggleBtn');
        if (langBtn) {
            langBtn.textContent = '🌐';
        }

        // 更新位置下拉选项
        const locationSelect = document.getElementById('locationSelect');
        if (locationSelect) {
            const currentValue = locationSelect.value;
            Array.from(locationSelect.options).forEach(option => {
                const cityKey = 'location.' + option.value.toLowerCase();
                const translation = this.t(cityKey);
                if (translation && translation !== cityKey) {
                    option.textContent = translation;
                }
            });
            locationSelect.value = currentValue;
        }

        // 触发自定义事件,通知其他组件更新
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.currentLang } }));
    },

    // 保存语言偏好
    savePreference() {
        localStorage.setItem('appLanguage', this.currentLang);
    },

    // 加载语言偏好
    loadPreference() {
        const saved = localStorage.getItem('appLanguage');
        if (saved && (saved === 'zh' || saved === 'en')) {
            this.currentLang = saved;
        }
    },

    // 节气名称翻译
    translateSolarTerm(termName) {
        const termKey = 'term.' + Object.keys(this.translations.zh).find(key =>
            key.startsWith('term.') && this.translations.zh[key] === termName
        );
        return this.t(termKey);
    }
};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    i18n.loadPreference();
    i18n.updateUI();
});
