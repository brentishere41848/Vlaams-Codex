# Vlaams Codex Website

Professional website for Vlaams Codex - a programming language using Flemish dialect keywords.

## 🌐 Live Demo

Visit the live website at: [vlaamscodex.dev](https://vlaamscodex.dev)

## 📦 Package

Vlaams Codex is available on PyPI:

- **PyPI**: https://pypi.org/project/vlaamscodex/

## 🐦 Social Media

- **X (Twitter)**: https://x.com/vlaamscodex

## 📁 Structure

```
website/
├── index.html              # Landing page
├── docs/
│   └── index.html         # Documentation hub
├── examples/
│   └── index.html         # Examples gallery
├── assets/
│   ├── css/
│   │   ├── main.css       # Core styles
│   │   ├── responsive.css # Mobile & responsive
│   │   └── components.css # Reusable components
│   ├── js/
│   │   ├── main.js        # Main JavaScript
│   │   └── language-switcher.js # Bilingual support
│   ├── images/
│   │   └── logo.svg      # Logo
│   └── fonts/            # (Google Fonts loaded externally)
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Pages deployment
```

## 🚀 Features

- **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- **Bilingual Support** - English and Plat Vlaams with language switcher
- **Modern UI** - Clean, professional design inspired by Rust-lang and Go.dev
- **Fast Performance** - Static HTML/CSS/JS, no framework overhead
- **Accessible** - WCAG AA compliant, keyboard navigation, screen reader friendly
- **Interactive Elements** - Smooth animations, hover effects, code highlighting

## 🛠️ Local Development

### Prerequisites

- A web browser
- (Optional) A local web server

### About Vlaams Codex Package

The website references the `vlaamscodex` package which is available on multiple package managers:

**PyPI (Python)**: https://pypi.org/project/vlaamscodex/
```bash
pip install vlaamscodex
```

**npm (Node.js)**: https://www.npmjs.com/package/vlaamscodex
```bash
npm install vlaamscodex
```

### Running Locally

#### Option 1: Python (Simple)
```bash
cd website
python -m http.server 8000
```
Then visit: http://localhost:8000

#### Option 2: Node.js (Using `serve`)
```bash
cd website
npx serve .
```
Then visit: http://localhost:3000

#### Option 3: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

## 🤖 Plat Vlaams‑Only AI (zonder auth, gratis/local)

De AI‑chat werkt met **Ollama** (gratis/local). Geen betaalde fallback.

### 1) Ollama (aanbevolen)

Start Ollama + zet uw model klaar, bv:

```bash
ollama serve
ollama pull llama3.1
```

Op de AI pagina kunt ge in “Instellingen” het model en endpoint zetten (default `http://localhost:11434`).

Als ge geen lokaal model hebt draaien: ge ziet in de chat **“AI is offline, start uw lokaal model (Ollama).”**

### Vercel (domein-hosting)

De site kan op Vercel draaien via:
- **Zet Vercel “Root Directory” op `website/`**
- `website/api/chat.js` (serverless `POST /api/chat`)

Als ge nog altijd 404 krijgt op `/api/chat`: check da ge Vercel “Root Directory” op `website/` hebt staan, en dat ge effectief deployed als Vercel project (ni via puur “static export”).

Belangrijk: op Vercel werkt `OLLAMA_BASE_URL=http://localhost:11434` **niet**. Zet `OLLAMA_BASE_URL` naar uw eigen publiek bereikbare Ollama (self-hosted) of gebruik de UI “Instellingen” met een endpoint dat CORS toelaat.

Als ge `503` ziet op `/api/chat`: da wil zeggen dat Vercel uw Ollama ni kan bereiken (meestal omdat `OLLAMA_BASE_URL` nog op `localhost` staat).

### 2) (Optioneel) Docker Compose (local LLM)

Er staat een optionele `docker-compose.local-llm.yml` klaar (Ollama). Dit is **CPU‑vriendelijk maar traag**, GPU is aanbevolen.

```bash
docker compose -f docker-compose.local-llm.yml up -d
```

Opmerking: ge moet nog een model pullen (zie comments in de compose file) en `OLLAMA_MODEL` juist zetten.

### Building for Production

The website is already optimized for production. All CSS and JS are minified-ready. If you want to minify further:

```bash
# Using CSSNano
npx cssnano assets/css/main.css assets/css/main.min.css
npx cssnano assets/css/responsive.css assets/css/responsive.min.css
npx cssnano assets/css/components.css assets/css/components.min.css

# Using Terser for JS
npx terser assets/js/main.js -o assets/js/main.min.js
npx terser assets/js/language-switcher.js -o assets/js/language-switcher.min.js
```

Then update references in HTML files to use `.min.css` and `.min.js` versions.

## 📦 Deployment

### GitHub Pages (Recommended)

The repository includes a GitHub Actions workflow that automatically deploys the website to GitHub Pages.

#### To Enable:

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Pages**
3. Under **Build and deployment**, select **Source** > **GitHub Actions**
4. The workflow in `.github/workflows/deploy.yml` will run automatically on push to `main` branch

#### Manual Deployment:

```bash
# Build (if needed)
cd website

# Deploy to gh-pages branch
git checkout --orphan gh-pages
git add -A
git commit -m "Deploy website"
git push origin gh-pages
```

Then enable GitHub Pages from `gh-pages` branch in repository settings.

### Other Hosting Options

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd website
netlify deploy --prod
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd website
vercel --prod
```

#### Custom Hosting
Simply upload the `website/` folder contents to your web server.

## 🎨 Customization

### Colors

Edit CSS variables in `assets/css/main.css`:

```css
:root {
    --primary-color: #000000;
    --primary-dark: #000000;
    --primary-light: #111111;
    --secondary-color: #FFD700;     /* Gold */
    --accent-color: #2C3E50;       /* Dark Gray */
    /* ... more variables */
}
```

### Typography

Fonts are loaded from Google Fonts. To change, update the `<link>` tags in HTML files and update `--font-heading` and `--font-mono` CSS variables.

### Content

All text content is in HTML files. The language switcher uses `data-lang` attributes:

```html
<h1 data-lang="en">English Title</h1>
<p data-lang="vl">Vlaamse Titel</p>
```

Translations are in `assets/js/language-switcher.js`.

### Images

Replace `assets/images/logo.svg` with your own logo. SVG format is recommended for crisp scaling.

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Large Desktop**: > 2560px

## 🌍 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## ♿ Accessibility

- Semantic HTML5 elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader compatible
- WCAG AA color contrast
- Focus indicators
- Alt text on images

## 🔧 JavaScript Features

- Mobile menu toggle
- Smooth scrolling
- Language switcher (bilingual)
- Copy code buttons
- Dark mode support
- Tooltip functionality
- Accordion components
- Tab navigation
- Modal dialogs
- Toast notifications

## 📄 Pages

### index.html
Main landing page with hero section, features, quick start, dialect showcase, examples preview, and community links.

### docs/index.html
Documentation hub with installation guide, language specification, CLI reference, multi-Vlaams dialects, and magic mode explanation.

### examples/index.html
Examples gallery with filterable code examples including Hello World, Calculator, Functions, Fibonacci, Fortune Teller, and String Manipulation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Adding Content

### Adding New Examples

1. Create new example file in `examples/code-blocks/`
2. Add entry to `examples/index.html` gallery
3. Update filter categories if needed

### Adding Documentation

1. Create new HTML file in `docs/`
2. Add link to sidebar in `docs/index.html`
3. Follow existing documentation styling

### Adding Translations

Edit `assets/js/language-switcher.js` to add new languages and translations.

## 🐛 Troubleshooting

### Local Server Not Working
- Make sure port 8000 or 3000 is not in use
- Try a different port: `python -m http.server 8888`

### Images Not Loading
- Check file paths are correct relative to HTML file
- Ensure image files exist in `assets/images/`

### Language Switcher Not Working
- Check browser console for errors
- Ensure `language-switcher.js` is loaded before `main.js`

## 📄 License

This website is part of Vlaams Codex project and is licensed under MIT License.

## 🙏 Credits

- **Design Inspiration**: Rust-lang.org, Go.dev
- **Icons**: Emoji (Unicode)
- **Fonts**: Inter & Fira Code (Google Fonts)
- **Browser Testing**: Modern browsers

## 📞 Support

For issues or questions:
- GitHub Issues: https://github.com/brentishere41848/Vlaams-Codex/issues
- Documentation: https://vlaamscodex.dev/docs/

---

Made with ❤️ in Flanders
