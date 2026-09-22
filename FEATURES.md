# FEATURES.md — GymBuddy upgrade pack

> Put this file next to `CLAUDE.md`. Everything in `CLAUDE.md` still applies (design system, no fake data, offline-first, V1 scope). Run the prompts at the bottom one at a time.

---

## Feature 1 — Real exercise library: 8 Legs, 8 Push, 8 Pull

Replace the old library with the data below (keep the old bodyweight exercises as offline/no-equipment fallbacks). Each workout still has **3 exercises: one Legs, one Push, one Pull**, rotating A/B.

**Rules for the engine:**
- `role: "main"` exercises are compound lifts and are picked first for the daily workout. `role: "accessory"` exercises appear only as swaps or as the third pick when equipment rules out mains.
- Swap order: same `pattern` → same `group` → bodyweight fallback. Keep the existing reason logic (busy → different equipment, unsure → lowest level, hurts → lowest level + safety sheet).
- Filter by the user's equipment from onboarding.
- Start weights are conservative ranges for complete beginners. Always show "Pick a weight where the last 2 reps feel hard but your form stays clean."

Put this in `src/engine/exercises.ts`:

```ts
export type Group = "legs" | "push" | "pull";
export type Equip = "machine" | "cable" | "dumbbell" | "barbell" | "bodyweight";

export interface Exercise {
  id: string; name: string; group: Group; pattern: string;
  role: "main" | "accessory"; equip: Equip; level: 1 | 2 | 3;
  muscles: string; how: string; avoid: string; start: string;
  bonusTip: string; // shown only in Build muscle mode, after the last set is logged
}

export const EXERCISES: Exercise[] = [
  // ───────────── LEGS ─────────────
  { id:"leg_press", name:"Leg Press", group:"legs", pattern:"squat", role:"main", equip:"machine", level:1,
    muscles:"Quads, glutes",
    how:"Feet shoulder-width in the middle of the platform. Lower until your knees reach about 90°, then push through your whole foot.",
    avoid:"Locking your knees at the top, or letting your lower back peel off the pad.",
    start:"Empty sled or 10 kg per side.",
    bonusTip:"Take 3 seconds to lower and pause 1 second at the bottom. Slower lowering creates more muscle-building tension without adding weight." },
  { id:"goblet_squat", name:"Goblet Squat", group:"legs", pattern:"squat", role:"main", equip:"dumbbell", level:1,
    muscles:"Quads, glutes, core",
    how:"Hold one dumbbell vertically against your chest. Sit down between your heels with your chest up, then stand tall.",
    avoid:"Knees caving inward. Push them out in line with your toes.",
    start:"One 6–10 kg dumbbell.",
    bonusTip:"Pause for 2 seconds at the bottom of every rep. It removes the bounce so your legs do all the work, and it improves your squat depth." },
  { id:"smith_squat", name:"Smith Machine Squat", group:"legs", pattern:"squat", role:"main", equip:"machine", level:2,
    muscles:"Quads, glutes",
    how:"Bar across your upper back, feet slightly in front of the bar. Sit down and back, then drive straight up.",
    avoid:"Resting the bar on your neck, or rising onto your toes.",
    start:"Empty bar.",
    bonusTip:"Place your feet a little further forward to shift work to your glutes, or closer together to target your quads more." },
  { id:"db_rdl", name:"Dumbbell Romanian Deadlift", group:"legs", pattern:"hinge", role:"main", equip:"dumbbell", level:2,
    muscles:"Hamstrings, glutes, lower back",
    how:"Soft knees. Push your hips back and slide the dumbbells down your thighs until you feel a hamstring stretch, then squeeze your glutes to stand.",
    avoid:"Rounding your back. Stop lowering where your flat back ends.",
    start:"Two 6–10 kg dumbbells.",
    bonusTip:"Think 'hips back', not 'hands down'. The stretch in your hamstrings is where the growth happens, so control the lowering for 3 seconds." },
  { id:"leg_curl", name:"Seated Leg Curl", group:"legs", pattern:"hinge", role:"accessory", equip:"machine", level:1,
    muscles:"Hamstrings",
    how:"Pad just above your heels, thigh pad snug. Curl down smoothly, pause, then let it return slowly.",
    avoid:"Lifting your hips off the seat to swing the weight.",
    start:"The lightest 2–3 plates on the stack.",
    bonusTip:"Lean your torso slightly forward while curling. It stretches the hamstrings more and makes the same weight noticeably harder." },
  { id:"leg_extension", name:"Leg Extension", group:"legs", pattern:"squat", role:"accessory", equip:"machine", level:1,
    muscles:"Quads",
    how:"Knees in line with the machine's pivot. Straighten your legs, squeeze for 1 second at the top, lower slowly.",
    avoid:"Kicking the weight up with momentum.",
    start:"The lightest 2–3 plates on the stack.",
    bonusTip:"Hold the top position for a full 2 seconds on your last set. That squeeze gives a strong quad pump with very little joint stress." },
  { id:"db_lunge", name:"Dumbbell Walking Lunge", group:"legs", pattern:"lunge", role:"main", equip:"dumbbell", level:2,
    muscles:"Quads, glutes",
    how:"Dumbbells at your sides. Step forward, lower your back knee toward the floor, then push through the front heel into the next step.",
    avoid:"Your front knee collapsing inward, or taking tiny steps.",
    start:"Bodyweight first, then two 4–6 kg dumbbells.",
    bonusTip:"Take a slightly longer stride and lean your torso forward a little to put more work into your glutes." },
  { id:"hip_thrust", name:"Barbell Hip Thrust", group:"legs", pattern:"hinge", role:"main", equip:"barbell", level:2,
    muscles:"Glutes, hamstrings",
    how:"Upper back on a bench, padded bar across your hips. Drive your hips up until your body is flat from shoulders to knees, pause, lower.",
    avoid:"Arching your lower back at the top. Keep your chin tucked and ribs down.",
    start:"Empty bar with a pad.",
    bonusTip:"Pause for 2 seconds at the top of each rep and squeeze your glutes hard. Tension at the top is what makes this exercise work." },

  // ───────────── PUSH ─────────────
  { id:"chest_press", name:"Chest Press Machine", group:"push", pattern:"hpush", role:"main", equip:"machine", level:1,
    muscles:"Chest, front shoulders, triceps",
    how:"Handles at mid-chest height. Press forward without locking your elbows, then return slowly until you feel a chest stretch.",
    avoid:"Shoulders rolling forward off the pad.",
    start:"10–20 kg on the stack.",
    bonusTip:"Pinch your shoulder blades together before the first rep and keep them there. Your chest does more of the work and your shoulders stay safer." },
  { id:"db_bench", name:"Dumbbell Bench Press", group:"push", pattern:"hpush", role:"main", equip:"dumbbell", level:2,
    muscles:"Chest, triceps, front shoulders",
    how:"Lie on a flat bench, dumbbells above your chest. Lower to chest level with elbows at about 45°, then press up.",
    avoid:"Flaring your elbows straight out to the sides.",
    start:"Two 5–8 kg dumbbells.",
    bonusTip:"Let the dumbbells go slightly deeper than a barbell would allow. That extra stretch at the bottom is a big driver of chest growth." },
  { id:"incline_db", name:"Incline Dumbbell Press", group:"push", pattern:"hpush", role:"main", equip:"dumbbell", level:2,
    muscles:"Upper chest, front shoulders",
    how:"Bench at a low incline (about 30°). Lower the dumbbells to upper-chest level, press up and slightly together.",
    avoid:"Setting the bench too steep, which turns it into a shoulder press.",
    start:"Two 4–7 kg dumbbells.",
    bonusTip:"Keep the incline low, around 30°. It targets the upper chest better than steeper angles, which shift the work to your shoulders." },
  { id:"pec_deck", name:"Pec Deck Fly", group:"push", pattern:"hpush", role:"accessory", equip:"machine", level:1,
    muscles:"Chest",
    how:"Handles at chest height, slight bend in your elbows. Bring your arms together in a hugging arc, squeeze, return slowly.",
    avoid:"Letting the handles pull your arms far behind your body.",
    start:"The lightest 2–3 plates on the stack.",
    bonusTip:"Squeeze for 1 second where the handles meet, as if pushing your biceps together. That peak squeeze is what makes flies effective." },
  { id:"machine_shoulder", name:"Shoulder Press Machine", group:"push", pattern:"vpush", role:"main", equip:"machine", level:1,
    muscles:"Shoulders, triceps",
    how:"Handles at shoulder level. Press overhead without shrugging, lower with control.",
    avoid:"Arching your back off the pad.",
    start:"5–15 kg on the stack.",
    bonusTip:"Stop just short of locking out at the top. Keeping constant tension on your shoulders works them harder than resting at the top." },
  { id:"db_shoulder", name:"Seated Dumbbell Shoulder Press", group:"push", pattern:"vpush", role:"main", equip:"dumbbell", level:1,
    muscles:"Shoulders, triceps",
    how:"Sit upright with back support. Press the dumbbells overhead, lower to ear level.",
    avoid:"The dumbbells drifting forward in front of your face.",
    start:"Two 4–6 kg dumbbells.",
    bonusTip:"Turn your palms slightly inward, around 30°. It's easier on the shoulder joint and usually lets you press more weight with good form." },
  { id:"lateral_raise", name:"Dumbbell Lateral Raise", group:"push", pattern:"vpush", role:"accessory", equip:"dumbbell", level:1,
    muscles:"Side shoulders",
    how:"Slight bend in your elbows. Raise your arms out to the sides up to shoulder height, lower slowly.",
    avoid:"Swinging. If you need momentum, the weight is too heavy.",
    start:"Two 2–4 kg dumbbells. Lighter than you think.",
    bonusTip:"Lead with your elbows, not your hands, and lean forward slightly. This isolates the side shoulder, which gives you wider-looking shoulders." },
  { id:"triceps_pushdown", name:"Cable Triceps Pushdown", group:"push", pattern:"arms", role:"accessory", equip:"cable", level:1,
    muscles:"Triceps",
    how:"Elbows pinned to your sides. Push the bar or rope down until your arms are straight, return until your forearms are just above parallel.",
    avoid:"Elbows drifting forward, or leaning your bodyweight onto the bar.",
    start:"10–15 kg on the stack.",
    bonusTip:"Use the rope and spread it apart at the bottom. The extra squeeze fully contracts the triceps." },

  // ───────────── PULL ─────────────
  { id:"lat_pulldown", name:"Lat Pulldown", group:"pull", pattern:"vpull", role:"main", equip:"cable", level:1,
    muscles:"Lats, biceps",
    how:"Grip a little wider than shoulders. Pull the bar to your upper chest by driving your elbows down, return slowly to a full stretch.",
    avoid:"Leaning far back or pulling the bar behind your neck.",
    start:"15–25 kg on the stack.",
    bonusTip:"Imagine pulling with your elbows, not your hands. Thinking 'elbows to back pockets' makes your back work instead of your biceps." },
  { id:"assisted_pullup", name:"Assisted Pull-up Machine", group:"pull", pattern:"vpull", role:"main", equip:"machine", level:1,
    muscles:"Lats, biceps, upper back",
    how:"Kneel on the pad. Pull your chest toward the bar, then lower all the way down.",
    avoid:"Too little assistance. More assist weight makes it easier.",
    start:"High assistance, 30–40 kg.",
    bonusTip:"Reduce the assistance by one plate whenever you hit the top of your rep range on every set. That's your path to an unassisted pull-up." },
  { id:"seated_row", name:"Seated Cable Row", group:"pull", pattern:"hpull", role:"main", equip:"cable", level:1,
    muscles:"Mid back, lats, biceps",
    how:"Sit tall, slight knee bend. Pull the handle to your belly button, squeeze your shoulder blades, return with a stretch.",
    avoid:"Rocking your torso back and forth to move the weight.",
    start:"15–25 kg on the stack.",
    bonusTip:"Let your shoulder blades stretch forward at the start of each rep, then squeeze them together at the end. The full range builds a thicker back." },
  { id:"machine_row", name:"Chest-Supported Row Machine", group:"pull", pattern:"hpull", role:"main", equip:"machine", level:1,
    muscles:"Mid back, rear shoulders",
    how:"Chest on the pad. Pull the handles back until your elbows pass your ribs, pause, return slowly.",
    avoid:"Shrugging your shoulders up toward your ears.",
    start:"10–20 kg or one plate per side.",
    bonusTip:"Because your chest is supported, you can't cheat. Push close to failure on your final set to get the most from it safely." },
  { id:"db_row", name:"One-Arm Dumbbell Row", group:"pull", pattern:"hpull", role:"main", equip:"dumbbell", level:1,
    muscles:"Lats, mid back, biceps",
    how:"One hand and knee on a bench. Pull the dumbbell toward your hip, lower with a stretch.",
    avoid:"Twisting your torso to heave the weight up.",
    start:"One 8–12 kg dumbbell.",
    bonusTip:"Pull toward your hip in an arc rather than straight up. This targets your lats more than your upper back." },
  { id:"face_pull", name:"Cable Face Pull", group:"pull", pattern:"hpull", role:"accessory", equip:"cable", level:1,
    muscles:"Rear shoulders, upper back",
    how:"Rope at upper-chest height. Pull toward your face, separating the rope ends and rotating your hands back.",
    avoid:"Using so much weight that you lean back to pull it.",
    start:"5–10 kg on the stack.",
    bonusTip:"Finish each rep with your hands beside your ears, like a double-biceps pose. It builds rear shoulders and helps posture after desk work." },
  { id:"db_curl", name:"Dumbbell Biceps Curl", group:"pull", pattern:"arms", role:"accessory", equip:"dumbbell", level:1,
    muscles:"Biceps",
    how:"Stand tall, elbows at your sides. Curl the dumbbells up while turning your palms up, lower slowly.",
    avoid:"Swinging your body or letting your elbows drift forward.",
    start:"Two 4–6 kg dumbbells.",
    bonusTip:"Lower each rep over 3 seconds. Most beginners drop the weight quickly and miss half the benefit." },
  { id:"hammer_curl", name:"Hammer Curl", group:"pull", pattern:"arms", role:"accessory", equip:"dumbbell", level:1,
    muscles:"Biceps, forearms",
    how:"Palms facing each other throughout. Curl up, pause, lower slowly.",
    avoid:"Rocking your torso to swing the weight.",
    start:"Two 4–6 kg dumbbells.",
    bonusTip:"Hammer curls work the muscle underneath the biceps, which makes your arms look thicker from the front." },
];
```

---

## Feature 2 — Log reps and weight for every set

The core problem includes "beginners don't know whether they're progressing". This feature makes progress visible.

- Each exercise card shows **3 plate buttons** as now. Under each plate: `reps × kg`, pre-filled with **what the user did last time** (or the goal's target reps and blank weight on the first time).
- **Tap a plate** = set done with the pre-filled numbers (one tap, as fast as before).
- **Tap the numbers under a plate** = a bottom sheet with two large steppers: Reps (−/+, 1 step) and Weight (−/+, 2.5 kg steps; 1 kg for dumbbells under 10 kg). Big buttons, usable with sweaty hands.
- A line at the top of each card: **"Last time: 12, 10, 9 reps @ 20 kg. Try to beat one set today."** First time: "First time. Find a weight that feels hard on the last 2 reps."
- Save per set: `{ reps, weight, completedAt }`. Keep compatibility with the old `done: boolean[]` data (treat old `true` as reps = null).

---

## Feature 3 — Workout breakdown after finishing

Replace the simple summary with a **breakdown by section**:

```
┌──────────────────────────────────┐
│ Workout 5 complete               │
│ You showed up.                   │
│                                  │
│ 94 reps   1,840 kg   26 min      │
│                                  │
│ LEGS                     36 reps │
│ Leg Press  12·12·12 @ 40kg  ▲+2  │
│ PUSH                     30 reps │
│ Chest Press 10·10·10 @ 20kg  =   │
│ PULL                     28 reps │
│ Lat Pulldown 10·10·8 @ 25kg ★PB  │
│                                  │
│ [Tips unlocked today: 3]         │
│ 2/3 this week · 1 week streak    │
└──────────────────────────────────┘
```

- Per exercise: reps per set, weight, and a comparison with last time: `▲ +2 reps`, `▲ +2.5 kg`, `=` same, or `▼` (neutral grey, never red; bad days are normal).
- **★ PB** badge when the user beats their best reps at that weight, or lifts a new top weight. This is the "am I progressing?" answer.
- Totals: total reps, total volume (reps × kg), duration.
- Keep the weekly streak, 14-day calendar and "How did today feel?" below.

---

## Feature 4 — Bonus tips in Build muscle mode

- Only when the goal is **Build muscle**.
- When the user logs the **last set of an exercise**, a card slides up inside that exercise: **"Bonus tip unlocked"** + the exercise's `bonusTip`, with a small plate-yellow accent.
- The summary shows **"Tips unlocked today: 3"**, which expands to list them.
- A **"My tips"** list in the History tab collects every tip the user has unlocked, so they can reread them. New exercises = new tips, which gives a reason to try swaps and come back.
- Other goals: show nothing extra (don't invent tips for them yet).

---

## Feature 5 — Front-page photo

- Hero: a real gym photo, **full-bleed on the left or behind the headline**, treated as a **duotone** in the brand colours (`#1E2B30` shadows → `#F2C230` highlights) or darkened with a 70% `#1E2B30` overlay so the headline stays readable.
- **Best option: your own photo** taken at the gym where you tested, with the owner's permission, and with nobody identifiable unless they've agreed. It's authentic, and judges notice.
- Otherwise use a photo from **Unsplash or Pexels** (free licence). Save the photographer credit in the footer.
- Pick an image that shows **equipment and a normal gym**, such as a dumbbell rack, a leg press or a cable station. Avoid shirtless models and "fitness influencer" shots: our user is intimidated by those.
- Self-host it as **WebP/AVIF under 200 KB**, with a proper `alt` text, `width`/`height` set (no layout shift), and `loading="eager"` for the hero only.
- Put it at `public/images/hero.jpg`; Claude Code must not download images from the internet itself.

---

## Feature 6 — Interaction that keeps people coming back (without gimmicks)

Everything here makes the gym visit better. No XP, badges for opening the app, or streak-shaming, which we deliberately cut.

1. **Muscle map.** A simple front/back body outline (inline SVG) at the top of today's workout. Muscles for today's 3 exercises are outlined; each fills plate-yellow as sets are logged. Tapping a muscle scrolls to its exercise.
2. **"Beat last time" target.** On each card (Feature 2). The single strongest reason to return.
3. **PB moments.** When a set beats a personal best, the plate does a short gold pulse and shows "New best!". Once per exercise per workout, respects reduced motion.
4. **Next-workout teaser.** On the summary: "Next time: Workout B. Romanian Deadlift, Shoulder Press, Seated Row." Tapping a name shows its how-to, so users arrive prepared.
5. **Share my workout.** A button on the summary that creates a clean image card (breakdown + streak, brand colours, no personal data) and opens the phone's share sheet (Web Share API) for WhatsApp/Instagram. Doubles as free marketing. Hide the button when sharing isn't supported.
6. **Landing page "Try the swap".** The interactive swap demo from `CLAUDE.md` section 4.1 — the first interaction visitors have.

---

## Scope note for your deck

Features 2, 3 and 4 move "progress tracking" into V1. That's justified because the challenge brief lists "don't know whether they're progressing" as a core beginner problem. Update deck slide 3 (V1/V2/Cut table) so it matches, and mention the reason on slide 4.

---

## Prompts for Claude Code (one at a time)

**Prompt A — Library**
> Read FEATURES.md Feature 1. Replace the exercise library in `src/engine/` with the 24 exercises provided, keeping the old bodyweight exercises as fallbacks. Update workout generation (main before accessory, one per group) and the swap engine (pattern → group → bodyweight, existing reason logic). Update unit tests.

**Prompt B — Rep and weight logging**
> Implement Feature 2: per-set reps and weight, pre-filled from last time, one-tap logging, the stepper bottom sheet, and the "Last time" line. Migrate old saved data safely.

**Prompt C — Breakdown summary**
> Implement Feature 3: the section-by-section summary with comparisons, PB detection, totals, and duration. Keep streak, calendar and feel rating below.

**Prompt D — Bonus tips**
> Implement Feature 4: bonus tip unlock card in Build muscle mode, "Tips unlocked today" on the summary, and a "My tips" list in History.

**Prompt E — Hero photo**
> Implement Feature 5 using the image I placed at `public/images/hero.jpg`. Apply the duotone or overlay treatment, optimise it to WebP/AVIF, and add the credit line in the footer if I tell you it's from Unsplash or Pexels.

**Prompt F — Engagement**
> Implement Feature 6 items 1–5: muscle map, PB pulse, next-workout teaser, and share card via Web Share API. Respect reduced motion and the design system. Then run all Playwright tests and fix anything that breaks.
