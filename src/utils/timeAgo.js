const UNITS = [
  ['año', 31536000],
  ['mes', 2592000],
  ['semana', 604800],
  ['día', 86400],
  ['hora', 3600],
  ['minuto', 60],
];

export function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);

  for (const [label, secondsInUnit] of UNITS) {
    const count = Math.floor(seconds / secondsInUnit);
    if (count >= 1) {
      const plural = label === 'mes' ? 'meses' : `${label}s`;
      return `hace ${count} ${count === 1 ? label : plural}`;
    }
  }

  return 'hace instantes';
}
