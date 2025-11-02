# MediSync Deployment Guide

## 🚀 Complete Deployment Checklist

### ✅ Prerequisites Completed
- [x] Project builds successfully
- [x] Netlify configuration added
- [x] Code pushed to GitHub
- [x] Supabase project exists (iyfwfwryibqfqetmbpqq.supabase.co)

---

## 📦 Step 1: Deploy Frontend to Netlify

### Option A: Netlify Dashboard (Recommended)

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com
   - Sign in with GitHub

2. **Import Project**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Select repository: `shrutigupta263/Medisync`

3. **Configure Build Settings** (auto-detected from netlify.toml)
   ```
   Build command: npm run build
   Publish directory: dist
   Node version: 18
   ```

4. **Deploy**
   - Click "Deploy site"
   - Wait 2-3 minutes
   - Your site will be live! 🎉

5. **Note Your URL**
   - You'll get a URL like: `https://medisync-xyz123.netlify.app`
   - You can customize this in Site Settings → Domain Management

### Option B: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize and deploy
netlify init

# For subsequent deployments
netlify deploy --prod
```

---

## 🔧 Step 2: Deploy Backend (Supabase Edge Functions)

Your app uses 4 edge functions that need to be deployed to Supabase:

1. **analyze-report** - AI-powered medical report analysis
2. **health-chat** - Interactive health chatbot
3. **check-reminders** - Automated reminder notifications
4. **validate-medical-report** - Report validation

### Install Supabase CLI

```bash
npm install -g supabase
```

### Login to Supabase

```bash
supabase login
```

This will open your browser for authentication.

### Link Your Project

```bash
supabase link --project-ref iyfwfwryibqfqetmbpqq
```

### Deploy All Functions

```bash
# Deploy all functions at once
supabase functions deploy

# Or deploy individually
supabase functions deploy analyze-report
supabase functions deploy health-chat
supabase functions deploy check-reminders
supabase functions deploy validate-medical-report
```

### Set API Secrets

Your edge functions need these API keys to work:

```bash
# Set Lovable API key (for AI features)
supabase secrets set LOVABLE_API_KEY=your_lovable_api_key_here

# Set Resend API key (for email notifications)
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

**Where to get API keys:**
- **Lovable API Key**: https://lovable.dev/dashboard (AI Gateway)
- **Resend API Key**: https://resend.com/api-keys (Email service)

---

## 🎯 Step 3: Verify Deployment

### Frontend Checklist
- [ ] Can access the deployed URL
- [ ] Sign up works
- [ ] Sign in works
- [ ] Dashboard loads

### Backend Checklist
- [ ] Can upload reports
- [ ] AI analysis works
- [ ] Chatbot responds
- [ ] Reminders can be created
- [ ] Email notifications work

### Test Edge Functions

You can test edge functions directly:

```bash
# Test analyze-report function
curl -X POST https://iyfwfwryibqfqetmbpqq.supabase.co/functions/v1/analyze-report \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"reportId": "test-uuid"}'

# Test health-chat function
curl -X POST https://iyfwfwryibqfqetmbpqq.supabase.co/functions/v1/health-chat \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is hemoglobin?"}'
```

---

## 🔐 Step 4: Environment Variables (Netlify)

**Good News:** Your Supabase credentials are already hardcoded in the app, so no environment variables are needed on Netlify! ✅

If you ever want to use environment variables instead:

1. Go to Netlify Dashboard
2. Select your site
3. Go to "Site settings" → "Environment variables"
4. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## 🌐 Step 5: Custom Domain (Optional)

### On Netlify:
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

### Recommended Domain: `medisync.yourdomain.com`

---

## 📊 Step 6: Monitoring & Maintenance

### Netlify Dashboard
- **Deploys**: See deployment history
- **Functions**: Monitor serverless function usage (N/A for this project)
- **Analytics**: Track site usage (premium feature)

### Supabase Dashboard
- **Database**: Monitor queries and performance
- **Edge Functions**: Check invocations and logs
- **Storage**: Monitor file uploads
- **Auth**: Track user signups and sessions

---

## 🐛 Troubleshooting

### Build Fails on Netlify
```bash
# Test locally first
npm run build

# Check Node version matches
node --version  # Should be 18+
```

### Edge Functions Not Working
```bash
# Check function logs
supabase functions logs analyze-report

# Verify secrets are set
supabase secrets list
```

### Database Connection Issues
- Verify Supabase URL in `src/integrations/supabase/client.ts`
- Check if database migrations are applied
- Verify RLS policies are set correctly

### CORS Issues
- Edge functions should have CORS headers configured
- Check browser console for specific errors

---

## 📱 Quick Commands Reference

```bash
# Redeploy frontend
git push origin main  # Auto-deploys on Netlify

# Redeploy specific edge function
supabase functions deploy analyze-report

# View edge function logs
supabase functions logs health-chat --tail

# Check Supabase project status
supabase status

# Update secrets
supabase secrets set KEY_NAME=new_value
```

---

## ✨ Post-Deployment

1. **Update README.md** with your live URL
2. **Test all features** thoroughly
3. **Set up monitoring** alerts
4. **Share your app** with users! 🎉

---

## 🎉 Success Criteria

Your MediSync app is fully deployed when:

✅ Users can access the live URL
✅ Sign up/Sign in works
✅ File uploads work
✅ AI analysis generates reports
✅ Chatbot responds to queries
✅ Reminders send email notifications
✅ All pages load without errors

---

## 📞 Need Help?

- **Netlify Docs**: https://docs.netlify.com
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Issues**: Create an issue in your repository

**Your deployed app will be at:**
- **Frontend**: `https://your-site-name.netlify.app`
- **Backend**: Already configured at `https://iyfwfwryibqfqetmbpqq.supabase.co`

Good luck with your deployment! 🚀

