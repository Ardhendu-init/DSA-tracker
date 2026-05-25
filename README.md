# DSA Revision Tracker

A clean, modern, and fully offline web app to help students preparing for coding interviews and placements track their DSA practice and schedule smart revisions.

![DSA Tracker](https://img.shields.io/badge/HTML-CSS-JS-blue?style=flat-square) ![No Dependencies](https://img.shields.io/badge/backend-none-green?style=flat-square) ![localStorage](https://img.shields.io/badge/storage-localStorage-orange?style=flat-square)

---

## Features

### Add & Manage Questions
- Save questions with: name, link, platform, topic tags, approach notes, time complexity, confidence level (1–5), last revised date, and mistake notes
- Edit or delete any question at any time

### Smart Revision Scheduling
Automatically calculates the next revision date based on your confidence:

| Confidence | Next Revision |
|------------|--------------|
| 1 – Very Weak | +2 days |
| 2 – Weak | +3 days |
| 3 – Medium | +5 days |
| 4 – Strong | +7 days |
| 5 – Very Strong | +10 days |

Overdue questions are flagged with an animated **Revise Now** badge.

### Color-Coded Rows
- 🔴 **Red** — Confidence 1–2 (Weak)
- 🟡 **Yellow** — Confidence 3 (Medium)
- 🟢 **Green** — Confidence 4–5 (Strong)

### Dashboard
At a glance see:
- Total questions solved
- Weak questions (confidence ≤ 2)
- Strong questions (confidence ≥ 4)
- Most frequent weak topic

### Search & Filter
- Search by question name
- Filter by platform (LeetCode, GFG, Codeforces, Other)
- Filter by confidence level
- Filter by topic tag
- Sort by newest, next revision date, or confidence

### Mistake Tracking
Click the eye icon on any question to view a detail panel with approach notes, time complexity, and highlighted mistake notes.

### Bonus
- **Mark as Revised** button — updates last revised date to today in one click
- **Dark mode** toggle with persistence
- Fully **responsive** — works on mobile and desktop

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, grid, flexbox) |
| Logic | Vanilla JavaScript (ES6+) |
| Storage | Browser `localStorage` |
| Icons | Font Awesome 6 |
| Font | Inter (Google Fonts) |

No build tools, no frameworks, no backend — just open `index.html` in any browser.

---

## Getting Started

```bash
git clone https://github.com/Ardhendu-init/DSA-tracker.git
cd DSA-tracker
```

Then open `index.html` in your browser. That's it.

> Since the app uses `localStorage`, all your data stays in the browser — no server or database needed.

---

## Project Structure

```
dsa-tracker/
├── index.html    # HTML structure & modals
├── styles.css    # All styling, theming & dark mode
└── app.js        # State management, CRUD, render logic
```

---

## Screenshots

> Light mode and dark mode both supported out of the box.

| Dashboard | Add Question | Detail View |
|-----------|-------------|-------------|
| Stats cards at the top | Full-featured form modal | Approach, complexity & mistake notes |

---

## License

MIT — free to use, modify, and share.
