[README.md](https://github.com/user-attachments/files/26244552/README.md)
[README.md](https://github.com/user-attachments/files/26244552/README.md)
# 🏋️ IronLog

A self-contained, mobile-first hypertrophy training app built as a single HTML file. No app store, no account, no internet required after first load. Designed to live on your iPhone home screen.

---

## Features

**Smart program** — 6 training blocks × 3 full-body days, rotating automatically every 14 days. 12 weeks of unique training before anything repeats.

| Block | Theme |
|-------|-------|
| Block 1 | Barbell Compounds |
| Block 2 | Dumbbell & Machine |
| Block 3 | Power & Strength Bias |
| Block 4 | Isolation & Volume |
| Block 5 | Cable & Unilateral |
| Block 6 | Hybrid Strength–Hypertrophy |

**Progressive overload** — The app tracks your weights and automatically suggests heavier loads when you hit the top of the rep range across all sets (+2.5%).

**Tap-to-cycle reps** — Tap the reps button to cycle down from the top of the target range. No typing needed.

**Exercise swap** — Tap ⇄ Swap on any exercise during a workout to replace it with an alternative that hits the same muscle. Useful when equipment is unavailable or broken.

**Edit completed sets** — Double-tap the 💪🏻 emoji on a completed set to enter edit mode and correct a mistake.

**Rest timer** — 90-second countdown starts automatically after each completed set.

**Persistent storage** — All workout history, weights, and progress are saved locally in the browser using `localStorage`. Data survives closing the app and rebooting the phone.

---

## Installation on iPhone

The recommended way to use IronLog is as a home screen web app in Safari.

**Via Netlify Drop (recommended)**

1. Go to [netlify.com/drop](https://netlify.com/drop) on your computer
2. Drag and drop `ironlog.html` onto the page
3. Copy the generated URL (e.g. `https://your-app.netlify.app`)
4. Open the URL in Safari on your iPhone
5. Tap the Share button → **Add to Home Screen**
6. Tap **Add** — IronLog now lives on your home screen

**Via GitHub Pages**

1. Fork or clone this repository
2. Go to Settings → Pages → set source to `main` branch / root
3. Open the generated URL in Safari on your iPhone
4. Share → Add to Home Screen

> ⚠️ Always open the app from the home screen icon, not by navigating to Safari separately. Your workout data is stored at that specific URL. Opening from a different URL means a fresh, empty database.

---

## Data & Privacy

- All data is stored **on your device only** using `localStorage`
- Nothing is sent to any server
- No analytics, no tracking, no ads
- Clearing Safari website data in iPhone Settings will erase your workout history

---

## Tech Stack

| | |
|---|---|
| **Framework** | None — vanilla HTML, CSS, JavaScript |
| **Dependencies** | Google Fonts (Barlow Condensed + DM Sans) — loaded from CDN |
| **Storage** | Browser `localStorage` |
| **File size** | ~64 KB |

---

## Program Details

**Split:** 3-day full-body, rotate A → B → C, then repeat regardless of calendar week

**Frequency:** Maximum 3 sessions per week, rest at least 1 day between sessions

**Block rotation:** Every 14 days, the exercise selection changes automatically based on the calendar. Same muscle groups, different exercises — keeps training fresh and prevents adaptation.

**Progressive overload logic:** When you hit the top of the rep range on every set of an exercise, the app suggests a ~2.5% weight increase next session (rounded to nearest 0.5 kg).

**Exercise swap library:** 60+ exercises across 8 muscle groups available as swap alternatives at any time during a workout.

---

## File Structure

```
ironlog.html    ← the entire app, single file
README.md       ← this file
```

---

## License

Personal use. Feel free to modify for your own training needs.
