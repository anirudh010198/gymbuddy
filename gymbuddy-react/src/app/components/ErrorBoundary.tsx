import { Component, type ReactNode } from 'react'
import { performHardReset } from '../../lib/hardReset'

interface Props {
  children: ReactNode
}
interface State {
  hasError: boolean
}

/** Wraps the whole app (see App.tsx) — a render crash anywhere shows this
 *  instead of a blank white screen. "Reset and reload" goes through the
 *  same hard reset as Settings' "Reset all data": if the crash was caused
 *  by corrupted persisted state, a plain reload would just crash again. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('GymBuddy crashed:', error)
  }

  async handleResetAndReload() {
    await performHardReset()
    window.location.href = '/'
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg p-6 text-center text-ink">
        <h1 className="font-display text-3xl font-extrabold">Something went wrong.</h1>
        <p className="max-w-xs text-muted">
          GymBuddy hit an error it couldn't recover from. Your data on this device is untouched unless you reset below.
        </p>
        <button
          type="button"
          className="min-h-[52px] rounded-2xl bg-plate px-6 font-display text-lg font-bold text-plate-ink"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
        <button
          type="button"
          className="min-h-[52px] rounded-2xl border-2 border-line px-6 font-display text-lg font-bold text-ink"
          onClick={() => this.handleResetAndReload()}
        >
          Reset and reload
        </button>
      </div>
    )
  }
}
