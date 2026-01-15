# Prototypes & Experimental Code

This folder contains experimental/prototype code that has been consolidated from various locations in the codebase. These are **not part of the production narrative-os** and should be excluded from:

- Test suite execution
- Build/bundle process
- Production deployment

## Contents

### `/rooms/`
Experimental theme interfaces exploring different aesthetic directions

- **cottage/room-integrated.html** - Pixel art inspired UI prototype for witch's cottage theme (kept for reference)

## Usage

This folder exists as a reference library for:
- Exploring abandoned design directions
- Testing UI approaches before committing to core
- Documenting what was tried and why it wasn't adopted
- Inspiring future experimental work

## Testing & Build Configuration

The `/prototypes/` directory is explicitly excluded from:
- `vitest.config.mjs` - no unit/integration tests
- Build processes - not bundled
- Type checking - not analyzed for TypeScript errors

## Adding New Prototypes

When creating experimental code:
1. Keep it in a feature branch or `/prototypes/`
2. Document why it exists and what it's exploring
3. Only move to production code when proven valuable
4. Otherwise, archive in `/prototypes/` for historical reference
