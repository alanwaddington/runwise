# Google Search Console Setup Guide for runwise.app

**Summary:** This guide walks you through registering runwise.app with Google Search Console using DNS TXT verification. Total time: ~15–30 minutes (mostly waiting for DNS propagation).

---

## Step 1: Create Google Search Console Property

1. **Open Google Search Console:** Go to https://search.google.com/search-console
2. **Sign in** with your Google account (create one if needed)
3. **Click "Add property"** (or the + icon in the left sidebar)
4. **Select property type:** Choose `URL prefix` (not "Domain")
   - **Why?** It's simpler for a single domain. "Domain" requires DNS verification but covers all subdomains; "URL prefix" is straightforward for runwise.app specifically.
5. **Enter the URL:** Type `can't continue  exactly (with the https://)
   - **Important:** Include the `https://` prefix. GSC is case-sensitive and protocol-sensitive.
6. **Click "Continue"**

✓ You should now see a verification screen with multiple options (DNS, HTML tag, Google Analytics, etc.)

---

## Step 2: Get DNS TXT Record from Google Search Console

1. **Look for verification methods:** You'll see a list including "DNS TXT record", "HTML tag", "Google Analytics", etc.
2. **Click on "DNS TXT record"**
3. **Copy the TXT record value**
   - **What to copy:** Google provides a value like: `google-site-verification=xyz1a2b3c4d5e6f7g8h9i`
   - You'll see it in a box. Click the copy icon or select all and copy.
4. **Keep this browser window open** — you'll need to come back here after adding the DNS record

✓ You now have the TXT record value copied to your clipboard

---

## Step 3: Add DNS TXT Record in Vercel

1. **Open Vercel Dashboard:** Go to https://vercel.com/dashboard
2. **Find your Runwise project:** Click on "runwise" or your project name
3. **Go to Settings:** Click the "Settings" tab at the top
4. **Navigate to Domains:** In the left sidebar, click "Domains"
5. **Find runwise.app:** You should see `runwise.app` in the domains list. Click on it.
6. **Scroll to DNS Records:** Look for a "DNS Records" section (may say "Nameservers" or similar)
7. **Look for the TXT Record option:** You may see options to add different record types. Select or look for TXT records.
8. **Add a new TXT record:**
   - **Name/Host:** Leave empty or enter `@` (means root domain)
   - **Value:** Paste the entire Google verification string: `google-site-verification=xyz1a2b3c4d5e6f7g8h9i`
   - **TTL:** Leave as default (usually 3600 or "Auto")
   - **Example:** If Google gave you `google-site-verification=a1b2c3d4e5f6g7h8`, paste exactly that as the Value.
9. **Click "Add" or "Save"**

⚠️ **DNS Propagation:** It can take 5–30 minutes (sometimes up to a few hours) for the DNS change to propagate globally. Google will check for the record periodically.

✓ The TXT record should appear in Vercel's DNS records list within a few moments

---

## Step 4: Verify in Google Search Console

1. **Go back to the Google Search Console tab** (the one with the verification screen)
2. **You should still see the DNS TXT record method selected**
3. **Click "Verify"** button at the bottom of the screen
   - **Timing:** If DNS hasn't propagated yet, you'll see an error. Wait 5–10 minutes and try again.
4. **Wait for the result:** Google will check for the TXT record
   - **Success:** You'll see "Verification successful" and a green checkmark. The property will be added to your GSC account.
   - **Failed:** "Could not verify ownership". Wait a bit longer for DNS to propagate, then try again.

**Typical timeline:**
- TXT record added to Vercel: Immediate
- DNS propagation: 5–30 minutes
- Google verifies: Usually within a minute of verification attempt

✓ Property is now verified and added to your Google Search Console

---

## Step 5: Submit Sitemap

1. **After verification, you'll be taken to the property dashboard** (or click on "runwise.app" in your GSC property list)
2. **Look for "Sitemaps" in the left sidebar:** It's usually under "Indexing" section
3. **Click "Sitemaps"**
4. **Click "Add/test sitemap"** button (top right)
5. **Enter the sitemap URL:** `https://runwise.app/sitemap.xml`
   - **Important:** Type the full URL including https:// and the filename.
6. **Click "Submit"**
7. **Wait for processing:** GSC will fetch and parse the sitemap. You should see:
   - Status: "Success" (not "Error" or "Pending")
   - Sitemap details showing 7 URLs (home + 6 tools)

✓ Sitemap submitted successfully. Google will start crawling the pages listed in it.

---

## Verification Checklist (After Completion)

- [ ] Property Verified — GSC shows "runwise.app" with a green checkmark (not "Unverified" or "Pending")
- [ ] DNS Record Added — Vercel Domain settings show the google-site-verification TXT record
- [ ] Sitemap Submitted — GSC Sitemaps section shows the sitemap with "Success" status and 7 URLs listed
- [ ] Coverage Report — GSC Coverage section shows pages being indexed (check after 24–48 hours)

---

## What Happens Next (Timeline)

- **Immediately after sitemap submission:** GSC parses the sitemap, shows 7 URLs found
- **1–2 hours:** Google starts crawling the pages
- **24–48 hours:** Most/all pages should appear in GSC Coverage report as "Valid" (indexed)
- **3–7 days:** Full coverage data and search performance data starts flowing in
- **1–4 weeks:** Users start seeing runwise.app in Google search results for relevant queries

---

## Optional: Speed Up Initial Indexing

If you want to request immediate indexing for the homepage (to appear in search faster):

1. **In GSC, use URL Inspection tool:** Click "URL Inspection" in the left sidebar
2. **Enter the homepage URL:** `https://runwise.app`
3. **Click the blue "Request indexing" button** (if available)
4. **Wait for confirmation:** Should see "Request received" message

✓ This tells Google to prioritize crawling the homepage. It doesn't guarantee instant indexing, but it helps.

---

## Troubleshooting

### Verification fails ("Could not verify ownership")
**Solution:** Wait 10–15 minutes for DNS to propagate fully, then try again. DNS changes can take time globally.

### Sitemap says "Error" or doesn't show 7 URLs
**Solution:** Double-check the URL is `https://runwise.app/sitemap.xml` (not http://, not trailing slash). Try removing and re-adding it.

### Coverage report shows pages as "Excluded" or "Discovered – not indexed"
**Solution:** This is normal for the first 24–48 hours. Check again in 2 days. If it persists, use URL Inspection to see why.

### Can't find DNS settings in Vercel
**Solution:** Make sure you're in Project Settings → Domains → click on "runwise.app" → scroll to DNS Records section. The UI varies slightly depending on whether Vercel manages DNS or you're using external DNS.
