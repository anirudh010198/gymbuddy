import { useRef, useState, type ComponentType } from 'react'
import { useTeamStore } from './store/useTeamStore'
import { downloadBackup, downloadResearchJson, parseBackup } from './lib/research'
import Interviews from './screens/Interviews'
import Funnel from './screens/Funnel'
import Synthesis from './screens/Synthesis'

const TABS = [
  ['interviews', 'Interviews'],
  ['funnel', 'Test funnel'],
  ['synthesis', 'Synthesis'],
] as const

type TabKey = (typeof TABS)[number][0]

const SCREENS: Record<TabKey, ComponentType> = {
  interviews: Interviews,
  funnel: Funnel,
  synthesis: Synthesis,
}

export default function TeamRoot() {
  const [tab, setTab] = useState<TabKey>('interviews')
  const [toast, setToast] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const interviews = useTeamStore((s) => s.interviews)
  const testers = useTeamStore((s) => s.testers)
  const synthesis = useTeamStore((s) => s.synthesis)
  const importBackup = useTeamStore((s) => s.importBackup)

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2500)
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const parsed = parseBackup(String(reader.result))
      if (!parsed) {
        flash("That file doesn't look like a GymBuddy team backup.")
        return
      }
      importBackup(parsed)
      flash('Imported and merged.')
    }
    reader.readAsText(file)
  }

  const Screen = SCREENS[tab]

  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <div className="mx-auto max-w-[1040px] px-4 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <div className="flex gap-1 rounded-xl bg-soft p-1">
            {TABS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`rounded-lg px-3 py-1.5 font-display text-sm font-bold ${tab === key ? 'bg-rubber text-chalk' : 'text-muted'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <button
              type="button"
              className="rounded-lg border-2 border-line px-3 py-1.5 font-semibold"
              onClick={() => {
                downloadResearchJson(interviews, testers, synthesis)
                flash('research.json downloaded — drop it into src/content/ and redeploy.')
              }}
            >
              Export research.json
            </button>
            <button
              type="button"
              className="rounded-lg border-2 border-line px-3 py-1.5 font-semibold"
              onClick={() => {
                downloadBackup(interviews, testers, synthesis)
                flash('Backup downloaded.')
              }}
            >
              Export backup
            </button>
            <button
              type="button"
              className="rounded-lg border-2 border-line px-3 py-1.5 font-semibold"
              onClick={() => fileInput.current?.click()}
            >
              Import backup
            </button>
            <input ref={fileInput} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
          </div>
        </div>
        {toast && (
          <div className="mt-3 rounded-xl border-2 border-plate bg-plate/10 px-3 py-2 text-sm font-semibold">{toast}</div>
        )}
      </div>
      <Screen />
    </div>
  )
}
