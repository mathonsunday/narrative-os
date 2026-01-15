# Deployment Checklist: Vercel Setup

## Quick Overview

When you push this to Vercel:
- ✅ Users see **Deep Sea OS** (production-ready narrative)
- ✅ Theme selector **not advertised** but discoverable at `/select-theme.html`
- ✅ Other themes **accessible** for developers/testers
- ✅ All assets served correctly
- ✅ Tests passing (129/129)

## Pre-Deployment Verification

### Local Testing
- [ ] `npm test` - All 129 tests passing ✅
- [ ] `npm run build` (if applicable) - No build errors
- [ ] Server running: `python3 -m http.server 8000`
- [ ] Visit `http://localhost:8000/frontend/` - Deep Sea loads
- [ ] Visit `http://localhost:8000/frontend/select-theme.html` - Selector works
- [ ] Visit other theme URLs - All accessible

### Code Check
- [ ] No uncommitted changes: `git status` (clean)
- [ ] All themes present in `frontend/themes/`
  - [ ] `deep-sea/` (default)
  - [ ] `living-os/`
  - [ ] `pixel-witch/`
  - [ ] `desert-wanderer/`
- [ ] Core infrastructure: `frontend/core/os-core.js` (✅ 313 lines)

## Vercel Setup

### 1. Create Vercel Project

```bash
# Option A: Via CLI
npm install -g vercel
vercel

# Option B: Via Dashboard
# Go to https://vercel.com
# Import GitHub repository
```

### 2. Configure Environment

When prompted by Vercel, ensure these settings:

```
Project Name: narrative-os
Framework: Other
Output Directory: frontend
Build Command: npm install
Install Command: npm install
```

Or let Vercel auto-detect from `vercel.json`.

### 3. Verify vercel.json

Check that `vercel.json` is present and contains:

```json
{
  "buildCommand": "npm install",
  "outputDirectory": "frontend",
  "routes": [
    {
      "src": "^/(?!.*\\.(js|css|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot|svg|mp3|mp4|wav)).*$",
      "dest": "/index.html"
    }
  ]
}
```

## Deployment Steps

### Step 1: Push to GitHub
```bash
git push origin main
```

### Step 2: Deploy to Vercel

**Option A: Automatic (Recommended)**
- Vercel automatically deploys on push to main
- Check deployment at: https://vercel.com/dashboard

**Option B: Manual**
```bash
vercel --prod
```

### Step 3: Verify Deployment

Once deployed, test these URLs:

```
✅ https://narrative-os.vercel.app/
   Should show Deep Sea OS

✅ https://narrative-os.vercel.app/select-theme.html
   Should show theme selector

✅ https://narrative-os.vercel.app/themes/pixel-witch/index.html
   Should load Pixel Witch

✅ https://narrative-os.vercel.app/themes/desert-wanderer/index.html
   Should load Desert Wanderer

✅ https://narrative-os.vercel.app/themes/living-os/index.html
   Should load Living OS
```

## Troubleshooting

### Issue: Wrong page loads at `/`

**Check:** Is `frontend/` the output directory?
```bash
# In vercel.json
"outputDirectory": "frontend"
```

**Fix:** Update vercel.json and redeploy

### Issue: Assets not loading (CSS/JS 404)

**Check:** Are asset paths correct?
```bash
# Should work:
/select-theme.html        ← Finds /frontend/select-theme.html
/core/os-core.js          ← Finds /frontend/core/os-core.js
/themes/pixel-witch/...   ← Finds /frontend/themes/pixel-witch/...
```

**Fix:** Update routing rules in vercel.json

### Issue: Backend not working

**Note:** WebSocket server runs locally only (Docker)

When deployed to Vercel:
- Frontend works standalone (no backend)
- WebSocket connection fails gracefully
- System runs in "standalone mode"
- Chaos events don't trigger (requires daemon)

This is expected. The frontend is designed to work without backend.

### Issue: Other themes showing as default

**Check:** Is `frontend/index.html` the Deep Sea theme?

**Fix:**
```bash
# Verify index.html loads Deep Sea:
grep -l "Deep Sea\|Mira Petrovic\|MBARI" frontend/index.html
```

## What Gets Deployed

### Served (Public)
- `frontend/index.html` (Deep Sea)
- `frontend/select-theme.html` (Theme selector)
- `frontend/core/os-core.js` (Shared infrastructure)
- `frontend/themes/` (All theme files)
- `frontend/` (All assets, CSS, fonts, etc.)

### NOT Deployed
- `backend/` (Backend code - Docker only)
- `tests/` (Test files)
- `node_modules/` (Dependencies)
- `.git/` (Version control)
- `*.md` files (Documentation)

## Marketing & Communication

### Public-Facing Copy
- "Narrative OS: A marine biologist's strange operating system"
- "Dr. Mira Petrovic's workspace holds unsettling secrets"
- No mention of other themes

### Developer Documentation
- Link to theme selector for explorers
- Document other themes as "experimental"
- Explain theme architecture

### Social Media
- Tease Deep Sea primarily
- "Rumors of other experiences..." for mystique
- Don't spoil theme selector location

## Rollback Plan

If something goes wrong:

```bash
# Quick rollback to previous deployment
vercel rollback

# Or redeploy specific commit
vercel --prod --git-commit=<commit-hash>
```

## Post-Deployment

### Day 1
- [ ] Check analytics: Is traffic going to `/`?
- [ ] Monitor error logs: Any 404s?
- [ ] Test on multiple browsers (Chrome, Safari, Firefox)
- [ ] Test on mobile
- [ ] Verify audio initializes on user click

### Week 1
- [ ] Monitor user feedback
- [ ] Check WebSocket logs (expect failures, that's normal)
- [ ] Track theme selector discovery (if analytics added)
- [ ] Verify no console errors in browser

### Ongoing
- [ ] Monitor performance metrics
- [ ] Track user engagement
- [ ] Plan promotion of other themes (if desired)
- [ ] Document user feedback for design iterations

## Future Theme Promotion

To promote another theme as the new default:

1. **Rename files** (or use symlinks):
   ```bash
   # Deep Sea stays in place
   # But make another theme the default
   cp frontend/themes/living-os/index.html frontend/index.html
   ```

2. **Update marketing** to reflect new default

3. **Redeploy** to Vercel:
   ```bash
   git add frontend/index.html
   git commit -m "feat: Promote Living OS as new default theme"
   git push origin main
   ```

4. **Announce** the theme change

## Environment Variables

Currently none needed for Vercel deployment.

If you add backend integration later:
```
WEBSOCKET_URL=wss://your-backend.com:8765
```

## Final Checklist

- [ ] `vercel.json` exists and is correct
- [ ] `frontend/index.html` loads Deep Sea
- [ ] `frontend/select-theme.html` accessible
- [ ] All theme directories present
- [ ] Core infrastructure file present (`os-core.js`)
- [ ] No uncommitted changes
- [ ] All tests passing (129/129)
- [ ] GitHub repository pushed
- [ ] Vercel project created
- [ ] Staging deployment tested
- [ ] Production deployment verified
- [ ] URLs working correctly
- [ ] Analytics configured (optional)

---

## Questions?

Check these docs:
- **Deployment strategy:** `DEPLOYMENT.md`
- **Architecture:** `THEME_DEVELOPMENT.md`
- **Theme scalability:** `THEME_SCALABILITY.md`
- **Refactoring details:** `REFACTORING_SUCCESS.md`

You're ready to launch! 🚀
