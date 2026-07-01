# Runwise — Claude Code Project Config

## Documentation

Guides live under `docs/Guides/` in three sub-folders:
- `docs/Guides/User Guide/`
- `docs/Guides/Developer Guide/`
- `docs/Guides/Deployment Guide/`

Each guide is maintained as a `.md` file (source of truth). After updating any `.md` file under `docs/Guides/`, regenerate the derived formats:

```bash
npm run docs:generate
```

This converts every guide `.md` → `.html` and `.pdf` in-place.

**Important:** Only regenerate PDF/HTML if their source `.md` file has actually changed. After running `npm run docs:generate`, restore unmodified binaries to avoid spurious diffs:

```bash
git checkout -- docs/Guides/*/*.pdf docs/Guides/*/*.html
```

Then commit only the `.md` files that changed, plus their corresponding HTML/PDF if content changed. This keeps git history clean and makes it clear what actually changed in the documentation.

## Testing

```bash
npm run test
```

## Workflow

Issue-driven development:
1. `/analyse <issue>` — requirements
2. `/design <issue>` — architecture
3. `/develop <issue>` — TDD implementation
4. `/verify <PR>` — runtime verification
5. `/pr-reviewer <PR>` — acceptance criteria audit
6. `/merge <PR>` — merge + close issues
