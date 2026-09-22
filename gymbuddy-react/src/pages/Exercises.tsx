import { useMemo, useState } from 'react'
import SiteHeader from '../site/components/SiteHeader'
import SiteFooter from '../site/components/SiteFooter'
import FormGuide from '../app/components/FormGuide'
import { EXERCISES } from '../engine/exercises'
import { GROUP_LABEL } from '../engine/templates'
import type { Equip, Group } from '../engine/types'

const EQUIP_OPTIONS: { key: Equip; label: string }[] = [
  { key: 'machine', label: 'Machine' },
  { key: 'dumbbell', label: 'Dumbbell' },
  { key: 'cable', label: 'Cable' },
  { key: 'barbell', label: 'Barbell' },
  { key: 'bodyweight', label: 'Bodyweight' },
]

const LEVEL_OPTIONS = [1, 2, 3] as const
const GROUPS: Group[] = ['legs', 'push', 'pull']

function FilterChip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`rounded-full border-2 px-3 py-1.5 text-sm font-semibold ${pressed ? 'border-plate bg-plate/20' : 'border-line bg-card'}`}
    >
      {children}
    </button>
  )
}

export default function Exercises() {
  const [query, setQuery] = useState('')
  const [equipFilter, setEquipFilter] = useState<Set<Equip>>(new Set())
  const [levelFilter, setLevelFilter] = useState<Set<number>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function toggleEquip(k: Equip) {
    setEquipFilter((prev) => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }
  function toggleLevel(l: number) {
    setLevelFilter((prev) => {
      const next = new Set(prev)
      if (next.has(l)) next.delete(l)
      else next.add(l)
      return next
    })
  }

  // Empty filter set means "no filter applied" (show everything), not "show nothing".
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return EXERCISES.filter((e) => {
      if (equipFilter.size > 0 && !equipFilter.has(e.equip)) return false
      if (levelFilter.size > 0 && !levelFilter.has(e.level)) return false
      if (q && !e.name.toLowerCase().includes(q) && !e.muscles.toLowerCase().includes(q)) return false
      return true
    })
  }, [query, equipFilter, levelFilter])

  return (
    <div className="bg-bg text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-[1040px] px-4 pb-16 pt-8 sm:px-6">
        <h1 className="font-display font-extrabold leading-none" style={{ fontSize: 'clamp(2.2rem, 5vw, 3rem)' }}>
          All exercises
        </h1>
        <p className="mt-2 text-muted">The full library GymBuddy picks and swaps from. Search, filter, and open any exercise for its full form guide.</p>

        <div className="mt-6 grid gap-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or muscle…"
            className="w-full rounded-xl border-2 border-line bg-card p-3 text-ink outline-none focus-visible:border-plate"
            aria-label="Search exercises by name or muscle"
          />
          <div>
            <div className="text-sm font-semibold text-muted">Equipment</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {EQUIP_OPTIONS.map((o) => (
                <FilterChip key={o.key} pressed={equipFilter.has(o.key)} onClick={() => toggleEquip(o.key)}>
                  {o.label}
                </FilterChip>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-muted">Level</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {LEVEL_OPTIONS.map((l) => (
                <FilterChip key={l} pressed={levelFilter.has(l)} onClick={() => toggleLevel(l)}>
                  {`Level ${l}`}
                </FilterChip>
              ))}
            </div>
          </div>
        </div>

        {GROUPS.map((group) => {
          const items = filtered.filter((e) => e.group === group)
          if (!items.length) return null
          return (
            <section key={group} className="mt-8">
              <h2 className="font-display font-bold" style={{ fontSize: '1.5rem' }}>
                {GROUP_LABEL[group]} <span className="text-base font-normal text-muted">({items.length})</span>
              </h2>
              <div className="mt-3 grid gap-2">
                {items.map((e) => {
                  const expanded = expandedId === e.id
                  return (
                    <div key={e.id} className="rounded-2xl border-2 border-line bg-card">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-2 p-4 text-left"
                        onClick={() => setExpandedId(expanded ? null : e.id)}
                        aria-expanded={expanded}
                      >
                        <div>
                          <div className="font-display font-bold" style={{ fontSize: '1.15rem' }}>
                            {e.name}
                          </div>
                          <div className="text-sm text-muted">{e.description}</div>
                          <div className="mt-1 text-xs text-muted">
                            {e.equip} · level {e.level} · {e.muscles}
                          </div>
                        </div>
                        <span aria-hidden="true" className={`shrink-0 text-lg text-muted transition-transform ${expanded ? '-rotate-180' : ''}`}>
                          ⌄
                        </span>
                      </button>
                      {expanded && (
                        <div className="border-t border-line p-4">
                          <FormGuide exercise={e} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

        {filtered.length === 0 && <p className="mt-8 text-muted">No exercises match those filters.</p>}
      </main>
      <SiteFooter />
    </div>
  )
}
