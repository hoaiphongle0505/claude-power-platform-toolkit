---
name: forms-qr-device-check
description: Build a login-free device check with an anonymous Microsoft Form, pre-filled links and QR stickers, then process answers into Dataverse with email and Teams notifications. Use when people should scan a QR on a device to confirm its details or report a problem.
---

# QR device check with Microsoft Forms

Goal: anyone scans the sticker on a device, sees which device it is, and either confirms it or tells IT what is wrong, with no login.

## Form design

Questions (names are examples):

1. `Device (please do not change)`: single line text, pre-filled from the QR. Format: `<Kind> <CODE> | <brand> | SN <serial>`.
2. `Is the information about this device correct?`: choice, Yes / No.
3. `If something is wrong, what is it?`: multi-select (wrong user, department, location, model or serial, damaged, no longer have it).
4. `Details`: long text.
5. `Your name or email`: single line text.

Settings: allow anyone to respond (works only if the tenant allows anonymous responses; if not, a hosted page is needed).

## Pre-filled link

```
https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=<FORM_ID>&r<QUESTION_ID>=<url-encoded text>
```

Get question IDs by opening the response page and reading element ids that match `r[0-9a-f]{32}`;
they appear in question order. Confirm the mapping with a test submission.

## QR content

Encode the full pre-filled link as the QR payload. Generate one label per device. If the link format
changes, all printed labels must be reprinted.

## Branding the form

- Layout with a header works best. The header colour is **derived from the background image**. A pale image
  gives a gray header, so use a saturated brand-colour background (no text in it).
- Put the logo as the title image, on a white tile if the header is dark.
- You can also set a custom theme colour in `Style > Customize theme` by entering a hex value (for example `#0B6B50`).
- Forms cannot change fonts or corner radius.
- Forms adds its own privacy line in the viewer's language. It cannot be removed.

## Processing answers

Flow: Forms trigger -> Get response details -> parse device text -> if "Yes": log a "Confirmed" row;
otherwise log an "Issue" row, email IT and post a Teams card. Parsing: first token = kind, second = code.
Details in `skills/dataverse-flow-api` and `templates/`.

Suggested row title convention so dashboards can count them: `Confirmed [CODE] Kind` and `Issue [CODE] Kind`.
Notify only on issues to avoid noise.

## Test checklist

- [ ] Open a pre-filled link: device text is filled and shows correctly on a phone.
- [ ] Submit "No" with one problem: a row appears, the email arrives, the Teams card arrives.
- [ ] Submit "Yes": a row appears, no notification.
- [ ] Delete the test rows afterwards.
