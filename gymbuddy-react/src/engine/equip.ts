import type { Equip } from './types'

/** Display labels for equipment types — shared between Settings' equipment
 *  picker context, the Rush Radar heatmap (grouped by equipment), and the
 *  read-only equipment summary shown there. */
export const EQUIP_LABEL: Record<Equip, string> = {
  machine: 'Machines',
  cable: 'Cable station',
  dumbbell: 'Dumbbells',
  barbell: 'Barbells',
  bodyweight: 'Open floor / bodyweight',
}
