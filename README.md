# mega-s01e03-what-it-shows

Support ticket `#4471` merged the reports about dates on subject lines and was marked known. This repo splits it into the problems it holds, one GitHub issue per problem, and adds a signed page about them to the support kb.

| Path | What it is |
|---|---|
| [issues](https://github.com/JakSko/mega-s01e03-what-it-shows/issues) | One ticket per problem, each with how many reports it covers |
| `support-kb/` | The kb export as the desk gave it, plus the new page and its component |
| `support-kb/src/routes/kb/incidents/4471/split/+page.svx` | The new page (the `.svx`), signed |
| `support-kb/src/lib/kb/ProblemTable.svelte` | The component that computes the page's numbers from the export |
| `rendered/` | The kb as the desk sees it: static HTML built from `support-kb/src`. The new page is `rendered/kb/incidents/4471/split.html` |
| `render/` | The build setup used for `rendered/` (SvelteKit 3.1.0, mdsvex 0.12.8, Vite 8.3.4) |

To rebuild `rendered/`: copy `support-kb/src` into a folder with the files in `render/` (`app.html` into `src/`, `+layout.js` into `src/routes/`), run `npm ci --ignore-scripts`, then `npm run build`.
