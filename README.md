# AI HUB

Bloomberg-inspired AI intelligence terminal for news, research, and model insights—rendered as a sleek single-page app with a faux-terminal flair.

- **Live site**: https://aihublabs.xyz/
- **Build video folder**: https://drive.google.com/drive/folders/15cg6juePReh-uyDSP8ROw4JFEZn_kXY8?usp=sharing

## Tech Stack

- Pure HTML, CSS, and JavaScript for easy deployment on a droplet
- Local JSON feeds to simulate API-driven data (news, papers, model specs)
- Lightweight client-side search and filtering (e.g., `Ctrl+K` command palette)

## Planned Experience

- **Terminal Bloomberg vibe**: dense panels, neon accents, and soft scanlines to sell the console aesthetic.
- **Live-feeling data**: JSON-backed sections for Latest News, Research Drops, and Model Comparisons, each with real outbound links.
- **Productivity helpers**: global command palette, inline filters/tags, subtle loading states to hint at API calls.
- **Media intelligence**: embedded explainers and trending X/Twitter chatter to contextualize the data streams.

## Getting Started

1. Use any static server (or just open `index.html`) to load the UI locally.
   - Example: `npx serve` → open the served URL.
2. Data is fetched from `/data/*.json`, so keep the folder structure intact if you move things.
3. Tap `Ctrl + K` (or click the badge) to open the global search palette.

## Data Feeds

| Stream   | File                 | Notes                                                 |
|----------|----------------------|-------------------------------------------------------|
| News     | `data/news.json`     | Real outbound links to active article pages.          |
| Research | `data/research.json` | Pulls from arXiv and lab posts, grouped by org.       |
| Models   | `data/models.json`   | Specs + benchmark snapshots for comparison cards.     |
| Videos   | `data/videos.json`   | Curated YouTube explainers with durations + channels. |
| Social   | `data/social.json`   | Trending X/Twitter posts proxied via Thread Reader.   |

Modify any JSON file and the UI will automatically reflect the changes on reload—no build process needed.

## Keyboard + Filters

- `Ctrl + K` / `Cmd + K` — open the command palette search.
- Filter chips let you isolate News, Research, or Model panels visually.
- Tag pills constrain News + Research feeds to a focused topic (NLP, Hardware, etc.).

## Deployment

- Production checklist lives in `docs/DEPLOYMENT.md` (droplet build, Nginx config, DNS/TLS, and maintenance steps).
- Always document infra changes in Git to keep grading artefacts transparent.

## Progress Log

1. Repo initialized and roadmap documented (`bootstrapping-the-ai-terminal`).
2. Bloomberg-style terminal scaffolded with JSON-fed panels, command palette, and filters (`bloomberg-but-make-it-ai`).
3. Model matrix redesigned, dispatch directory added, and media/social streams wired up (`dispatches-go-multimedia`).
