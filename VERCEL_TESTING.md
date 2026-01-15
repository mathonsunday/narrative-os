# Vercel Deployment Testing Guide

## What Just Happened

You pushed commits to GitHub with:
- ✅ Pixel Witch theme (complete)
- ✅ Desert Wanderer theme (complete)
- ✅ vercel.json configuration
- ✅ Deep Sea as public default
- ✅ All tests passing (129/129)

Vercel will automatically detect the push and start deploying.

## Deployment Status

Check here: https://vercel.com/dashboard

You should see:
1. New deployment detected from `origin/main`
2. Building: Installing dependencies
3. Ready: Deployment complete in ~1-2 minutes

## Testing After Deployment

Once Vercel finishes, test these URLs:

### ✅ MUST WORK - Public Default
```
https://narrative-os.vercel.app/
→ Should load Deep Sea OS immediately
→ You see: Dr. Mira Petrovic's workspace
→ Audio system initializes on user click
```

### ✅ MUST WORK - Theme Selector
```
https://narrative-os.vercel.app/select-theme.html
→ Should show all 4 themes
→ Cards display correctly
→ Can click through to each theme
```

### ✅ MUST WORK - Individual Themes
```
https://narrative-os.vercel.app/themes/pixel-witch/index.html
→ Loads Pixel Witch theme
→ Shows cozy cottage aesthetic
→ Files, potions, sparkles visible

https://narrative-os.vercel.app/themes/desert-wanderer/index.html
→ Loads Desert Wanderer theme
→ Shows warm desert colors
→ Sun and dunes visible
→ Field notes window present

https://narrative-os.vercel.app/themes/living-os/index.html
→ Loads Living OS theme
→ Should work (this was already deployed)
```

### ✅ SHOULD WORK - Assets
```
https://narrative-os.vercel.app/core/os-core.js
→ Core infrastructure file loads (check browser console)

https://narrative-os.vercel.app/select-theme.html
→ CSS and styling work correctly
→ No 404 errors in console
```

## What to Check

### Browser Console (F12 → Console)
- [ ] No 404 errors (all assets load)
- [ ] No "WebSocket connection failed" errors (expected - no backend)
- [ ] No JavaScript errors
- [ ] `[Pixel Witch] Initialized` if you visit Pixel Witch
- [ ] `[Desert Wanderer] Initialized` if you visit Desert Wanderer

### Visual Inspection
- [ ] Deep Sea loads with correct blue/cyan colors
- [ ] Theme selector shows all 4 themes with correct colors
- [ ] Pixel Witch shows purple colors and pixel art
- [ ] Desert Wanderer shows tan/orange colors and dunes
- [ ] All text is readable
- [ ] Buttons/links are clickable

### Performance
- [ ] Pages load in < 2 seconds
- [ ] No lag when dragging files (if interactive)
- [ ] Smooth animations (sparkles, etc.)

## If Something's Wrong

### Deep Sea Not Loading
**Check:** Is `/frontend/` the output directory in vercel.json?
```json
"outputDirectory": "frontend"
```

### Theme URLs Return 404
**Check:** Are routes configured correctly?
```json
"routes": [
  {
    "src": "^/(?!.*\\.(js|css|...)).*$",
    "dest": "/index.html"
  }
]
```

### Assets Not Loading
**Check:** Browser console for 404 errors
- Look for missing `.js`, `.css` files
- Check paths: `/core/os-core.js`, `/themes/...`

### Only Deep Sea Works, Others Don't
**Check:** Did vercel.json deploy correctly?
- Go to Vercel Dashboard
- Check "Function" tab for vercel.json errors
- Redeploy if needed

## Quick Rollback

If needed, you can rollback to the previous deployment:
```bash
vercel rollback
```

Or redeploy a specific commit:
```bash
git push origin <commit-hash>:main
# Vercel will auto-deploy that commit
```

## Post-Deployment Checklist

- [ ] Deep Sea loads at `/`
- [ ] Theme selector accessible at `/select-theme.html`
- [ ] Pixel Witch loads at `/themes/pixel-witch/`
- [ ] Desert Wanderer loads at `/themes/desert-wanderer/`
- [ ] Living OS loads at `/themes/living-os/`
- [ ] No console errors
- [ ] Assets load correctly
- [ ] UI looks good on desktop
- [ ] UI responsive on mobile (optional)

## Current Vercel Deployment Status

**Repository:** mathonsunday/narrative-os
**Branch:** main
**Latest Commit:** 21d76bf (Deployment checklist)
**Status:** Auto-deploying now

Check live at: https://vercel.com/dashboard

## Local Testing (Before Vercel)

All locally tested and working:
✅ Deep Sea loads as default
✅ Theme selector shows all 4 themes
✅ Pixel Witch loads correctly
✅ Desert Wanderer loads correctly
✅ All tests pass (129/129)

---

## Summary

You're good to go! The code is pushed, Vercel is deploying automatically, and all testing shows everything works.

Once the deployment finishes (check Vercel dashboard), test the URLs above and you'll have a live multi-theme narrative OS with Deep Sea as the polished public face and experimental themes discoverable in the background.

🚀 **Deployment in progress...**
