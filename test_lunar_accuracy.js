// 测试农历计算的准确性
// 已知正确数据(从万年历网站查询):
// 2024-01-11 = 农历2023年腊月初一
// 2025-01-05 = 农历2024年腊月初六

function testLunarCalculation() {
    console.log('=== 农历计算测试 ===\n');

    // 基准: 2024-01-11 = 农历2023年腊月初一
    const baseDate = new Date(2024, 0, 11);
    const baseLunarYear = 2023;
    const baseLunarMonth = 12;
    const baseLunarDay = 1;

    const testDates = [
        { date: '2024-01-11', expectedYear: 2023, expectedMonth: 12, expectedDay: 1, expectedStr: '2023年腊月初一' },
        { date: '2025-01-05', expectedYear: 2024, expectedMonth: 12, expectedDay: 6, expectedStr: '2024年腊月初六' },
        { date: '2024-02-10', expectedYear: 2024, expectedMonth: 1, expectedDay: 1, expectedStr: '2024年正月初一' }, // 春节
    ];

    testDates.forEach(test => {
        const date = new Date(test.date);
        const diffDays = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));

        console.log(`${test.date} (距基准${diffDays}天)`);

        // 当前简化算法
        let lunarYear = baseLunarYear;
        let lunarMonth = baseLunarMonth;
        let lunarDay = baseLunarDay + diffDays;

        // 简化:农历月大月30天，小月29天
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

        const result = `${lunarYear}年${lunarMonthNames[lunarMonth - 1]}${lunarDayNames[dayIndex]}`;
        const match = result === test.expectedStr ? '✅' : '❌';

        console.log(`  计算结果: ${result}`);
        console.log(`  预期结果: ${test.expectedStr} ${match}`);
        console.log(`  年月日: ${lunarYear}-${lunarMonth}-${lunarDay} vs ${test.expectedYear}-${test.expectedMonth}-${test.expectedDay}`);

        // 分析问题
        if (result !== test.expectedStr) {
            const dayDiff = lunarDay - test.expectedDay;
            const monthDiff = (lunarYear * 12 + lunarMonth) - (test.expectedYear * 12 + test.expectedMonth);
            console.log(`  误差: ${monthDiff}个月${dayDiff}天`);
        }
        console.log();
    });
}

testLunarCalculation();
