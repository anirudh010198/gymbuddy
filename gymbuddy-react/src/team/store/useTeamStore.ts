import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EMPTY_SYNTHESIS, type FunnelStageKey, type Insight, type Interview, type Iteration, type Synthesis, type Tester } from '../types'

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export interface TeamState {
  interviews: Interview[]
  testers: Tester[]
  synthesis: Synthesis

  addInterview: (data: Omit<Interview, 'id' | 'at'>) => void
  deleteInterview: (id: string) => void

  addTester: (name: string, venue: string) => void
  setTesterStage: (id: string, key: FunnelStageKey, value: boolean) => void
  setTesterNote: (id: string, note: string) => void
  deleteTester: (id: string) => void

  updateInsight: (index: number, patch: Partial<Insight>) => void
  updateKilledHypothesis: (v: string) => void
  updateIteration: (patch: Partial<Iteration>) => void

  /** Merges another device's raw backup export into this one: interviews/testers
   *  deduped by id, synthesis fields filled only where currently empty (never
   *  silently overwrites what this device already has). */
  importBackup: (data: { interviews?: Interview[]; testers?: Tester[]; synthesis?: Synthesis }) => void
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set) => ({
      interviews: [],
      testers: [],
      synthesis: EMPTY_SYNTHESIS,

      addInterview: (data) => set((s) => ({ interviews: [...s.interviews, { ...data, id: uid(), at: Date.now() }] })),
      deleteInterview: (id) => set((s) => ({ interviews: s.interviews.filter((i) => i.id !== id) })),

      addTester: (name, venue) =>
        set((s) => ({
          testers: [
            ...s.testers,
            { id: uid(), name, venue, at: Date.now(), tried: false, core: false, reuse: false, returned: false, w1: false, swapped: false, note: '' },
          ],
        })),
      setTesterStage: (id, key, value) =>
        set((s) => ({ testers: s.testers.map((t) => (t.id === id ? { ...t, [key]: value } : t)) })),
      setTesterNote: (id, note) => set((s) => ({ testers: s.testers.map((t) => (t.id === id ? { ...t, note } : t)) })),
      deleteTester: (id) => set((s) => ({ testers: s.testers.filter((t) => t.id !== id) })),

      updateInsight: (index, patch) =>
        set((s) => ({
          synthesis: { ...s.synthesis, insights: s.synthesis.insights.map((ins, i) => (i === index ? { ...ins, ...patch } : ins)) },
        })),
      updateKilledHypothesis: (v) => set((s) => ({ synthesis: { ...s.synthesis, killedHypothesis: v } })),
      updateIteration: (patch) => set((s) => ({ synthesis: { ...s.synthesis, iteration: { ...s.synthesis.iteration, ...patch } } })),

      importBackup: (data) =>
        set((s) => {
          const existingIds = new Set(s.interviews.map((i) => i.id))
          const newInterviews = (data.interviews ?? []).filter((i) => !existingIds.has(i.id))
          const existingTesterIds = new Set(s.testers.map((t) => t.id))
          const newTesters = (data.testers ?? []).filter((t) => !existingTesterIds.has(t.id))
          const synthesis: Synthesis = data.synthesis
            ? {
                insights: s.synthesis.insights.map((ins, i) =>
                  ins.title || ins.evidence || ins.implication ? ins : (data.synthesis!.insights[i] ?? ins),
                ),
                killedHypothesis: s.synthesis.killedHypothesis || data.synthesis.killedHypothesis,
                iteration: {
                  saw: s.synthesis.iteration.saw || data.synthesis.iteration.saw,
                  assumed: s.synthesis.iteration.assumed || data.synthesis.iteration.assumed,
                  changed: s.synthesis.iteration.changed || data.synthesis.iteration.changed,
                  result: s.synthesis.iteration.result || data.synthesis.iteration.result,
                },
              }
            : s.synthesis
          return {
            interviews: [...s.interviews, ...newInterviews],
            testers: [...s.testers, ...newTesters],
            synthesis,
          }
        }),
    }),
    { name: 'gymbuddy.team' },
  ),
)
