# RLAI Website Scaffold

Minimal Eleventy scaffold for an academic lab website.

## Getting started

1. Install dependencies:
   `npm install`
2. Start the local development server:
   `npm run dev`
3. Create a production build:
   `npm run build`

## Files you will edit most often

- `src/_data/site.json`: faculty profile, contact details, site-wide metadata
- `src/_data/navigation.json`: top navigation labels and URLs
- `src/_data/news.json`: homepage news items
- `src/members/*.json`: one JSON file per current lab member
- `src/alumni/*.json`: one JSON file per alumnus
- `src/publications/*.bib`: one BibTeX file per publication
- `src/teaching-items/*.md`: one Markdown file per teaching item
- `src/content/home-bio.md`: homepage bio text
- `src/content/research-focus.md`: lab research focus text
- `src/content/prospective-students.md`: prospective-student guidance

## Shared structure

- `src/_includes/layouts/base.njk`: shared HTML shell
- `src/_includes/layouts/page.njk`: standard layout for interior pages
- `src/_includes/partials/navigation.njk`: primary site navigation
- `src/assets/css/main.css`: global styles

## Notes for maintainers

- Keep structured lists in `src/_data`.
- Keep current lab members as one JSON file per person in `src/members/`.
- Keep alumni as one JSON file per person in `src/alumni/`.
- Keep publications as one BibTeX file per paper in `src/publications/`.
- Keep teaching items as one Markdown file per course in `src/teaching-items/`.
- Keep longer prose in `src/content`.
- Avoid editing layout files unless you are changing site structure or presentation.
