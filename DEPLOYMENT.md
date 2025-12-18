# 🚀 Deployment Guide

This guide will help you deploy your RifaMaster app to GitHub Pages automatically.

## 📋 Prerequisites

- A GitHub account
- Your code pushed to a GitHub repository

## ⚙️ Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** (top navigation)
3. In the left sidebar, click on **Pages**
4. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - Save the changes

### 2. Add API Key Secret (Optional)

If you're using the Gemini AI features, you need to add your API key:

1. In your repository, go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `GEMINI_API_KEY`
4. Value: Your actual Gemini API key
5. Click **Add secret**

### 3. Deploy Your App

That's it! Now every time you push to the `main` branch, your app will automatically deploy.

```bash
git add .
git commit -m "Deploy RifaMaster"
git push origin main
```

### 4. Access Your Deployed App

After the first deployment (takes 2-3 minutes):
- Go to **Settings** → **Pages**
- You'll see your site URL: `https://yourusername.github.io/rifa/`

Or check the **Actions** tab to see deployment progress!

## 🔄 How It Works

- **Trigger**: Automatically runs when you push to `main` branch
- **Build**: Installs dependencies and builds the production version
- **Deploy**: Publishes to GitHub Pages
- **Access**: Your app is live at the GitHub Pages URL

## 🎯 Manual Deployment

You can also trigger a deployment manually:
1. Go to **Actions** tab
2. Select "Deploy to GitHub Pages"
3. Click **Run workflow**

## 📝 Notes

- Initial deployment may take 5-10 minutes
- Subsequent deployments are faster (2-3 minutes)
- All your raffle data is saved in the browser's local storage
- Each user accessing the site has their own local data

## 🔧 Troubleshooting

**Deployment fails?**
- Check the Actions tab for error logs
- Ensure Node.js version compatibility
- Verify all dependencies are in package.json

**Site not loading?**
- Wait 5 minutes after first deployment
- Check if GitHub Pages is enabled in Settings
- Clear browser cache

**Need a different branch?**
- Edit `.github/workflows/deploy.yml`
- Change `branches: - main` to your preferred branch

