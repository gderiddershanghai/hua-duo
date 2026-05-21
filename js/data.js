// ===== Baby config =====
export const BABY = {
  name: '花朵',
  dob: '2026-05-12',
  birthWeight: 4.25,   // kg
  birthLength: 51,      // cm
};

// ===== Weekly daily summaries (May 15–20, from yuesao notes) =====
export const WEEKLY = [
  { day: 16, label: '16', feeds: 9,  formulaMl: 90, poops: 5, pees: 10, sleepH: 14.0 },
  { day: 17, label: '17', feeds: 8,  formulaMl: 0,  poops: 4, pees: 8,  sleepH: 14.0 },
  { day: 18, label: '18', feeds: 7,  formulaMl: 30, poops: 4, pees: 7,  sleepH: 15.5 },
  { day: 19, label: '19', feeds: 8,  formulaMl: 0,  poops: 3, pees: 8,  sleepH: 14.8 },
  { day: 20, label: '20', feeds: 7,  formulaMl: 0,  poops: 2, pees: 7,  sleepH: 12.5, partial: true },
];

// ===== Activity pattern (May 15–20) =====
// feeds: 30 min (0.5h) each. skin/bath from parent input.
export const PATTERN = [
  {
    label: 'May 16', day: 4,
    sleeps:  [[0, 0.75], [1.75, 4.4], [5.4, 8.4], [9.4, 10.3], [12.7, 13.4], [14.4, 16.3], [19.3, 20.2], [21.2, 22.7], [23.7, 24]],
    feeds:   [
      {h: 1.0, dur: 0.5, formula: 30},
      {h: 4.67, dur: 0.5, formula: 30},
      {h: 8.63, dur: 0.5, formula: null},
      {h: 11.92, dur: 0.5, formula: null},
      {h: 13.63, dur: 0.5, formula: null},
      {h: 16.52, dur: 0.5, formula: null},
      {h: 18.55, dur: 0.5, formula: null},
      {h: 20.47, dur: 0.5, formula: 30},
      {h: 22.92, dur: 0.5, formula: null},
    ],
    skin: [{h: 10.5, dur: 1.5}],              // 10:30–12:00
    markers: [{h: 10.5, emoji: '🛁'}],         // bath within skin window
  },
  {
    label: 'May 17', day: 5,
    sleeps:  [[0, 2.1], [3.1, 6.4], [7.4, 9.75], [10.75, 11.1], [13.6, 15.2], [16.2, 17.9], [18.9, 21.1], [23.6, 24]],
    feeds:   [
      {h: 2.33, dur: 0.5, formula: null},
      {h: 6.67, dur: 0.5, formula: null},
      {h: 10.0, dur: 0.5, formula: null},
      {h: 12.83, dur: 0.5, formula: null},
      {h: 15.47, dur: 0.5, formula: null},
      {h: 18.18, dur: 0.5, formula: null},
      {h: 21.35, dur: 0.5, formula: null},
      {h: 22.83, dur: 0.5, formula: null},
    ],
    skin: [{h: 11.25, dur: 1.25}],            // 11:15–12:30
    markers: [{h: 11.17, emoji: '🛁'}],        // bath at 11:10
  },
  {
    label: 'May 18', day: 6,
    sleeps:  [[0, 1.6], [2.6, 7.0], [8.0, 10.75], [12.25, 13.5], [14.5, 15.75], [17.75, 20.5], [21.5, 22.25], [23.25, 24]],
    feeds:   [
      {h: 1.85, dur: 0.5, formula: 30},
      {h: 7.23, dur: 0.5, formula: null},
      {h: 11.0, dur: 0.5, formula: null},
      {h: 13.75, dur: 0.5, formula: null},
      {h: 17.0, dur: 0.5, formula: null},
      {h: 20.73, dur: 0.5, formula: null},
      {h: 22.5, dur: 0.5, formula: null},
    ],
    skin: [{h: 11.0, dur: 1.0}, {h: 16.0, dur: 1.25}],
    markers: [{h: 11.0, emoji: '🛁'}],         // bath within morning skin
  },
  {
    label: 'May 19', day: 7,
    sleeps:  [[1.0, 4.75], [5.75, 8.08], [9.08, 11.42], [13.5, 15.33], [17.5, 18.25], [19.25, 22.75], [23.75, 24]],
    feeds:   [
      {h: 0.22, dur: 0.5, formula: null},
      {h: 5.0,  dur: 0.5, formula: null},
      {h: 8.33, dur: 0.5, formula: null},
      {h: 11.67, dur: 0.5, formula: null},
      {h: 12.75, dur: 0.5, formula: null},
      {h: 15.58, dur: 0.5, formula: null},
      {h: 18.5,  dur: 0.5, formula: null},
      {h: 23.0,  dur: 0.5, formula: null},
    ],
    skin: [{h: 16.0, dur: 1.25}],
    markers: [{h: 16.0, emoji: '🛁'}],         // bath within skin window
  },
  {
    label: 'May 20', day: 8,
    partial: true,
    sleeps:  [[0, 2.58], [3.58, 6.05], [7.05, 9.15], [10.15, 10.5], [13.25, 14.18], [15.18, 16.72], [17.72, 20.25]],
    feeds:   [
      {h: 2.83,  dur: 0.5, formula: null},
      {h: 6.3,   dur: 0.5, formula: null},
      {h: 9.4,   dur: 0.5, formula: null},
      {h: 12.5,  dur: 0.5, formula: null},
      {h: 14.43, dur: 0.5, formula: null},
      {h: 16.97, dur: 0.5, formula: null},
      {h: 20.5,  dur: 0.5, formula: null},
    ],
    skin: [{h: 10.5, dur: 1.75}],
    markers: [{h: 10.5, emoji: '🛁'}],         // bath within skin window
  },
];

// ===== Weight / growth log =====
export const WEIGHT = [
  { day: 0, label: 'May 12', weight: 4.25, length: 51 },
  { day: 2, label: 'May 14', weight: 3.90 },
  { day: 6, label: 'May 18', weight: 4.20 },
  { day: 7, label: 'May 19', weight: 4.30 },
  { day: 8, label: 'May 20', weight: 4.55 },
];

// ===== Full event log (May 15–20, all from yuesao notes) =====
export const LOG = [
  {
    date: '2026-05-20', label: 'May 20', day: 8, partial: true,
    events: [
      { time: '2:50',  tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
      { time: '6:18',  tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
      { time: '9:24',  tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💩'}, {cls:'td', text:'💧'}] },
      { time: '12:30', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💩'}, {cls:'td', text:'💧'}] },
      { time: '14:26', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
      { time: '16:58', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
      { time: '20:30', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
    ],
  },
  {
    date: '2026-05-19', label: 'May 19', day: 7,
    events: [
      { time: '0:13',  tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
      { time: '5:00',  tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
      { time: '8:20',  tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
      { time: '11:40', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💩'}, {cls:'td', text:'💧'}] },
      { time: '12:45', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💩'}, {cls:'td', text:'💧'}] },
      { time: '15:35', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
      { time: '18:30', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💩'}, {cls:'td', text:'💧'}] },
      { time: '23:00', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
    ],
  },
  {
    date: '2026-05-18', label: 'May 18', day: 6,
    events: [
      { time: '1:51',  tags: [{cls:'tf', text:'🤱 fed + 30ml'}, {cls:'td', text:'💩'}, {cls:'td', text:'💧'}] },
      { time: '7:14',  tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
      { time: '11:00', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💩'}, {cls:'td', text:'💧'}] },
      { time: '13:45', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💩'}, {cls:'td', text:'💧'}] },
      { time: '17:00', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
      { time: '20:44', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
      { time: '22:30', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💩'}, {cls:'td', text:'💧'}] },
    ],
  },
  {
    date: '2026-05-17', label: 'May 17', day: 5,
    events: [
      { time: '2:20',  tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
      { time: '6:40',  tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
      { time: '10:00', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💩'}, {cls:'td', text:'💧'}] },
      { time: '12:50', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💩'}, {cls:'td', text:'💧'}] },
      { time: '15:28', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
      { time: '18:11', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💩'}, {cls:'td', text:'💧'}] },
      { time: '21:21', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💩'}, {cls:'td', text:'💧'}] },
      { time: '22:50', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
    ],
  },
  {
    date: '2026-05-16', label: 'May 16', day: 4,
    events: [
      { time: '1:00',  tags: [{cls:'tf', text:'🤱 fed + 30ml'}, {cls:'td', text:'💩'}, {cls:'td', text:'💧'}] },
      { time: '4:40',  tags: [{cls:'tf', text:'🤱 fed + 30ml'}, {cls:'td', text:'💧'}] },
      { time: '8:38',  tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
      { time: '11:55', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💩'}, {cls:'td', text:'💧'}] },
      { time: '13:38', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
      { time: '16:31', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
      { time: '17:28', tags: [{cls:'td', text:'💩'}, {cls:'td', text:'💧'}] },
      { time: '18:33', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
      { time: '20:28', tags: [{cls:'tf', text:'🤱 fed + 30ml'}, {cls:'td', text:'💩'}, {cls:'td', text:'💧'}] },
      { time: '22:55', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💩'}, {cls:'td', text:'💧'}] },
    ],
  },
  {
    date: '2026-05-15', label: 'May 15', day: 3, partial: true,
    events: [
      { time: '13:00', tags: [{cls:'tf', text:'🤱 10min/side + 20ml'}, {cls:'td', text:'💩'}, {cls:'td', text:'💧'}] },
      { time: '16:25', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
      { time: '19:00', tags: [{cls:'tf', text:'🤱 fed'}, {cls:'td', text:'💧'}] },
      { time: '21:30', tags: [{cls:'tf', text:'🤱 fed + 30ml'}, {cls:'td', text:'💩'}, {cls:'td', text:'💧'}] },
      { time: '23:40', tags: [{cls:'tf', text:'🤱 fed + 30ml'}, {cls:'td', text:'💧'}] },
    ],
  },
];

// ===== Parent weight tracking =====
export const PARENT_WEIGHT = {
  dad: {
    name: 'Ginger', start: 90.0, goal: 85.0,
    entries: [
      { day: 0, label: 'May 12', weight: 90.0 },
      { day: 1, label: 'May 13', weight: 90.0 },
      { day: 2, label: 'May 14', weight: 90.0 },
      { day: 3, label: 'May 15', weight: 90.0 },
      { day: 4, label: 'May 16', weight: 90.0 },
      { day: 5, label: 'May 17', weight: 90.0 },
      { day: 6, label: 'May 18', weight: 90.0 },
      { day: 7, label: 'May 19', weight: 90.0 },
      { day: 8, label: 'May 20', weight: 90.0 },
    ],
  },
  mom: {
    name: '华夏', start: 77.0, goal: 57.0,
    entries: [
      { day: 0, label: 'May 12', weight: 77.0 },
      { day: 1, label: 'May 13', weight: 76.2 },
      { day: 2, label: 'May 14', weight: 75.3 },
      { day: 3, label: 'May 15', weight: 74.5 },
      { day: 4, label: 'May 16', weight: 73.6 },
      { day: 5, label: 'May 17', weight: 72.6 },
      { day: 6, label: 'May 18', weight: 71.8 },
      { day: 7, label: 'May 19', weight: 70.9 },
      { day: 8, label: 'May 20', weight: 70.0 },
    ],
  },
};
