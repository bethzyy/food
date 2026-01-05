// 测试天干地支和农历计算
const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

function calculateGanzhi(date, hours) {
    const year = date.getFullYear();

    // 年干支 - 以立春为界(简化:2月4日前后)
    // 立春大约在2月4日,所以1月到2月3日用上一年,2月4日起用新的一年
    const isBeforeLichun = (date.getMonth() === 0) ||
                           (date.getMonth() === 1 && date.getDate() < 4);

    const ganzhiYear = isBeforeLichun ? year - 1 : year;

    const yearStemIndex = ((ganzhiYear - 4) % 10 + 10) % 10;
    const yearBranchIndex = ((ganzhiYear - 4) % 12 + 12) % 12;

    // 月干支
    const month = date.getMonth() + 1;
    const monthBranchIndex = (month + 1) % 12;
    const monthStemIndex = ((yearStemIndex * 2 + month) % 10 + 10) % 10;

    // 日干支（基准：1949年10月1日 = 甲辰日，不是甲子日！）
    // 让我重新验证基准日期
    // 2024年1月1日应该查一下
    const baseDate = new Date(2024, 0, 1);  // 2024年1月1日
    const daysDiff = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));

    // 2024年1月1日是甲辰日(验证需要)
    // 甲(0) 辰(5) -> 索引: 甲=0, 辰=5
    // 假设2024-01-01是甲辰日,倒推
    const dayStemIndex = ((0 + daysDiff) % 10 + 10) % 10;
    const dayBranchIndex = ((5 + daysDiff) % 12 + 12) % 12;

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
    // 基准：2024年1月11日 = 农历2023年腊月初一 (准确)
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

// 测试已知日期
console.log('\n=== 测试天干地支 ===');
const testDates = [
    { date: '2024-01-11', expected: '2023年腊月初一', expectedYear: '甲辰年' },
    { date: '2024-02-10', expectedYear: '甲辰年', note: '春节前后' },
    { date: '2025-01-05', expectedYear: '甲辰年', note: '小寒-春节前' },
    { date: '2025-02-05', expectedYear: '乙巳年', note: '立春后' },
    { date: '2024-06-10', note: '端午节大概' },
    { date: '2024-09-17', note: '中秋节大概' }
];

testDates.forEach(test => {
    const date = new Date(test.date);
    const ganzhi = calculateGanzhi(date, 12);
    const lunar = solarToLunar(date);

    const yearMatch = test.expectedYear && ganzhi.year === test.expectedYear ? '✅' : '❌';
    const lunarMatch = test.expected && lunar.display === test.expected ? '✅' : '❌';

    console.log(`\n${test.date}: ${test.note || ''}`);
    console.log(`  天干地支: ${ganzhi.year} ${ganzhi.month} ${ganzhi.day} ${yearMatch}`);
    console.log(`  农历: ${lunar.display} ${lunarMatch}`);
    if (test.expected) console.log(`  预期: ${test.expected} ${lunarMatch}`);
});

// 验证2025年1月5日
console.log('\n=== 重点验证 ===');
const date1 = new Date('2025-01-05');
const ganzhi1 = calculateGanzhi(date1, 12);
console.log(`2025-01-05 (小寒): ${ganzhi1.year} - 应该是甲辰年(春节前)`);
console.log(`  Ganzhi year used: ${ganzhi1.ganzhiYear}`);

const date2 = new Date('2025-02-05');
const ganzhi2 = calculateGanzhi(date2, 12);
console.log(`2025-02-05 (立春后): ${ganzhi2.year} - 应该是乙巳年(春节后)`);
console.log(`  Ganzhi year used: ${ganzhi2.ganzhiYear}`);

