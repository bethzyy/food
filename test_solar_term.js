// 测试节气计算
const { Solar, Lunar } = require('./lunar-javascript.js');

console.log('=== 测试节气计算 ===\n');

const testDates = [
    new Date(2026, 0, 4),  // 1月4日
    new Date(2026, 0, 5),  // 1月5日 小寒
    new Date(2026, 0, 6),  // 1月6日
    new Date(2026, 0, 7),  // 1月7日
    new Date(2026, 0, 8),  // 1月8日
];

testDates.forEach(date => {
    const dateStr = date.toISOString().split('T')[0];
    console.log(`\n--- 测试日期: ${dateStr} ---`);

    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();

    console.log('农历:', lunar.toString());

    // 获取上一个节气
    try {
        const prevJie = lunar.getPrevJie(false);
        if (prevJie) {
            const prevJieStr = prevJie.toString();
            const match = prevJieStr.match(/(\d{4})-(\d{2})-(\d{2})/);
            if (match) {
                const prevJieDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
                const daysDiff = Math.floor((date - prevJieDate) / (1000 * 60 * 60 * 24));

                console.log('上一个节气:', prevJie.getName());
                console.log('节气日期:', prevJieStr);
                console.log('距离:', daysDiff, '天');

                let display = '';
                if (daysDiff === 0) {
                    display = `✨ 今日${prevJie.getName()} ✨`;
                } else if (daysDiff === 1) {
                    display = `📅 昨日${prevJie.getName()}`;
                } else if (daysDiff === 2) {
                    display = `📅 前日${prevJie.getName()}`;
                } else if (daysDiff >= 0 && daysDiff <= 14) {
                    display = `(距离上一个节气${daysDiff}天,超过2天不显示)`;
                } else {
                    display = `(距离上一个节气${daysDiff}天)`;
                }
                console.log('显示结果:', display);
            }
        }
    } catch(e) {
        console.log('错误:', e.message);
    }

    // 获取下一个节气
    try {
        const nextJie = lunar.getNextJie(false);
        if (nextJie) {
            const nextJieStr = nextJie.toString();
            const match = nextJieStr.match(/(\d{4})-(\d{2})-(\d{2})/);
            if (match) {
                const nextJieDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
                const daysDiff = Math.floor((nextJieDate - date) / (1000 * 60 * 60 * 24));

                console.log('下一个节气:', nextJie.getName());
                console.log('节气日期:', nextJieStr);
                console.log('距离:', daysDiff, '天');

                if (daysDiff >= 0 && daysDiff <= 2) {
                    let display = '';
                    if (daysDiff === 0) {
                        display = `✨ 今日${nextJie.getName()} ✨`;
                    } else if (daysDiff === 1) {
                        display = `📅 明日${nextJie.getName()}`;
                    } else if (daysDiff === 2) {
                        display = `📅 后日${nextJie.getName()}`;
                    }
                    console.log('显示结果(下一个节气):', display);
                }
            }
        }
    } catch(e) {
        console.log('错误:', e.message);
    }
});

console.log('\n=== 测试完成 ===');
