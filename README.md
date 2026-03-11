# RLAI-M Website

## Prerequisites
This project requires Node.js and `npm`.

### macOS
Install with Homebrew:

```bash
brew install node
```

### Ubuntu
Install with your package manager:

```bash
sudo apt update
sudo apt install nodejs npm
```

## Local preview
1. Install dependencies:
   `npm install`
2. Start the local development server:
   `npm run dev`

Open the local preview URL `http://localhost:8080`.

## Files to edit
- `src/_data/site.json`: profile, contact details, site-wide metadata
- `src/_data/navigation.json`: top navigation labels and URLs
- `src/_data/news.json`: homepage news items
- `src/members/*.json`: one JSON file per current lab member
- `src/alumni/*.json`: one JSON file per alumnus
- `src/publications/*.bib`: one BibTeX file per publication
- `src/teaching-items/*.md`: one Markdown file per teaching item
- `src/content/home-bio.md`: homepage bio text
- `src/content/research-focus.md`: lab research focus text
- `src/content/prospective-students.md`: prospective-student

## Shared structure
- `src/_includes/layouts/base.njk`: shared HTML shell
- `src/_includes/layouts/page.njk`: standard layout for interior pages
- `src/_includes/partials/navigation.njk`: primary site navigation
- `src/assets/css/main.css`: global styles
