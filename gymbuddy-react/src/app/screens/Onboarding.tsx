import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { GOALS, EQUIP_OPTIONS } from '../../engine/goals'
import { ageBracketFor, suggestedTarget } from '../../engine/age'
import type { Equip, GoalKey } from '../../engine/types'
import { useGym } from '../../store/GymStoreContext'
import { Wrap, Chip, PrimaryButton, Dock } from '../components/ui'

const fadeSlide = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.22 },
}

type Step = 0 | 1 | 2 | 3
const TOTAL_STEPS = 4

function StepFooter({ step, children }: { step: Step; children: ReactNode }) {
  return (
    <Dock>
      {children}
      <p className="mt-2 text-center text-sm text-muted">
        Step {step + 1} of {TOTAL_STEPS}
      </p>
    </Dock>
  )
}

/** welcome -> age -> goal -> equipment/days, then completeOnboarding()
 *  hands off to the (separate, skippable) sign-in screen — see
 *  postOnboardingAuthPending in useGymStore and app/screens/AuthStep.tsx. */
export default function Onboarding() {
  const completeOnboarding = useGym((s) => s.completeOnboarding)
  const [step, setStep] = useState<Step>(0)
  const [age, setAge] = useState('')
  const [goal, setGoal] = useState<GoalKey | null>(null)
  const [equip, setEquip] = useState<Set<Equip>>(new Set(['machine', 'cable', 'dumbbell']))
  const [target, setTarget] = useState(3)
  const [targetTouched, setTargetTouched] = useState(false)

  const ageNum = age.trim() === '' ? null : Number(age)
  const ageValid = ageNum != null && Number.isFinite(ageNum) && ageNum >= 13 && ageNum <= 100

  function handleAgeChange(v: string) {
    setAge(v)
    if (targetTouched) return
    const n = v.trim() === '' ? null : Number(v)
    setTarget(suggestedTarget(ageBracketFor(n)))
  }

  function toggleEquip(k: Equip) {
    setEquip((prev) => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  if (step === 0) {
    return (
      <motion.div key="ob-0" {...fadeSlide}>
        <Wrap>
          <h1 className="mt-6 font-display font-extrabold leading-[0.92]" style={{ fontSize: '3.2rem' }}>
            Walk in.
            <br />
            Know exactly
            <br />
            what to do.
          </h1>
          <p className="mt-3 text-lg text-muted">
            Three exercises a day, with a backup ready when a machine is taken. A few quick questions and you're set.
          </p>
        </Wrap>
        <StepFooter step={step}>
          <PrimaryButton onClick={() => setStep(1)}>Get started</PrimaryButton>
        </StepFooter>
      </motion.div>
    )
  }

  if (step === 1) {
    return (
      <motion.div key="ob-1" {...fadeSlide}>
        <Wrap>
          <button type="button" className="mt-2 font-semibold text-muted" onClick={() => setStep(0)}>
            Back
          </button>
          <h2 className="mb-1 mt-4 font-display font-bold" style={{ fontSize: '1.9rem' }}>
            Your age
          </h2>
          <p className="mb-4 text-muted">Helps us set your rest times and labels.</p>
          <input
            type="number"
            inputMode="numeric"
            min={13}
            max={100}
            value={age}
            onChange={(e) => handleAgeChange(e.target.value)}
            className="w-24 rounded-xl border-2 border-line bg-card p-2.5 text-ink outline-none focus-visible:border-plate"
            aria-label="Your age"
          />
        </Wrap>
        <StepFooter step={step}>
          <PrimaryButton disabled={!ageValid} onClick={() => setStep(2)}>
            Next
          </PrimaryButton>
        </StepFooter>
      </motion.div>
    )
  }

  if (step === 2) {
    return (
      <motion.div key="ob-2" {...fadeSlide}>
        <Wrap>
          <button type="button" className="mt-2 font-semibold text-muted" onClick={() => setStep(1)}>
            Back
          </button>
          <h2 className="mb-3 mt-4 font-display font-bold" style={{ fontSize: '1.9rem' }}>
            What's your main goal?
          </h2>
          <div className="grid gap-3">
            {(Object.entries(GOALS) as [GoalKey, (typeof GOALS)[GoalKey]][]).map(([k, g]) => (
              <Chip key={k} pressed={goal === k} onClick={() => setGoal(k)}>
                <div className="font-display font-bold" style={{ fontSize: '1.35rem' }}>
                  {g.label}
                </div>
                <div className="text-muted">{g.sub}</div>
              </Chip>
            ))}
          </div>
        </Wrap>
        <StepFooter step={step}>
          <PrimaryButton disabled={!goal} onClick={() => setStep(3)}>
            Next
          </PrimaryButton>
        </StepFooter>
      </motion.div>
    )
  }

  return (
    <motion.div key="ob-3" {...fadeSlide}>
      <Wrap>
        <button type="button" className="mt-2 font-semibold text-muted" onClick={() => setStep(2)}>
          Back
        </button>
        <h2 className="mb-1 mt-4 font-display font-bold" style={{ fontSize: '1.9rem' }}>
          What does your gym have?
        </h2>
        <p className="mb-4 text-muted">Tick everything you've seen there. Not sure? Leave the defaults.</p>
        <div className="grid gap-3">
          {EQUIP_OPTIONS.map((q) => (
            <Chip key={q.key} pressed={equip.has(q.key)} className="flex items-center justify-between" onClick={() => toggleEquip(q.key)}>
              <span>
                <span className="font-display font-bold" style={{ fontSize: '1.3rem' }}>
                  {q.label}
                </span>
                {q.sub && (
                  <>
                    <br />
                    <span className="text-sm text-muted">{q.sub}</span>
                  </>
                )}
              </span>
              <span aria-hidden="true" className="font-display font-bold" style={{ fontSize: '1.4rem' }}>
                {equip.has(q.key) ? '✓' : ''}
              </span>
            </Chip>
          ))}
        </div>

        <h3 className="mb-2 mt-6 font-display font-bold" style={{ fontSize: '1.4rem' }}>
          Days a week you can realistically go
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[2, 3, 4].map((n) => (
            <Chip
              key={n}
              pressed={target === n}
              className="text-center"
              onClick={() => {
                setTarget(n)
                setTargetTouched(true)
              }}
            >
              <span className="font-display font-bold" style={{ fontSize: '1.5rem' }}>
                {n}
              </span>
            </Chip>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">Start lower than you think. Hitting 3 beats planning 6.</p>
      </Wrap>
      <StepFooter step={step}>
        <PrimaryButton onClick={() => goal && ageValid && completeOnboarding(goal, [...equip], target, ageNum)}>
          Build my plan
        </PrimaryButton>
      </StepFooter>
    </motion.div>
  )
}
