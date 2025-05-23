# Viralytics - Twitter Analytics Chatbot 🚀

Welcome to **Viralytics**! 📊

## Project Overview
**Viralytics** is an AI-Powered Twitter Analytics Platform built for the **Social Media Analytics Tool Hackathon**. 

📈 Discover actionable insights for your Twitter presence with our innovative analytics solution.

## Tech Stack
- **Vite**
- **React**
- **Auth0**
- **GROQ AI**
- **Axios**
- **Framer Motion**
- **React Router**
- **Chart.js**
- **Tailwind CSS**

## Features
- **AI-Powered Analytics Chatbot** 🤖
- **Interactive Dashboard** ✨
- **Engagement Metrics** 📊
- **Sentiment Analysis** 🧠
- **Content Optimization** 📝
- **Responsive Design** 📱
- **Dark/Light Mode** 🌓
- **Multilingual Support** 🌐
- **Real-time Monitoring** ⚡
- **Modern UI/UX Design** 🎨

## Environment Setup

To run this project, you need to set up the following environment variables:

### 📋 Required Environment Variables

Create a `.env` file in the root directory with these variables:

```env
# Auth0 Configuration (Frontend Only)
VITE_AUTH0_DOMAIN=your_auth0_domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_auth0_client_id

# GROQ API Configuration
VITE_GROQ_API_KEY=your_groq_api_key_here
```

### 🔧 Setup Instructions

1. **Get Auth0 credentials:**
   - Visit [Auth0 Dashboard](https://manage.auth0.com/)
   - Create a new application (Single Page Application)
   - Copy Domain and Client ID to your `.env` file
   - **⚠️ NEVER use Client Secret in frontend applications**

2. **Get GROQ API key:**
   - Visit [GROQ Console](https://console.groq.com/)
   - Generate API key
   - Copy to your `.env` file

3. **Start development:**
   ```bash
   npm install
   npm run dev
   ```

### 🛡️ Security Notes

- **Never commit `.env` files** to version control
- **Never put actual credentials** in README or any public files
- Use different credentials for dev/staging/production
- Regularly rotate your API keys
- Auth0 Client Secret is for backend only - never expose it in frontend

## Features

- Twitter analytics chatbot powered by GROQ AI
- Real-time responses with thinking indicators
- Customizable character limits and cooldown periods
- Dark/light mode support
- Multilingual support (EN, ES, FR, DE, IT, PT, RU, JA, KO, ZH)
- Predefined question suggestions
- Responsive design with drag-and-drop interface
