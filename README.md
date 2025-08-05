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

## Contact Form Setup

The contact form uses EmailJS to send emails without a backend. To set it up:

1. Create an account at [EmailJS](https://www.emailjs.com/)
2. Create a service (e.g., Gmail, Outlook)
3. Create an email template with the following variables:
   - `from_name`: Sender's name
   - `reply_to`: Sender's email
   - `message`: Message content
4. Update the EmailJS configuration in `App.jsx` with your service ID, template ID, and user ID
