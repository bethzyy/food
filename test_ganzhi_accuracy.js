// 测试天干地支算法的准确性
const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 已知正确数据:
// 2024-01-11: 甲辰年 乙丑月 甲戌日
// 2025-01-05: 甲辰年 丁丑月 甲戌日

function testDayGanzhi() {
    console.log('=== 测试日干支算法 ===\n');

    // 测试1: 2024-01-11 应该是 甲戌日
    const date1 = new Date(2024, 0, 11);
    console.log('测试1: 2024-01-11');
    console.log('预期: 甲戌日 (甲=0, 戌=10)');

    // 尝试不同的基准日期
    const bases = [
        { name: '1900-01-01 (甲子日?)', date: new Date(1900, 0, 1), stem: 0, branch: 0 },
        { name: '1949-10-01 (甲辰日?)', date: new Date(1949, 9, 1), stem: 0, branch: 5 },
        { name: '2024-01-01 (甲辰日?)', date: new Date(2024, 0, 1), stem: 0, branch: 5 },
    ];

    bases.forEach(base => {
        const daysDiff = Math.floor((date1 - base.date) / (1000 * 60 * 60 * 24));
        const dayStemIndex = ((base.stem + daysDiff) % 10 + 10) % 10;
        const dayBranchIndex = ((base.branch + daysDiff) % 12 + 12) % 12;

        const stem = heavenlyStems[dayStemIndex];
        const branch = earthlyBranches[dayBranchIndex];
        const match = (stem === '甲' && branch === '戌') ? '✅' : '❌';

        console.log(`  ${base.name}`);
        console.log(`    差值: ${daysDiff}天`);
        console.log(`    结果: ${stem}${branch}日 ${match}`);
        console.log(`    索引: stem=${dayStemIndex}, branch=${dayBranchIndex}`);
    });

    console.log();

    // 测试2: 2025-01-05 应该是 甲戌日
    const date2 = new Date(2025, 0, 5);
    console.log('测试2: 2025-01-05');
    console.log('预期: 甲戌日 (甲=0, 戌=10)');

    const daysDiff21 = Math.floor((date2 - new Date(2024, 0, 11)) / (1000 * 60 * 60 * 24));
    console.log(`  距离2024-01-11: ${daysDiff21}天`);
    console.log(`  如果2024-01-11是甲戌(0,10), 加${daysDiff21}天:`);
    const stem21 = (0 + daysDiff21) % 10;
    const branch21 = (10 + daysDiff21) % 12;
    console.log(`    天干: (0 + ${daysDiff21}) % 10 = ${stem21} (${heavenlyStems[stem21]})`);
    console.log(`    地支: (10 + ${daysDiff21}) % 12 = ${branch21} (${earthlyBranches[branch21]})`);
    console.log(`    结果: ${heavenlyStems[stem21]}${earthlyBranches[branch21]}日`);
}

testDayGanzhi();
