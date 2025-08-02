# Paritosh Dwivedi Portfolio Website

A modern portfolio website built with React, Vite, and Tailwind CSS, showcasing projects and skills in quantitative finance and programming.

## Features

- Responsive design with glass morphism UI
- Project showcase with detailed project pages
- Contact form with EmailJS integration
- Smooth animations with Framer Motion
- Optimized for performance

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to Netlify

This site is configured to deploy to Netlify with the custom domain `ParitoshDwivediQuant.com`.

### Deployment Steps

1. Push your code to a GitHub repository
2. Log in to Netlify and create a new site from the GitHub repository
3. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Set up the custom domain:
   - Go to Domain Management in Netlify
   - Add the custom domain: `ParitoshDwivediQuant.com`
   - Follow Netlify's instructions to configure DNS settings

### Environment Variables

For the contact form to work, you need to set up the following environment variables in Netlify:

- `VITE_EMAILJS_SERVICE_ID`: Your EmailJS service ID
- `VITE_EMAILJS_TEMPLATE_ID`: Your EmailJS template ID
- `VITE_EMAILJS_USER_ID`: Your EmailJS user ID

## Screenshots

| Landing / Hero | Project Detail |
| -------------- | -------------- |
| ![Hero](./docs/hero.png) | ![Detail](./docs/detail.png) |

Add your own screenshots in the `docs/` folder if you wish.

## Technology Stack

| Layer          | Tech                                    |
| -------------- | --------------------------------------- |
| Front-end      | React 18, Vite                          |
| Styling        | Tailwind CSS, custom CSS modules        |
| Animations     | Framer Motion                           |
| Icons          | React Icons                             |
| Email / Forms  | EmailJS                                 |
| Deployment     | Netlify (CI)                            |

## Project Structure

```
portf-web/
├─ public/              # Static assets (favicons, images)
├─ src/
│  ├─ assets/           # Project thumbnails & visuals
│  ├─ components/       # Re-usable UI widgets
│  ├─ pages/            # Routed pages (ProjectDetail, …)
│  ├─ App.jsx           # Main component
│  ├─ main.jsx          # Vite entry
│  └─ index.css         # Tailwind base styles
├─ docs/                # README screenshots (optional)
└─ …
```

## Continuous Deployment

Every push to the `main` branch automatically triggers a Netlify build & deploy (see `netlify.toml`).  Preview deploys are generated for PRs.

## Local Environment Variables

Create a `.env` file at the project root:

```
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_USER_ID=your_public_key
```

## Contributing

1. Fork the repo & create your branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -m 'Add some feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a pull request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Feel free to reach out via the contact form on the site or by emailing **paritosh.dwivedi96@gmail.com**.

---

_Star this repo ⭐ if you find it useful!_

## Contact Form Setup

The contact form uses EmailJS to send emails without a backend. To set it up:

1. Create an account at [EmailJS](https://www.emailjs.com/)
2. Create a service (e.g., Gmail, Outlook)
3. Create an email template with the following variables:
   - `from_name`: Sender's name
   - `reply_to`: Sender's email
   - `message`: Message content
4. Update the EmailJS configuration in `App.jsx` with your service ID, template ID, and user ID
