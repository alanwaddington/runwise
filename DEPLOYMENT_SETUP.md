# Runwise Deployment Setup Guide

Complete these steps to get `runwise.app` live with all infrastructure configured.

---

## Phase 1: Create Vercel Project and Deploy

### Step 1: Create the Vercel Project

1. Go to **https://vercel.com/new** in your browser
2. You'll see the "Create New Project" screen
3. Click **"Continue with GitHub"** (or authenticate if needed)
4. GitHub will ask for authorization — click **Authorize Vercel**
5. After auth, you'll see a list of your GitHub repositories
6. **Search for or scroll to find `alanwaddington/runwise`**
7. Click the **Import** button on the runwise repo card
8. Vercel will detect the project:
   - **Framework**: SvelteKit (auto-detected ✓)
   - **Build Command**: `npm run build` (auto-detected ✓)
   - **Output Directory**: `.vercel/output` (auto-detected ✓)
9. Click **Deploy** button at the bottom

**Wait ~2-3 minutes for the build to complete.** You'll see:
- Build progress logs
- "Deployed Successfully" message with a preview URL like `https://runwise-git-main-alanwaddingtons-projects.vercel.app`

✅ **Success criteria:** You see the green "Deployed Successfully" checkmark and can visit the preview URL → site renders.

---

### Step 2: Verify Preview Deployments Work

Preview deployments are auto-enabled on all PRs when you connect a GitHub repo.

1. **Verify it's working:** In the runwise repo on GitHub, go to PR #39 (the deployment PR we just created)
2. **Look for the deployment status** at the bottom of the PR (below the Comments section)
3. You should see a **"Deployment"** section with a link to a preview URL
4. **Click the preview URL** — you should see the live site
5. Check that all 7 pages work:
   - `/` (homepage)
   - `/pace`
   - `/race-predictor`
   - `/training-paces`
   - `/hr-zones`
   - `/vo2max`
   - `/parkrun`

✅ **Success criteria:** Preview URL is live, all 7 pages load without errors.

---

## Phase 2: Purchase Domain and Configure Production

### Step 3: Purchase runwise.app Domain

**Option A: Buy through Vercel (Recommended — simplest)**

1. Go to **https://vercel.com/dashboard** and click on your Runwise project
2. Go to **Settings** (gear icon, top right)
3. Click **Domains** in the left sidebar
4. Click **Add Domain** button
5. In the input field, type: `runwise.app`
6. Click the **"Buy Domain"** button
7. You'll see a panel showing:
   - Domain: `runwise.app`
   - Price: ~$12–15 USD / year
   - Registrar: Vercel (powered by Namecheap)
8. **Enter your payment information** and complete purchase
9. The domain will appear in your Domains list as "Purchased" within seconds

Vercel automatically:
- Routes the domain to your project
- Provisions a free SSL certificate (HTTPS)
- Removes the certificate in 15–30 seconds (it's working in the background)

**Option B: Buy elsewhere (Google Domains, Namecheap, GoDaddy, etc.)**

If you prefer to use an existing registrar:

1. Purchase `runwise.app` through your registrar
2. In your registrar's DNS settings, **change the nameservers to Vercel's:**
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
   - `ns3.vercel-dns.com`
   - `ns4.vercel-dns.com`
3. Then follow Step 4 below to add the domain to Vercel

---

### Step 4: Add Domain to Vercel Production

1. Go to your **Runwise project → Settings → Domains**
2. If you purchased through Vercel in Step 3, the domain is already listed as "Purchased"
3. If you bought elsewhere, click **Add Domain** and type `runwise.app` again
4. **Wait for the domain to resolve** — Vercel will show:
   - `runwise.app` with a green checkmark and "Valid Configuration"
   - This takes 5–30 minutes depending on DNS propagation
5. Once valid, verify in your browser:
   - Visit **https://runwise.app** — you should see the site
   - Visit **https://www.runwise.app** — should redirect (301) to **https://runwise.app**
   - HTTPS should work with no certificate warnings

✅ **Success criteria:**
- `https://runwise.app` returns HTTP 200 and renders the homepage
- `https://www.runwise.app` returns HTTP 301 redirect
- SSL certificate is valid (no browser warnings)

---

## Phase 3: Configure Environment Variables

### Step 5: Set VITE_SITE_URL in Production

1. Go to your **Runwise project → Settings → Environment Variables**
2. Click **Add** button
3. Fill in the form:
   - **Name:** `VITE_SITE_URL`
   - **Value:** `https://runwise.app`
   - **Environment:** Select only **Production** (leave Development and Preview unchecked)
4. Click **Save**
5. Repeat for the next variable:

### Step 6: Set PUBLIC_GOOGLE_SITE_VERIFICATION (for Future Use)

This is used by issue #37 (Google Search Console) — set it now even though it's empty.

1. In **Settings → Environment Variables**, click **Add**
2. Fill in:
   - **Name:** `PUBLIC_GOOGLE_SITE_VERIFICATION`
   - **Value:** _(leave empty for now)_
   - **Environment:** Select only **Production**
3. Click **Save**

**Note:** When you set up Google Search Console in issue #37, you'll get a verification token and update this value.

---

### Step 7: Trigger a Redeploy to Pick Up Environment Variables

1. Go to **Deployments** in your Vercel project
2. Find the latest deployment (should be at the top)
3. Click the **three-dot menu** on that deployment
4. Click **Redeploy**
5. A new build will start — wait ~2–3 minutes for it to complete
6. Once done, verify everything still works:
   - Visit **https://runwise.app** — homepage loads
   - Check **https://runwise.app/sitemap.xml** — all URLs should use `https://runwise.app` prefix
   - View page source of homepage — confirm canonical links use the correct domain

✅ **Success criteria:**
- Redeployment completes successfully
- Sitemap URLs are correct
- Canonical links in page source point to correct domain

---

## Phase 4: Enable Observability

### Step 8: Enable Vercel Analytics

1. Go to **Runwise project → Settings → Analytics**
2. Click **Enable Web Analytics**
3. Vercel will auto-inject the tracking script on next deployment
4. It's already live (no redeploy needed — the script was injected during build)
5. Visit **https://runwise.app** from your browser
6. Wait ~1 minute, then go to **Analytics** tab
7. You should see at least 1 page view recorded

✅ **Success criteria:** Analytics dashboard shows at least 1 page view.

---

### Step 9: Configure Deployment Notifications

Choose one method (or both):

#### Option A: Email Notifications (Simplest)

1. Go to **Runwise project → Settings → Notifications**
2. Under **Email**, toggle **On**
3. Select:
   - ✓ **Deployments** 
   - ✓ **Production** (notify on production deploy success/failure)
4. Your email (`alan@mernoc.com`) is already added
5. Click **Save**

**Test it:** Merge PR #39 to main. You'll get an email when the deployment completes.

---

#### Option B: Slack Notifications

1. Go to **Runwise project → Settings → Integrations**
2. Find **Slack** in the integrations list
3. Click **Connect**
4. Slack will ask for authorization — click **Allow**
5. Choose which Slack workspace and channel to post to
6. Configure which events trigger notifications:
   - ✓ **Deployment succeeded**
   - ✓ **Deployment failed**
7. Click **Install**

**Test it:** Merge PR #39 to main. You'll see a message in the Slack channel when deployment completes.

---

### Step 10: Test a Production Deployment

Now trigger a real production deploy:

1. **Merge PR #39 to main** on GitHub
2. Merging will trigger an automatic production deployment on Vercel
3. **Watch the deployment:**
   - Go to your **Runwise project → Deployments**
   - You should see a new deployment in progress
   - Wait for it to complete (2–3 minutes)
4. **Verify it deployed:**
   - Visit **https://runwise.app** — should still work
   - Check email or Slack for notification
5. **Verify www redirect:**
   ```bash
   curl -I https://www.runwise.app/pace
   ```
   Should return `HTTP/1.1 301` with `Location: https://runwise.app/pace`

6. **Verify security headers:**
   ```bash
   curl -I https://runwise.app
   ```
   Look for these headers in the response:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

✅ **Success criteria:**
- Deployment succeeds
- `https://runwise.app` is live and working
- www redirect returns 301
- All security headers present
- Notification (email or Slack) fires

---

## Final Verification Checklist

After completing all steps above, run through this final checklist:

### Domain & HTTPS
- [ ] `https://runwise.app` resolves to the site (HTTP 200)
- [ ] `https://www.runwise.app` redirects to `https://runwise.app` (HTTP 301)
- [ ] HTTPS certificate is valid (no browser warnings or errors)
- [ ] SSL Labs test (https://www.ssllabs.com/ssltest/analyze.html?d=runwise.app) shows A grade

### Pages & SEO
- [ ] All 7 pages load without errors:
  - [ ] `/` (homepage)
  - [ ] `/pace`
  - [ ] `/race-predictor`
  - [ ] `/training-paces`
  - [ ] `/hr-zones`
  - [ ] `/vo2max`
  - [ ] `/parkrun`
- [ ] `/sitemap.xml` shows all 7 URLs with `https://runwise.app` prefix
- [ ] `/robots.txt` references `Sitemap: https://runwise.app/sitemap.xml`
- [ ] Homepage source includes `<link rel="canonical" href="https://runwise.app">`
- [ ] OG image tags point to `https://runwise.app/og/*`

### Error Handling
- [ ] Visit `https://runwise.app/nonexistent-page` → custom 404 page appears (not Vercel default)
- [ ] 404 page shows "Page not found" message and back-to-home link

### Performance
- [ ] Lighthouse audit (Chrome DevTools → Lighthouse):
  - [ ] Performance score ≥ 90
  - [ ] Accessibility score ≥ 95
  - [ ] Best Practices score ≥ 90
  - [ ] SEO score = 100

### Observability
- [ ] Analytics dashboard shows page views
- [ ] Notification (email or Slack) fired on last deployment
- [ ] Can see deployment history in Vercel dashboard

---

## Troubleshooting

### Domain not resolving after 30 minutes

**If** `https://runwise.app` still gives "connection refused" or DNS error after 30 minutes:

1. Check that nameservers are pointing to Vercel (if bought elsewhere):
   ```bash
   nslookup -type=ns runwise.app
   ```
   Should show `ns1.vercel-dns.com`, `ns2.vercel-dns.com`, etc.

2. Vercel's domain status might still be "Pending":
   - Go to **Settings → Domains**
   - If it says "Pending", click **Refresh** button
   - Wait another 5–10 minutes and refresh again

3. If still pending, try removing and re-adding the domain:
   - **Settings → Domains**
   - Click the three-dot menu on the domain
   - Click **Remove**
   - Click **Add Domain** again
   - Type `runwise.app`

### Environment variable not taking effect

**If** sitemap or canonical links still show old hardcoded URL after setting `VITE_SITE_URL`:

1. Make sure you followed Step 7 (trigger a redeploy)
2. After redeploy completes, hard-refresh your browser: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows)
3. Check in browser console that old content isn't cached:
   - Open DevTools (F12)
   - Go to **Application → Cache Storage**
   - Delete any cache entries for runwise.app
   - Refresh the page

### HTTPS certificate warnings

**If** you see certificate warnings or errors:

1. Wait 15–30 minutes — Vercel sometimes takes time to provision certificates
2. Go to **Settings → Domains** and check the domain status
3. If status is "Valid Configuration", try removing HTTPS redirect:
   - Go to **Settings → Edge Middleware**
   - Look for any redirect rules that force HTTPS
   - If found, verify they match what's in `vercel.json`
4. Hard-refresh your browser cache

### www redirect not working

**If** `https://www.runwise.app` doesn't redirect to apex:

1. Verify redirect is in `vercel.json` (should be there from the code)
2. Trigger a redeploy (Step 7)
3. Test with curl (plaintext, no browser caching):
   ```bash
   curl -I https://www.runwise.app/
   ```
   Should show `HTTP/1.1 301` and `Location: https://runwise.app/`

### Slack/email notification not firing

**If** notifications aren't arriving on deployment:

1. For email: check spam/junk folder (sometimes Gmail filters them)
2. For Slack: make sure Runwise app has permission to post in the selected channel
   - Go to Slack channel settings
   - Click **Integrations**
   - Look for the Vercel app
   - Ensure it's enabled

---

## Next Steps After Deployment

Once all steps are complete:

1. **Issue #11 is done** — mark it as complete
2. **Issue #37 (Google Search Console)** becomes unblocked
   - You'll use `PUBLIC_GOOGLE_SITE_VERIFICATION` env var you set in Step 6
3. **Issue #12 (Monetisation)** becomes unblocked
   - You can now add ads/affiliate links to a live site
4. **Create a PR review** of #39 to finalize the deployment code

---

## Questions?

If anything goes wrong or is unclear, check:

1. **Vercel documentation**: https://vercel.com/docs
2. **SvelteKit adapter-vercel**: https://kit.svelte.dev/docs/adapter-vercel
3. **Runwise issue #11**: https://github.com/alanwaddington/runwise/issues/11 (has all the context)
