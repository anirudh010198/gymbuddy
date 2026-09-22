import type { ReactNode } from 'react'
import type { Exercise } from '../../engine/types'

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  )
}

/** Setup / How to do it / Breathing / Feel it here / Form check — the full
 *  coaching detail for one exercise. Shared between the "Change exercise"
 *  list's expanded rows and the workout card's "Full form guide" link, so
 *  the content only needs writing once. */
export default function FormGuide({ exercise }: { exercise: Exercise }) {
  return (
    <div className="grid gap-3">
      <Section label="Setup">{exercise.setup}</Section>
      <Section label="How to do it">
        <ol className="grid gap-1">
          {exercise.steps.map((step, i) => (
            <li key={i} className="flex gap-2">
              <span className="shrink-0 font-display font-bold text-muted">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Section>
      <Section label="Breathing">{exercise.breathing}</Section>
      <Section label="Feel it here">{exercise.feelIt}</Section>
      <Section label="Form check">
        <ul className="grid gap-1">
          {exercise.formCues.map((cue, i) => (
            <li key={i} className="flex gap-2">
              <span className="shrink-0 text-go" aria-hidden="true">
                ✓
              </span>
              <span>{cue}</span>
            </li>
          ))}
          <li className="flex gap-2">
            <span className="shrink-0 text-warn" aria-hidden="true">
              ✗
            </span>
            <span>{exercise.avoid}</span>
          </li>
        </ul>
      </Section>
    </div>
  )
}
