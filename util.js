export function todayMidnightRelativeTime(hours, minutes) {
  let d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export function intToText(number) {
  if (Number.isNaN(number)) {
    return '';
  }
  return number.toString();
}
