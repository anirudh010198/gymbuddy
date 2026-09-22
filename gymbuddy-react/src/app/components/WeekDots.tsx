import { addDays, today, weekStart } from '../../engine/dates'

export default function WeekDots({ history }: { history: { date: string }[] }) {
  const t = today()
  const start = addDays(weekStart(t), -7)
  const days = new Set(history.map((h) => h.date))
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(7, 22px)' }}>
      {Array.from({ length: 14 }, (_, i) => {
        const d = addDays(start, i)
        const on = days.has(d)
        const isToday = d === t
        return (
          <div
            key={d}
            title={d}
            className={`h-[22px] w-[22px] rounded-[7px] ${on ? 'bg-plate' : 'bg-soft'} ${
              isToday ? 'outline outline-2 outline-offset-1 outline-ink' : ''
            }`}
          />
        )
      })}
    </div>
  )
}
