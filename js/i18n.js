const S = {
  en: {
    // Tabs
    stats: 'Stats', pattern: 'Pattern', log: 'Log', growth: 'Growth', parents: 'Parents',
    // Header
    daysOld: d => `${d} days old`,
    // Stats tab
    weekly: 'Weekly',
    weekAvg: 'Week averages',
    feedsDay: 'feeds / day', sleepDay: 'sleep / day',
    poopDay: 'poop / day', peeDay: 'pee / day',
    formulaNote: (ml) => `Total formula this week: ${ml} ml`,
    partialNote: 'Today is partial',
    dailyTrends: 'Daily trends',
    feeds: 'Feeds', sleepH: 'Sleep (h)', poop: 'Poop', pee: 'Pee',
    // Pattern tab
    activityPattern: 'Activity pattern',
    nDays: n => `${n} days`,
    sleepLbl: 'Sleep', feedLbl: 'Feed', skinLbl: 'Skin',
    formulaLbl: 'formula', tummyLbl: 'tummy', bathLbl: 'bath',
    feedsPerDay: 'feeds / day', avgSleep: 'avg sleep', wakeWindow: 'wake window',
    predictionLbl: 'Prediction',
    // Log tab
    today: 'today',
    partial: '(partial)',
    // Growth tab
    latest: 'Latest', sinceBirth: 'Since birth', whoPercentile: 'WHO %ile',
    weightLbl: 'Weight', lengthLbl: 'Length',
    atBirth: 'at birth', approxP: 'Approx. P85 for girls · updated at checkups',
    weightLog: 'Weight log', birth: 'Birth',
    whoRef: 'WHO reference · girls · 0–14 days',
    todayLine: 'today',
    // Parents tab
    weightJourney: 'Weight journey',
    current: 'Current', lost: 'Lost', progress: 'Progress',
    daysToGoal: d => `~${d} days to goal`,
    goal: 'goal',
    notStarted: 'Not started yet',
    // Upload
    upload: 'Upload',
    // Months (for date formatting)
    months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    // Log event text
    fed: 'fed', breastfed: 'breastfed',
  },
  zh: {
    // Tabs
    stats: '统计', pattern: '规律', log: '日志', growth: '发育', parents: '父母',
    // Header
    daysOld: d => `出生${d}天`,
    // Stats tab
    weekly: '本周',
    weekAvg: '周平均',
    feedsDay: '喂奶 / 天', sleepDay: '睡眠 / 天',
    poopDay: '大便 / 天', peeDay: '小便 / 天',
    formulaNote: (ml) => `本周奶粉总量: ${ml} ml`,
    partialNote: '今日数据不完整',
    dailyTrends: '每日趋势',
    feeds: '喂奶', sleepH: '睡眠 (h)', poop: '大便', pee: '小便',
    // Pattern tab
    activityPattern: '活动规律',
    nDays: n => `${n}天`,
    sleepLbl: '睡眠', feedLbl: '喂奶', skinLbl: '肤接触',
    formulaLbl: '奶粉', tummyLbl: '趴趴', bathLbl: '洗澡',
    feedsPerDay: '喂奶 / 天', avgSleep: '平均睡眠', wakeWindow: '清醒窗口',
    predictionLbl: '预测',
    // Log tab
    today: '今天',
    partial: '(不完整)',
    // Growth tab
    latest: '最新', sinceBirth: '出生以来', whoPercentile: 'WHO百分位',
    weightLbl: '体重', lengthLbl: '身长',
    atBirth: '出生时', approxP: '女婴约P85 · 体检时更新',
    weightLog: '体重记录', birth: '出生',
    whoRef: 'WHO参考 · 女婴 · 0–14天',
    todayLine: '今天',
    // Parents tab
    weightJourney: '体重历程',
    current: '当前', lost: '已减', progress: '进度',
    daysToGoal: d => `约${d}天达标`,
    goal: '目标',
    notStarted: '尚未开始',
    // Upload
    upload: '上传',
    // Months
    months: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    // Log event text
    fed: '喂奶', breastfed: '母乳',
  },
};

/** Get translated string. If value is a function, return the function itself. */
export function t(key) {
  const lang = document.body.dataset.lang || 'en';
  return S[lang]?.[key] ?? S.en[key] ?? key;
}

export function getLang() {
  return document.body.dataset.lang || 'en';
}

/** Format a day-of-month date label respecting current language. */
export function fmtDate(month, day) {
  const months = t('months');
  return `${months[month]}${getLang() === 'zh' ? '' : ' '}${day}`;
}

/** Format "May 16" style from a Date or from month index + day. */
export function fmtDayLabel(daysSinceBirth) {
  const d = new Date('2026-05-12');
  d.setDate(d.getDate() + daysSinceBirth);
  return fmtDate(d.getMonth(), d.getDate());
}
