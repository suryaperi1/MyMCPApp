# Simple Node.js Markdown Blog

This project is a minimal blog app that serves Markdown posts from a folder and lets you create new posts via a web form.

## Features

- List Markdown posts from `posts/`
- Render `.md` posts as HTML via `markdown-it`
- Create new Markdown posts with form input (stored in `posts/` folder)
- Basic responsive CSS in `public/style.css`

## Project Structure

- `app.js` - Express app with routing and markdown rendering
- `posts/` - Post storage folder (each file is `.md`)
- `public/` - static assets (styles)
- `package.json` - app metadata and dependencies

## Sample post

- `posts/hello-world.md` included as starter content

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the server:

   ```bash
   npm start
   ```

3. Open browser:

   - `http://localhost:3000/` : post list
   - `http://localhost:3000/new` : add a new post

## Usage

- To create a post, go to `/new`, enter a title + markdown body, and submit.
- Each title is auto-slugified into a filename under `posts/`.
- Existing post collisions produce 409 conflict.
- To view a post: click it on home page.

## Notes

- This is intended for local development and learning; no authentication is provided.
- For production, add stronger validation, file locking, security checks, and rate limiting.
