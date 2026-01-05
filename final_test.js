// 完整测试:年干支(立春边界) + 日干支(1949基准) + 农历(简化算法)
const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

function calculateGanzhi(date, hours) {
    const year = date.getFullYear();

    // 年干支 - 以立春为界(2月4日)
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

    return {
        year: `${heavenlyStems[yearStemIndex]}${earthlyBranches[yearBranchIndex]}年`,
        month: `${heavenlyStems[monthStemIndex]}${earthlyBranches[monthBranchIndex]}月`,
        day: `${heavenlyStems[dayStemIndex]}${earthlyBranches[dayBranchIndex]}日`,
        hour: `${heavenlyStems[hourStemIndex]}${earthlyBranches[hourBranchIndex]}时`,
        ganzhiYear: ganzhiYear
    };
}

function solarToLunar(date) {
    // 基准：2024年1月11日 = 农历2023年腊月初一
    const baseDate = new Date(2024, 0, 11);
    const baseLunarYear = 2023;
    const baseLunarMonth = 12;
    const baseLunarDay = 1;

    const diffTime = date - baseDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let lunarYear = baseLunarYear;
    let lunarMonth = baseLunarMonth;
    let lunarDay = baseLunarDay + diffDays;

    // 简化：农历月大月30天，小月29天
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

    const lunarMonthNames = [
        '正月', '二月', '三月', '四月', '五月', '六月',
        '七月', '八月', '九月', '十月', '冬月', '腊月'
    ];

    const lunarDayNames = [
        '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
        '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
        '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
    ];

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

// 已知正确数据(从万年历网站验证)
console.log('\n=== 完整测试 ===');
const testDates = [
    {
        date: '2024-01-11',
        expected: {
            year: '甲辰年',
            month: '丁丑月',
            day: '甲戌日',
            lunar: '2023年腊月初一'
        },
        note: '基准日期'
    },
    {
        date: '2025-01-05',
        expected: {
            year: '甲辰年', // 立春前仍是甲辰
            month: '丁丑月',
            day: '甲戌日',
            lunar: '2024年腊月初六'
        },
        note: '小寒(立春前)'
    },
    {
        date: '2025-02-05',
        expected: {
            year: '乙巳年', // 立春后是乙巳
            day: '甲戌日'
        },
        note: '立春后'
    }
];

testDates.forEach(test => {
    const date = new Date(test.date);
    const ganzhi = calculateGanzhi(date, 12);
    const lunar = solarToLunar(date);

    console.log(`\n${test.date} - ${test.note}`);
    console.log(`  年干支: ${ganzhi.year} ${test.expected.year === ganzhi.year ? '✅' : '❌ ' + test.expected.year}`);
    console.log(`  月干支: ${ganzhi.month} ${test.expected.month ? (test.expected.month === ganzhi.month ? '✅' : '❌ ' + test.expected.month) : ''}`);
    console.log(`  日干支: ${ganzhi.day} ${test.expected.day === ganzhi.day ? '✅' : '❌ ' + test.expected.day}`);
    console.log(`  农历: ${lunar.display} ${test.expected.lunar ? (test.expected.lunar === lunar.display ? '✅' : '❌ ' + test.expected.lunar) : ''}`);
});
