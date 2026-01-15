# Deployment Strategy: Deep Sea as Front Door

## Public vs Internal Themes

The narrative-os repository contains multiple themes, but only one is the public-facing experience.

### Public (Vercel Deployment)

**URL:** `https://narrative-os.vercel.app/`
**Default experience:** Deep Sea OS (Dr. Mira Petrovic)
**Access:** Direct to `/frontend/index.html`

When users visit the website, they immediately enter the Deep Sea OS experience. This is the polished, production-ready narrative.

### Internal (Development & Testing)

**Theme selector:** `/frontend/select-theme.html`
**All themes accessible:** Deep Sea, Living OS, Pixel Witch, Desert Wanderer
**Access:** Developers/testers can visit the selector to choose alternative experiences

### Deployment Configuration

For Vercel deployment, configure the web server to serve `frontend/index.html` as the default:

**vercel.json**
```json
{
  "buildCommand": "npm install",
  "outputDirectory": "frontend",
  "routes": [
    {
      "src": "^/(?!.*\\.(js|css|png|jpg|gif|ico|woff|woff2)).*$",
      "dest": "/index.html"
    }
  ]
}
```

This ensures:
- `/` → serves `frontend/index.html` (Deep Sea OS)
- `/select-theme.html` → accessible if user knows URL
- `/themes/pixel-witch/` → accessible if user knows URL
- All assets served normally

## URL Structure

### Public (Advertised)
- `https://narrative-os.vercel.app/` → **Deep Sea OS** ✅

### Internal (Known to developers)
- `https://narrative-os.vercel.app/select-theme.html` → Theme selector
- `https://narrative-os.vercel.app/themes/living-os/index.html` → Living OS
- `https://narrative-os.vercel.app/themes/pixel-witch/index.html` → Pixel Witch
- `https://narrative-os.vercel.app/themes/desert-wanderer/index.html` → Desert Wanderer

## Why This Approach?

### Advantages

1. **Clean Public Experience**
   - Users get one cohesive narrative (Deep Sea)
   - No confusing theme selector on first visit
   - Deep Sea is the "official" experience

2. **Experimental Themes Protected**
   - Other themes not advertised
   - Developers/testers can still access them
   - No risk of confusing new users

3. **Easy Evolution**
   - Can change default theme anytime (change `/frontend/index.html`)
   - Can add new themes without affecting public experience
   - Can maintain backward-compatible URLs

4. **Clear Expectations**
   - Website marketing describes Deep Sea only
   - Users know exactly what they're getting
   - No conflicting narratives or decision fatigue

## Local Development

When developing locally (`http://localhost:8000/`):

```
/frontend/                       → Deep Sea OS (default)
/frontend/select-theme.html      → Theme selector (for testing all 4)
/frontend/index.html             → Deep Sea OS (same as above)
/frontend/themes/living-os/      → Living OS theme
/frontend/themes/pixel-witch/    → Pixel Witch theme
/frontend/themes/desert-wanderer/ → Desert Wanderer theme
```

Developers can easily test all themes locally using the selector.

## Future Theme Deployment

If you want to make another theme the default (e.g., promote Living OS or Pixel Witch):

1. Update `/frontend/index.html` to load the new theme
2. All other URLs remain unchanged
3. Existing users see the new default
4. Old default still accessible at `/themes/deep-sea/` (if needed)

Or promote a theme as secondary default:
- Marketing links to specific theme URLs
- Selector always available for discovery

## Content Strategy

### Marketing/Homepage
- Describe Deep Sea OS as the main experience
- Mention it's a narrative about a marine biologist
- Show screenshots/teaser of the horror elements
- Don't mention other themes

### Social Media
- Post about Deep Sea primarily
- Behind-the-scenes mentions of other themes
- "There are other experiences available for experimental audiences"

### Developer Docs
- List all four themes
- Explain how to access each
- Provide theme selector link for full experience

## Backup & Rollback

If Deep Sea ever needs to be replaced:

```bash
# Current setup
/frontend/index.html → Deep Sea

# To switch to Living OS:
1. Copy living-os/index.html to index.html (or use symlink)
2. Update select-theme.html to reflect new default
3. Deep Sea still accessible at /themes/deep-sea/

# To rollback:
1. Restore original /frontend/index.html
2. Done
```

## Vercel Deployment Checklist

- [ ] Create `vercel.json` with rewrite rules
- [ ] Set buildCommand: `npm install`
- [ ] Set outputDirectory: `frontend`
- [ ] Deploy to staging first
- [ ] Test: `https://staging.narrative-os.vercel.app/` loads Deep Sea
- [ ] Test: `https://staging.narrative-os.vercel.app/select-theme.html` shows selector
- [ ] Test: Other theme URLs work
- [ ] Promote to production

## SEO & Metadata

Update `frontend/index.html` meta tags for production:

```html
<meta name="description" content="Narrative OS: A marine biologist's operating system knows too much about her research. An interactive narrative game.">
<meta name="og:title" content="Narrative OS - Deep Sea">
<meta name="og:description" content="Experience an unsettling narrative as Dr. Mira Petrovic discovers the operating system is watching her research patterns.">
<meta name="og:image" content="https://narrative-os.vercel.app/preview.jpg">
```

## Analytics

Track:
- Users visiting `/` (Deep Sea)
- Users discovering `/select-theme.html` (engagement metric)
- Theme selections by users (if analytics added)
- Repeat visitors (narrative engagement)

## Summary

**On Public Web:**
- Users see Deep Sea OS exclusively
- Deep Sea is the "official" product
- Other themes are internal/experimental
- All themes still available if discovered

**For Development:**
- All themes easily testable locally
- Theme selector provides full access
- Clear separation between public and internal

**Flexibility:**
- Can swap default theme anytime
- Can adjust what's public vs internal
- Can promote themes to public as they mature

This approach gives you a professional public face (Deep Sea) while keeping experimental themes accessible to anyone who knows about them.

---

## Related Files

- `frontend/index.html` - Deep Sea OS (public default)
- `frontend/select-theme.html` - Theme selector (internal, discoverable)
- `frontend/themes/` - All theme implementations
- `vercel.json` - Deployment configuration (needs to be created)
