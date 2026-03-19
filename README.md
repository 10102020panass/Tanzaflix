# Tanzaflix 🎬

**Tanzaflix** is a Netflix-style African cinema streaming web application built with HTML, CSS, and vanilla JavaScript. It showcases movies and shows from Tanzania and across the African continent.

## Features

- 🎬 **Hero banner** – Featured film with play and info buttons
- 🔥 **Browseable rows** – Trending, New Releases, Top Rated, African Cinema
- 🔍 **Live search** – Filter titles by name, genre, year or description
- ➕ **My List** – Add / remove titles, persisted via `localStorage`
- 🪟 **Movie modal** – Detailed view with actions for each title
- 📱 **Responsive** – Works on mobile, tablet, and desktop
- ♿ **Accessible** – Semantic HTML, ARIA labels, keyboard navigation

## Getting Started

No build step required — open `index.html` directly in a browser:

```bash
# Clone the repository
git clone https://github.com/10102020panass/Tanzaflix.git
cd Tanzaflix

# Open in your default browser
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

Or serve with any static file server:

```bash
npx serve .
# → http://localhost:3000
```

## Project Structure

```
Tanzaflix/
├── index.html   # Main page structure (HTML5)
├── style.css    # Dark Netflix-style theme (CSS3)
├── movies.js    # Mock movie/show catalogue data
├── app.js       # Interactive logic (search, modal, watchlist)
└── README.md
```

## Tech Stack

- **HTML5** – Semantic markup with ARIA accessibility attributes
- **CSS3** – Custom properties, flexbox/grid, smooth transitions
- **Vanilla JavaScript** – No frameworks or build tools required

## License

MIT
