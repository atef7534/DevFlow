export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDate(value, options = { month: "short", day: "numeric" }) {
  if (!value) return "No date";
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return new Intl.DateTimeFormat(undefined, options).format(date);
}

export function dayOffsetKey(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return localDateKey(date);
}

export function isSameLocalDay(timestamp, key = localDateKey()) {
  return timestamp ? localDateKey(new Date(timestamp)) === key : false;
}

export function getStreak(completedDays = []) {
  const days = new Set(completedDays);
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  const today = localDateKey(cursor);
  if (!days.has(today)) cursor.setDate(cursor.getDate() - 1);
  while (days.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getLongestStreak(completedDays = []) {
  const days = [...new Set(completedDays)].sort();
  let longest = 0;
  let current = 0;
  let previous = null;
  for (const key of days) {
    const expected = previous ? new Date(previous) : null;
    if (expected) expected.setDate(expected.getDate() + 1);
    current = expected && localDateKey(expected) === key ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = `${key}T12:00:00`;
  }
  return longest;
}

export function getWeekKeys() {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const day = today.getDay();
  today.setDate(today.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return localDateKey(date);
  });
}
