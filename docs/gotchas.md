# Gotchas

- **Forms anonymous responses** only work if the tenant allows them. If not, you need a hosted page or sign-in.
- **Power Pages** developer environments cannot be made public; private sites need admin consent for sign-in.
- **Forms trigger path** for hand-written flows: `first(triggerBody()?['value'])?['resourceData']?['responseId']`.
- **Forms header colour** comes from the background image. Pale image -> gray header.
- **Forms connection** may show `Reconnect` until the OAuth popup is completed by the user.
- **Flow will not turn on** while a connection reference has no connection id.
- **Native file dialogs** (for example Forms background upload) cannot be driven by browser automation. The user uploads manually.
- **Printed QR labels** go stale when the link format changes. Reprint.
- **Client-side admin gating** is not security. Use Dataverse security roles.
- **Large inline JS** can be rejected by browser tools. Generate JSON in the page from compact code.
