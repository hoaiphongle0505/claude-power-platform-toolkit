# Claude Power Platform Toolkit

Skills and agents for [Claude](https://claude.ai) (Claude Code / Cowork) that make building and
running **Power Apps Code Apps + Dataverse + Power Automate + Microsoft Forms** solutions faster.
They were distilled from building a real IT asset inventory app with QR-code device checks.

Everything here is generic: no company names, tenant IDs, emails or real data.
Replace the `<PLACEHOLDERS>` with your own values.

## What is inside

| Path | What it does |
|---|---|
| `skills/power-apps-code-app-deploy` | Package, build and push a React/TypeScript/Vite Power Apps Code App; cumulative update zips; pitfalls |
| `skills/dataverse-flow-api` | Create, bind, activate and debug Power Automate cloud flows through the Dataverse Web API |
| `skills/forms-qr-device-check` | Anonymous Microsoft Form + QR stickers that let anyone confirm or report a device without logging in |
| `skills/working-style` | A small, editable profile for how the assistant should work with you (language, delivery, verification) |
| `agents/` | Three Claude Code agents: `code-app-deployer`, `flow-builder`, `flow-debugger` |
| `templates/` | HTML email, Teams Adaptive Card and a flow generator script with placeholders |
| `docs/` | Gotchas collected along the way |

## Install

**Skills (Claude Code):** copy the folders you want into `~/.claude/skills/` (all projects) or
`<project>/.claude/skills/` (one project).

```bash
cp -r skills/* ~/.claude/skills/
```

**Agents (Claude Code):** copy the files into `~/.claude/agents/` or `<project>/.claude/agents/`.

```bash
cp agents/*.md ~/.claude/agents/
```

**Cowork / claude.ai:** add each skill folder as a custom skill (each folder contains a `SKILL.md`).

## Customize

Open `skills/working-style/SKILL.md` and change the language, delivery habits and
verification rules to match you. The other skills do not depend on it.

## Tiếng Việt (tóm tắt)

Bộ skill và agent cho Claude giúp làm app Power Apps Code App với Dataverse, Power Automate
và Microsoft Forms. Gồm: đóng gói và đẩy app, tạo flow bằng API Dataverse, Form ẩn danh kèm
tem QR thiết bị, và hồ sơ cách làm việc có thể sửa. Cài bằng cách chép thư mục vào
`~/.claude/skills/` và `~/.claude/agents/`. Thay các `<PLACEHOLDER>` bằng giá trị của bạn.

## Disclaimer

Not affiliated with Microsoft or Anthropic. Test everything in a non-production environment first.
Client-side checks in a Code App (for example hiding admin pages) are **not** security; enforce
access with Dataverse security roles.

## License

MIT
