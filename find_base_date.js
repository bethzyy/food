// 反推正确的日干支基准日期
const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 已知: 2024-01-11 是 甲戌日
// 目标: 找一个基准日期(甲子日),使得从基准到2024-01-11的日数计算出甲戌

function findBaseDate() {
    const targetDate = new Date(2024, 0, 11);
    const targetStem = heavenlyStems.indexOf('甲'); // 0
    const targetBranch = earthlyBranches.indexOf('戌'); // 10

    console.log('=== 寻找正确的日干支基准日期 ===\n');
    console.log(`目标日期: 2024-01-11`);
    console.log(`目标干支: 甲戌日`);
    console.log(`目标索引: stem=${targetStem}, branch=${targetBranch}\n`);

    // 如果基准是甲子日(0,0)
    // 那么: (0 + days) % 10 = 0 (甲)
    //      (0 + days) % 12 = 10 (戌)
    // 所以 days 必须是 10的倍数,且 days % 12 = 10

    // 最小的满足条件的正整数是 10
    // 10 % 10 = 0, 10 % 12 = 10 ✅

    // 所以基准应该是 2024-01-11 往前推 10*n 天
    // 假设我们找一个近期基准,比如 n=1, 那就是往前推10天

    console.log('方案1: 假设基准是甲子日(0,0)');
    const base1 = new Date(2024, 0, 1); // 2024-01-01
    const diff1 = Math.floor((targetDate - base1) / (1000 * 60 * 60 * 24));
    console.log(`  基准: 2024-01-01`);
    console.log(`  差值: ${diff1}天`);
    console.log(`  验证:`);
    console.log(`    天干: (0 + ${diff1}) % 10 = ${diff1 % 10} (${heavenlyStems[diff1 % 10]})`);
    console.log(`    地支: (0 + ${diff1}) % 12 = ${diff1 % 12} (${earthlyBranches[diff1 % 12]})`);

    // 让我们找一个更简单的基准
    // 我们知道 2024-01-11 是 甲戌日
    // 如果我们找一个最近的甲子日,它应该满足:
    // 甲戌(0,10) - x天 = 甲子(0,0)
    // 所以 x % 10 = 0, x % 12 = 10
    // 最小的x是10

    console.log('\n方案2: 从2024-01-11往前推最近的甲子日');
    // 甲戌(0,10) 往前推10天 = 甲子(0,0)
    const base2 = new Date(2024, 0, 11);
    base2.setDate(base2.getDate() - 10);
    console.log(`  最近的甲子日: ${base2.toISOString().split('T')[0]}`);
    console.log(`  验证: 甲戌日往前10天应该是甲子日`);

    // 再往前推60天(一个甲子周期)
    const base3 = new Date(base2);
    base3.setDate(base3.getDate() - 60);
    console.log(`  再往前60天: ${base3.toISOString().split('T')[0]}`);

    console.log('\n方案3: 查找1900年的甲子日');
    // 1900-01-01 通常是甲辰年,但日干支呢?
    // 让我们尝试: 假设1900-01-31是甲子日
    const testBase = new Date(1900, 0, 31);
    const testDiff = Math.floor((targetDate - testBase) / (1000 * 60 * 60 * 24));
    const testStem = (testDiff) % 10;
    const testBranch = (testDiff) % 12;
    console.log(`  假设1900-01-31是甲子日:`);
    console.log(`    差值: ${testDiff}天`);
    console.log(`    天干索引: ${testStem} (${heavenlyStems[testStem]})`);
    console.log(`    地支索引: ${testBranch} (${earthlyBranches[testBranch]})`);
    console.log(`    结果: ${heavenlyStems[testStem]}${earthlyBranches[testBranch]}日`);
    const match = (testStem === 0 && testBranch === 10) ? '✅ 正确!' : '❌ 不对';
    console.log(`    ${match}`);

    // 尝试 1900-01-01
    const testBase2 = new Date(1900, 0, 1);
    const testDiff2 = Math.floor((targetDate - testBase2) / (1000 * 60 * 60 * 24));
    // 如果1900-01-01的日干支是(stem, branch),那么:
    // (stem + diff) % 10 = 0
    // (branch + diff) % 12 = 10
    // stem = (0 - diff) % 10 = (10 - (diff % 10)) % 10
    // branch = (10 - diff) % 12 = (22 - (diff % 12)) % 12
    const base2Stem = (10 - (testDiff2 % 10)) % 10;
    const base2Branch = (22 - (testDiff2 % 12)) % 12;
    console.log(`\n  反推1900-01-01的日干支:`);
    console.log(`    差值: ${testDiff2}天`);
    console.log(`    天干: ${base2Stem} (${heavenlyStems[base2Stem]})`);
    console.log(`    地支: ${base2Branch} (${earthlyBranches[base2Branch]})`);
    console.log(`    1900-01-01应该是: ${heavenlyStems[base2Stem]}${earthlyBranches[base2Branch]}日`);
}

findBaseDate();
