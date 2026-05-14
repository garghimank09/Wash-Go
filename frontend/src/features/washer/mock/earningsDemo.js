/** Demo sparkline + incentive copy — blends with real completed job counts in UI. */
export function weeklyEarningsDemoSeries() {
  return [
    { day: 'Mon', cents: 12800, jobs: 4 },
    { day: 'Tue', cents: 9100, jobs: 3 },
    { day: 'Wed', cents: 15400, jobs: 5 },
    { day: 'Thu', cents: 7600, jobs: 2 },
    { day: 'Fri', cents: 18200, jobs: 6 },
    { day: 'Sat', cents: 22100, jobs: 7 },
    { day: 'Sun', cents: 6400, jobs: 2 },
  ];
}

export function dailyEarningsDemo() {
  return { cents: 8400, jobs: 3, vsYesterdayPct: 12 };
}

export const INCENTIVES_DEMO = [
  { id: '1', title: 'Peak window bonus', body: '+$8 on jobs starting 4–7 PM when acceptance SLA hits.', highlight: true },
  { id: '2', title: 'Streak shield', body: '3-day completion streak unlocks priority offers.', highlight: false },
];
