// 验证1949-10-01基准
const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

function verify1949Base() {
    console.log('=== 验证基准: 1949-10-01 = 甲子日 ===\n');

    const baseDate = new Date(1949, 9, 1);

    const testDates = [
        { date: '2024-01-11', expected: '甲戌日', note: '基准测试' },
        { date: '2025-01-05', expected: '甲戌日', note: '小寒' },
        { date: '2024-02-10', expected: '甲戌日', note: '春节(大概)' },
    ];

    testDates.forEach(test => {
        const date = new Date(test.date);
        const daysDiff = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));
        const dayStemIndex = ((0 + daysDiff) % 10 + 10) % 10;
        const dayBranchIndex = ((0 + daysDiff) % 12 + 12) % 12;
        const stem = heavenlyStems[dayStemIndex];
        const branch = earthlyBranches[dayBranchIndex];
        const result = `${stem}${branch}日`;
        const match = result === test.expected ? '✅' : '❌';

        console.log(`${test.date} ${test.note}`);
        console.log(`  差值: ${daysDiff}天`);
        console.log(`  天干: ${dayStemIndex} (${stem}), 地支: ${dayBranchIndex} (${branch})`);
        console.log(`  结果: ${result} ${match}`);
        console.log(`  预期: ${test.expected}`);
        console.log();
    });
}

verify1949Base();
