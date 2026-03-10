# Site Architecture

This document mirrors the initial scaffold plan and should stay current as the site evolves.

## Core principles

- Prefer clarity over abstraction.
- Keep content editing in `src/_data` and `src/content`.
- Keep shared structure in a small number of layouts and partials.
- Avoid introducing advanced Eleventy features unless they reduce maintenance cost.

## Page model

- `src/index.njk`: homepage
- `src/lab.njk`: lab overview, members, alumni
- `src/publications.njk`: publications archive
- `src/teaching.njk`: teaching history
- `src/contact.njk`: contact details, calendar, prospective student info

## Shared templates

- `src/_includes/layouts/base.njk`: page shell, metadata, header, footer
- `src/_includes/layouts/page.njk`: shared interior-page wrapper
- `src/_includes/partials/navigation.njk`: top navigation

## Content sources

- Structured list data lives in `src/_data/*.json`
- Longer prose lives in `src/content/*.md`
- Images and downloadable files live in `src/assets/`

## Editing workflow

1. Update data or markdown content.
2. Run `npm run dev`.
3. Check the page locally.
4. Only edit layouts or CSS if the content cannot be expressed with existing structure.
