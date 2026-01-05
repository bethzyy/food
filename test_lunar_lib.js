// 测试lunar-javascript库
// 验证2026年1月5日的农历计算

const testDate = new Date(2026, 0, 5); // 2026年1月5日

console.log('=== 测试lunar-javascript库 ===');
console.log(`测试日期: ${testDate.toISOString().split('T')[0]}`);
console.log(`预期: 乙巳年 冬月十七 (十一月十七)`);
console.log();

try {
    // 使用lunar库
    const solar = Solar.fromDate(testDate);
    const lunar = solar.getLunar();

    console.log('lunar库计算结果:');
    console.log(`  农历年: ${lunar.getYear()}`);
    console.log(`  农历月: ${lunar.getMonth()}`);
    console.log(`  农历日: ${lunar.getDay()}`);
    console.log(`  闰月: ${lunar.getLeapMonth()}`);

    // 获取月份名称
    const lunarMonthNames = [
        '正月', '二月', '三月', '四月', '五月', '六月',
        '七月', '八月', '九月', '十月', '冬月', '腊月'
    ];

    let monthDisplay = lunarMonthNames[lunar.getMonth() - 1];
    if (lunar.getLeapMonth() === lunar.getMonth()) {
        monthDisplay = '闰' + monthDisplay;
    }

    const lunarDayNames = [
        '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
        '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
        '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
    ];

    const result = `${lunar.getYear()}年${monthDisplay}${lunarDayNames[lunar.getDay() - 1]}`;
    console.log(`  结果: ${result}`);
    console.log();

    // 八字
    const eightChar = lunar.getEightChar();
    console.log('天干地支:');
    console.log(`  年: ${eightChar.getYear()}`);
    console.log(`  月: ${eightChar.getMonth()}`);
    console.log(`  日: ${eightChar.getDay()}`);

} catch (error) {
    console.error('错误:', error.message);
    console.log('Solar对象不可用,请检查lunar库是否正确加载');
}
