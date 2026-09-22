import { NAV_HEIGHT } from './layout'

const TABS = [
  { key: 'today', label: 'Today' },
  { key: 'history', label: 'History' },
  { key: 'settings', label: 'Settings' },
] as const

export type TabKey = (typeof TABS)[number]['key']

export default function BottomNav({ active, onChange }: { active: TabKey; onChange: (key: TabKey) => void }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-[480px] justify-around" style={{ height: NAV_HEIGHT }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-current={active === t.key ? 'page' : undefined}
            onClick={() => onChange(t.key)}
            className={`flex-1 font-display text-base font-bold transition-colors ${active === t.key ? 'text-ink' : 'text-muted'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
