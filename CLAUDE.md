# Runwise — Claude Code Project Config

## Documentation

Guides live under `docs/Guides/` in three sub-folders:
- `docs/Guides/User Guide/`
- `docs/Guides/Developer Guide/`
- `docs/Guides/Deployment Guide/`

Each guide is maintained as a `.md` file (source of truth). After updating any `.md` file under `docs/Guides/`, always regenerate the derived formats:

```bash
npm run docs:generate
```

This converts every guide `.md` → `.html` and `.pdf` in-place. Commit all three formats together.

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
