const DAY = 24 * 60 * 60 * 1000;

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function parse(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

const pad = (value) => String(value).padStart(2, '0');

/** 18 Aug 2026 */
export function formatDate(value) {
  const date = parse(value);
  if (!date) return '';
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** 14:32 */
export function formatClock(value) {
  const date = parse(value);
  if (!date) return '';
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** 18 Aug 2026, 14:32 */
export function formatStamp(value) {
  const date = parse(value);
  if (!date) return '';
  return `${formatDate(value)}, ${formatClock(value)}`;
}

/** Weekday and date, e.g. Sat 22 Aug */
export function formatDayDate(value) {
  const date = parse(value);
  if (!date) return '';
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  return `${weekday} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** Short relative label, e.g. 3 hours ago, in 5 days. */
export function formatRelative(value) {
  const date = parse(value);
  if (!date) return '';

  const diff = date.getTime() - Date.now();
  const minutes = Math.round(diff / 60000);
  const hours = Math.round(diff / 3600000);
  const days = Math.round(diff / DAY);

  if (Math.abs(minutes) < 1) return 'just now';
  if (Math.abs(minutes) < 60) return relative(minutes, 'minute');
  if (Math.abs(hours) < 24) return relative(hours, 'hour');
  if (Math.abs(days) < 30) return relative(days, 'day');
  return formatDate(value);
}

function relative(amount, unit) {
  const size = Math.abs(amount);
  const label = `${size} ${unit}${size === 1 ? '' : 's'}`;
  return amount < 0 ? `${label} ago` : `in ${label}`;
}

export function isSameDay(a, b) {
  const first = parse(a);
  const second = parse(b);
  if (!first || !second) return false;
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}
