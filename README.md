# CJ Portfolio

Personal portfolio website for Christian Jan Villalba, a web and app developer. It presents his services and selected work, and gives visitors a way to get in touch.

## Live Website

[Live Website](https://www.workwithcj.digital)

## Overview

A single-page static site. Sections, in order: hero with a featured video, About with statistics, Services, Portfolio, Testimonials, FAQ and Contact. There is no build step, framework or backend. The only external services are Google Fonts, YouTube (for the hero video) and Web3Forms (for contact submissions).

## Features

- Dark and light themes. Dark is the default, and the visitor's choice is saved in `localStorage`.
- Portfolio grid with three category tabs (Websites & Landing Pages, Web & Mobile Apps, Others) and a fade transition between categories.
- Project thumbnails with a darkened overlay and an external-link icon on hover. Project links open in a new tab.
- Two contact forms, one in a "Start a project" modal and one in the Contact section, both sent through Web3Forms.
- About statistics that animate with a character-decode effect the first time they scroll into view.
- Scroll-triggered reveal animations, including left and right slide-ins for portfolio cards.
- Animated topographic background, a scrolling "areas of work" strip and a vertically scrolling testimonials column that slows on hover.
- FAQ accordion, back-to-top button and a header that changes style once the page is scrolled.
- Hero video that loads a YouTube embed only after the play button is clicked.
- Responsive layout with breakpoints for tablet and mobile.

### Accessibility

The site includes accessibility-oriented practices: labelled controls, a modal that closes with Escape and returns focus to its trigger, focus-visible styles, and `prefers-reduced-motion` support that disables the stat animation, marquees and card slide-ins. It has not been audited against WCAG.

## Tech Stack

| Technology | Use |
| --- | --- |
| HTML5 | Page structure and content |
| CSS3 | Layout, themes (CSS custom properties), responsive breakpoints, animations |
| JavaScript (vanilla) | Theme toggle, modal, form handling, filtering, `IntersectionObserver` reveals, stat animation, marquees |
| [Web3Forms](https://web3forms.com/) | Receives contact form submissions, so no custom backend is needed |
| [Google Fonts](https://fonts.google.com/) | Inter typeface |
| YouTube embed | Hero video |
| GitHub Pages | Hosting |

No npm packages, frameworks or animation libraries are used.

## Project Structure

```text
/
├── index.html      # All page markup
├── styles.css      # Styling, themes, responsive rules, animations
├── script.js       # All interactive behavior
├── logo.png        # Logo and favicon
├── portrait.jpg    # About section photo
├── website1.png    # Project thumbnails referenced in the portfolio
├── website2.png
├── placeholder.jpg # Placeholder thumbnail for projects not yet added
└── README.md
```

## Getting Started

Clone the repository:

```bash
git clone https://github.com/cj-vllb/CJ-Portfolio.git
cd CJ-Portfolio
```

### Local development

There is nothing to install. Open `index.html` in a browser, or serve the folder locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. The fonts, hero video and contact forms need an internet connection.

### Workflow

1. Edit `index.html`, `styles.css` or `script.js`.
2. Check the result in the browser, including the theme toggle and a narrow viewport.
3. Commit and push to GitHub. GitHub Pages publishes the update.

The stylesheet and script are linked with `?v=` query strings in `index.html`. Bump them when you change those files so browsers don't serve cached copies.

## Contact Forms

Both forms post to `https://api.web3forms.com/submit` from `script.js`. Submissions are checked on the client (name, a valid email and a message), include a hidden honeypot field and use the subject "New Portfolio Inquiry". The visitor's email is set as the reply-to address. The Web3Forms access key lives in the form markup in `index.html` and is deliberately not repeated here.

## Deployment

The site is deployed with GitHub Pages as plain static files. The repository has no GitHub Actions workflow or build configuration. The publishing branch and folder are set in the repository's Pages settings.

## Project Status

The portfolio is a work in progress. Some portfolio cards still use placeholder titles, images and links, and the hero video ID is not set yet. Content will be updated as more projects are completed.

## License

No license file is included in the repository, so the code is not licensed for reuse.
