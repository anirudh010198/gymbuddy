import { useState } from 'react'
import { useGym } from '../../store/GymStoreContext'
import { useBusySource } from '../../store/BusySourceContext'
import { gymStatusNow } from '../../engine/busyMap'
import { EQUIP_LABEL } from '../../engine/equip'
import { Wrap, Card, GhostButton } from '../components/ui'
import FindGymSheet from '../components/FindGymSheet'
import RushRadarHeatmap from '../components/RushRadarHeatmap'
import { reportsForSampleGym, SAMPLE_GYMS } from '../../engine/sampleGyms'

/** Everything gym-related lives here, not scattered across Settings and
 *  Today — the current gym (with change/find), a live busy-now indicator,
 *  the rush-hour heatmap, and a read-only look at the equipment that
 *  drives it all (edited in Settings, just shown here for context). */
export default function RushRadar() {
  const profile = useGym((s) => s.profile)!
  const updateProfile = useGym((s) => s.updateProfile)
  const trackEvent = useGym((s) => s.trackEvent)
  const setActiveTab = useGym((s) => s.setActiveTab)
  const busySource = useBusySource()
  const [findGymOpen, setFindGymOpen] = useState(false)

  const selectedSample = SAMPLE_GYMS.find((gym) => gym.code === profile.gymCode)
  const reports = selectedSample ? reportsForSampleGym(selectedSample) : profile.gymCode ? busySource.all(profile.gymCode) : []
  const status = profile.gymCode ? gymStatusNow(reports) : null

  return (
    <Wrap>
      <h1 className="mt-2 font-display font-extrabold" style={{ fontSize: '2rem' }}>
        Rush Radar
      </h1>
      <p className="text-muted">Know which machines are free before you walk in.</p>

      <Card className="mt-4 p-4">
        {profile.gymName ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {status && (
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${status === 'busy' ? 'bg-warn' : 'bg-go'}`}
                />
              )}
              <div>
                <div className="font-display font-bold" style={{ fontSize: '1.2rem' }}>
                  {profile.gymName}
                </div>
                {status && <div className="text-sm text-muted">{status === 'busy' ? 'Busy right now' : 'Quiet right now'}</div>}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <GhostButton className="!min-h-0 w-auto px-3 py-2 text-sm" onClick={() => setFindGymOpen(true)}>
                Change
              </GhostButton>
              <GhostButton
                className="!min-h-0 w-auto px-3 py-2 text-sm"
                onClick={() => updateProfile({ gymName: null, gymCode: null })}
              >
                Clear
              </GhostButton>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted">
              Optional — lets us show which machines are usually busy right now. Only the gym's name is ever saved, never your
              location.
            </p>
            <GhostButton className="mt-3" onClick={() => setFindGymOpen(true)}>
              Find my gym
            </GhostButton>
          </>
        )}
      </Card>

      <Card className="mt-4 p-4">
        <div className="font-display font-bold" style={{ fontSize: '1.2rem' }}>Explore sample gyms</div>
        <p className="mt-1 text-sm text-muted">Illustrative busy and free patterns. These are sample reports, not live crowd data.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {SAMPLE_GYMS.map((gym) => (
            <GhostButton
              key={gym.id}
              aria-pressed={profile.gymCode === gym.code}
              className={`!min-h-[48px] px-2 py-2 text-sm ${profile.gymCode === gym.code ? 'border-plate' : ''}`}
              onClick={() => updateProfile({ gymName: gym.name, gymCode: gym.code })}
            >
              {gym.kind}
            </GhostButton>
          ))}
        </div>
      </Card>

      <Card className="mt-4 p-4">
        <div className="text-sm font-semibold text-muted">Your equipment</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {profile.equip.map((e) => (
            <span key={e} className="rounded-full bg-soft px-3 py-1 text-sm font-semibold">
              {EQUIP_LABEL[e]}
            </span>
          ))}
        </div>
        <button
          type="button"
          className="mt-2 text-sm font-semibold underline decoration-line underline-offset-2"
          onClick={() => setActiveTab('settings')}
        >
          Change in Settings
        </button>
      </Card>

      <div className="mt-4">
        <RushRadarHeatmap gymName={profile.gymName} gymCode={profile.gymCode} reports={reports} />
      </div>

      <FindGymSheet
        open={findGymOpen}
        onPick={(name, code, method) => {
          updateProfile({ gymName: name, gymCode: code })
          trackEvent('gym_located', { method })
        }}
        onClose={() => setFindGymOpen(false)}
      />
    </Wrap>
  )
}
