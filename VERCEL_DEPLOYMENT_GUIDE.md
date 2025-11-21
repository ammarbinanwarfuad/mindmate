# MindMate - Vercel Deployment Guide

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your code should be on GitHub
3. **MongoDB Atlas**: Your database should be accessible from anywhere (0.0.0.0/0)
4. **Firebase Project**: Already configured

---

## 🚀 Deployment Options

You have **two options** for deploying to Vercel:

### **Option 1: Deploy as Monorepo (Recommended)**
Deploy both client and server together in one project.

### **Option 2: Deploy Separately**
Deploy client and server as separate Vercel projects.

---

## 📦 Option 1: Monorepo Deployment (Recommended)

### Step 1: Prepare Your Repository

1. **Push to GitHub**:
```bash
cd mindmate-fullstack
git init
git add .
git commit -m "Initial commit for Vercel deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mindmate-fullstack.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: Leave empty (we'll use vercel.json)
   - **Output Directory**: Leave empty

### Step 3: Configure Environment Variables

Add these environment variables in Vercel Dashboard (Settings → Environment Variables):

#### **Server Environment Variables**:
```
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
CLIENT_URL=https://your-vercel-app.vercel.app
```

#### **Client Environment Variables**:
```
VITE_API_URL=https://your-vercel-app.vercel.app/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### Step 4: Deploy

Click **Deploy** and wait for the build to complete!

---

## 📦 Option 2: Separate Deployments

### A. Deploy Client (Frontend)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add environment variables (same as above for client)

5. Deploy!

### B. Deploy Server (Backend)

1. Go to [vercel.com/new](https://vercel.com/new) again
2. Import the same repository
3. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `server`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty

4. Add environment variables (same as above for server)

5. Deploy!

6. **Update Client Environment**:
   - Go to your client Vercel project
   - Update `VITE_API_URL` to your server's Vercel URL
   - Redeploy

---

## 🔧 Post-Deployment Configuration

### 1. Update Firebase Configuration

Add your Vercel domain to Firebase:
- Go to Firebase Console → Authentication → Settings
- Add your Vercel domain to **Authorized domains**

### 2. Update MongoDB Atlas

Ensure MongoDB allows connections from Vercel:
- Go to MongoDB Atlas → Network Access
- Add IP: `0.0.0.0/0` (allows all IPs)
- Or add Vercel's IP ranges

### 3. Update CORS in Server

Your server is already configured to accept the CLIENT_URL from environment variables.

---

## 🧪 Testing Your Deployment

1. Visit your Vercel URL
2. Try logging in
3. Check admin panel access
4. Test API endpoints

---

## 🐛 Troubleshooting

### Issue: "Module not found" errors
**Solution**: Make sure all dependencies are in `package.json` and not just `devDependencies`

### Issue: API calls failing
**Solution**: 
- Check CORS configuration
- Verify `VITE_API_URL` is correct
- Check environment variables are set

### Issue: Database connection failed
**Solution**:
- Verify MongoDB Atlas allows connections from `0.0.0.0/0`
- Check `MONGODB_URI` environment variable

### Issue: Firebase authentication not working
**Solution**:
- Add Vercel domain to Firebase authorized domains
- Check all Firebase environment variables

---

## 📝 Important Notes

1. **Serverless Functions**: Vercel runs Node.js as serverless functions (10-second timeout on free plan)
2. **Cold Starts**: First request might be slow due to cold start
3. **Environment Variables**: Never commit `.env` files to GitHub
4. **Build Time**: Client build might take 2-3 minutes
5. **Free Tier Limits**: 
   - 100 GB bandwidth/month
   - 100 hours serverless function execution/month
   - Unlimited deployments

---

## 🔄 Continuous Deployment

Once connected to GitHub, Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request

---

## 📊 Monitoring

Access deployment logs and analytics:
- Go to your Vercel project dashboard
- Click on **Deployments** to see build logs
- Click on **Analytics** to see usage stats

---

## 🎉 Success!

Your MindMate app should now be live at:
- **Production URL**: `https://your-project-name.vercel.app`

---

## 🆘 Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)
- Check deployment logs in Vercel dashboard
