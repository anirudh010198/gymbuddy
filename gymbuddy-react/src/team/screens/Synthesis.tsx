import { useTeamStore } from '../store/useTeamStore'
import { Card, Wrap } from '../../app/components/ui'
import { Field, TextArea } from '../components/form'

export default function Synthesis() {
  const synthesis = useTeamStore((s) => s.synthesis)
  const updateInsight = useTeamStore((s) => s.updateInsight)
  const updateKilledHypothesis = useTeamStore((s) => s.updateKilledHypothesis)
  const updateIteration = useTeamStore((s) => s.updateIteration)

  return (
    <Wrap wide>
      <h1 className="mt-2 font-display font-extrabold leading-none" style={{ fontSize: '2.4rem' }}>
        Synthesis
      </h1>
      <p className="mt-1 text-muted">
        Write these up by hand from your interviews and test notes — there's no AI step in this build. Whatever you write here
        goes straight into the exported research.json.
      </p>

      <h2 className="mb-2 mt-6 font-display font-bold" style={{ fontSize: '1.4rem' }}>
        3 insights
      </h2>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {synthesis.insights.map((ins, i) => (
          <Card key={i} className="grid gap-3 p-4">
            <Field label={`Insight ${i + 1}`}>
              <input
                className="w-full rounded-xl border-2 border-line bg-card p-2.5 text-ink outline-none focus-visible:border-plate"
                value={ins.title}
                onChange={(e) => updateInsight(i, { title: e.target.value })}
                placeholder="Title"
              />
            </Field>
            <Field label="Evidence" hint="Which participants and what they said or did">
              <TextArea rows={2} value={ins.evidence} onChange={(e) => updateInsight(i, { evidence: e.target.value })} />
            </Field>
            <Field label="So what?" hint="What it means for the product">
              <TextArea rows={2} value={ins.implication} onChange={(e) => updateInsight(i, { implication: e.target.value })} />
            </Field>
          </Card>
        ))}
      </div>

      <h2 className="mb-2 mt-6 font-display font-bold" style={{ fontSize: '1.4rem' }}>
        A hypothesis the research killed
      </h2>
      <Card className="p-4">
        <TextArea
          rows={3}
          value={synthesis.killedHypothesis}
          onChange={(e) => updateKilledHypothesis(e.target.value)}
          placeholder="What did you believe going in that the interviews or tests disproved?"
        />
      </Card>

      <h2 className="mb-2 mt-6 font-display font-bold" style={{ fontSize: '1.4rem' }}>
        One iteration: before / after
      </h2>
      <Card className="grid gap-3 p-4">
        <Field label="What we saw">
          <TextArea rows={2} value={synthesis.iteration.saw} onChange={(e) => updateIteration({ saw: e.target.value })} />
        </Field>
        <Field label="What we assumed">
          <TextArea rows={2} value={synthesis.iteration.assumed} onChange={(e) => updateIteration({ assumed: e.target.value })} />
        </Field>
        <Field label="What we changed">
          <TextArea rows={2} value={synthesis.iteration.changed} onChange={(e) => updateIteration({ changed: e.target.value })} />
        </Field>
        <Field label="What happened after">
          <TextArea rows={2} value={synthesis.iteration.result} onChange={(e) => updateIteration({ result: e.target.value })} />
        </Field>
      </Card>
    </Wrap>
  )
}
