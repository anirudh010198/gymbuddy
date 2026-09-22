/** Local-time date helpers, ported 1:1 from js/app.js. */

const pad = (n: number) => String(n).padStart(2, '0')

export function dstr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function today(): string {
  return dstr(new Date())
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Monday-start week, matching the vanilla version's (getDay()+6)%7 convention. */
export function weekStart(s: string): string {
  const d = parseDate(s)
  const wd = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - wd)
  return dstr(d)
}

export function addDays(s: string, n: number): string {
  const d = parseDate(s)
  d.setDate(d.getDate() + n)
  return dstr(d)
}
