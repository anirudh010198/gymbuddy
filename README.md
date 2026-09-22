# GymBuddy V1

A mobile-first web app for beginner gym-goers: three exercises a day, one-line form cues, a one-tap **Swap** when a machine is busy, tap-to-log sets, and a weekly streak. No sign-up, no install, works offline once loaded.

Built for the PML Product Challenge.

---

## Run it in VS Code (2 minutes)

1. Unzip the folder and open it in VS Code: **File → Open Folder… → `gymbuddy`**.
2. Install the **Live Server** extension (by Ritwick Dey) from the Extensions panel.
3. Right-click `index.html` → **Open with Live Server**.
4. It opens at `http://127.0.0.1:5500`. Press `F12` → toggle device toolbar (`Ctrl+Shift+M`) to view it as a phone.

No Live Server? Double-clicking `index.html` also works in Chrome or Edge.

**Test on your phone:** with Live Server running, open `http://<your-laptop-IP>:5500` on a phone on the same Wi-Fi. Find your IP with `ipconfig` (Windows) or `ifconfig` (Mac/Linux).

---

## Two modes, one site

| URL | Who it's for | What they see |
|---|---|---|
| `/` | Testers and users | The GymBuddy app only |
| `/?team` | You, the product team | App + **Interviews** and **Test funnel** tabs |

In team mode, interviews and funnel data are saved **in that browser only**. Use the same laptop/phone for all research, and click **Download research data (JSON)** in the Interviews tab after each session as a backup.

The **Insights** (AI synthesis) tab only works in the Claude-hosted version; on your own website it shows as unavailable. The rest of the app never depends on AI.

---

## Put it online (free)

**Fastest: Netlify Drop**
Go to https://app.netlify.com/drop and drag the whole `gymbuddy` folder in. You get a public link in seconds.

**GitHub Pages**
1. Create a repo, push this folder.
2. Repo → Settings → Pages → Deploy from branch → `main` / root.
3. Your site: `https://<username>.github.io/<repo>/`

**Vercel**
`npx vercel` inside the folder, accept the defaults.

---

## Project structure

```
gymbuddy/
├── index.html          Page shell
├── css/
│   ├── tailwind.css    Compiled Tailwind (no CDN, works offline)
│   └── styles.css      GymBuddy design tokens, light/dark themes, components
├── js/
│   └── app.js          All app logic (see map below)
├── src/input.css       Tailwind source, only needed to rebuild CSS
├── tailwind.config.js
└── package.json        Optional scripts
```

### Map of `js/app.js`

| Section | What it does |
|---|---|
| `LIB` | The 26-exercise library: name, movement slot, equipment, level, cues, starting weight |
| `TEMPLATES`, `GOALS` | Workout A/B rotation; reps and rest per goal |
| `load` / `save` / `track` | LocalStorage state and event log |
| `weekStart`, `streakWeeks` | Weekly streak logic (rest days never break it) |
| `buildWorkout`, `swapCandidate` | Workout generator and reason-aware swap engine |
| `renderOnboarding` … `renderSummary` | The four app screens |
| `localDB` | Browser-storage database used in `?team` mode |
| `renderInterviews`, `renderFunnel` | Research console |

### Common edits

**Add an exercise:** copy any line in `LIB` and change it. `slot` must be one of `squat`, `hinge`, `hpush`, `vpush`, `vpull`, `hpull`; `equip` one of `machine`, `cable`, `dumbbell`, `barbell`, `bodyweight`. Lower `lvl` = more beginner-friendly. Order within a slot is the default pick order.

**Change reps or rest:** edit `GOALS`.

**Change colours:** edit the variables at the top of `css/styles.css`.

**Reset your own progress while testing:** DevTools → Application → Local Storage → delete `gymbuddy.v1` (app) or `gymbuddy.team` (research).

---

## Using new Tailwind classes

`css/tailwind.css` contains only the classes currently used. If you add new Tailwind classes in `index.html` or `app.js`, rebuild it (requires Node.js):

```bash
npm install
npm run build:css      # or: npm run watch:css while editing
```

---

## Build log highlights

| What broke | Fix |
|---|---|
| Layout collapsed with no internet (styling came from a CDN) | Compiled Tailwind into `css/tailwind.css` |
| Leaving mid-workout and returning wiped logged sets | "Resume today's workout" |
| "Busy" swaps suggested another machine in the same crowded area | Reason-aware ranking in `swapCandidate` |
| Daily streak reset on rest days | Weekly streak against the user's own target |
| Website version: testers added in team mode didn't appear | Research console started before the page finished loading; deferred it by one tick |
