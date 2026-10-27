---
name: dataverse-flow-api
description: Create, bind connections, activate, edit and debug Power Automate cloud flows through the Dataverse Web API from an authenticated browser session. Use for flows triggered by Microsoft Forms or HTTP that write Dataverse rows and notify by email and Teams.
---

# Power Automate flows through the Dataverse Web API

Run the calls from a browser tab already signed in to the Dataverse org
(`https://<ORG>.crm<N>.dynamics.com/api/data/v9.2/...`) using `fetch` in the page. Same-origin calls use the session.

## 1. Find the right environment first

Flows live in the environment that owns the Dataverse org. Do not guess environment IDs. Read them
from the portal URL or the org. A flow created in the wrong environment cannot see your tables.

## 2. Connection references

A flow created through the API uses connection references.

- List: `GET /connectionreferences?$select=connectionreferencelogicalname,connectorid,connectionid`
- Create (unbound): `POST /connectionreferences` with `connectionreferencelogicalname`,
  `connectionreferencedisplayname`, `connectorid = /providers/Microsoft.PowerApps/apis/shared_<connector>`.
- Bind: `PATCH /connectionreferences(<id>)` with `{ "connectionid": "<connection id>" }`.
  The connection id is the last-but-one segment of the connection details URL in the Power Automate
  portal: `.../connections/<connector>/<CONNECTION_ID>/details`.
- A flow cannot be turned on while any reference is unbound ("Connection Id missing for connection reference ...").

**Creating a Forms or Teams connection needs the user's OAuth consent.** Open
`Connections > New connection`, let the user finish the sign-in popup, and confirm the status is
`Connected` (not `Reconnect`) before binding.

## 3. Create the flow

`POST /workflows` with:

```json
{ "name": "<flow name>", "category": 5, "type": 1, "primaryentity": "none",
  "statecode": 0, "clientdata": "<JSON string>" }
```

`clientdata` = `{ "properties": { "connectionReferences": {...}, "definition": {...} }, "schemaVersion": "1.0.0.0" }`.
Each entry in `connectionReferences`:
`{ "runtimeSource": "embedded", "connection": { "connectionReferenceLogicalName": "<logical name>" }, "api": { "name": "shared_<connector>" } }`.

Actions use `type: "OpenApiConnection"` with `host: { connectionName, operationId, apiId }`,
`parameters`, and `authentication: "@parameters('$authentication')"`. See `templates/forms-to-dataverse-flow.js`.

Useful operation IDs: `CreateFormWebhook` (trigger), `GetFormResponseById`, `CreateRecord` (Dataverse),
`SendEmailV2` (Outlook), `PostCardToConversation` (Teams, poster "Flow bot", location "Chat with Flow bot").

## 4. Activate, edit, deactivate

- Activate: `PATCH /workflows(<id>)` `{ "statecode": 1, "statuscode": 2 }`
- To change the definition: set `statecode 0 / statuscode 1`, PATCH `clientdata`, activate again.
- Verify with `GET /workflows(<id>)?$select=statecode,statuscode`.
- The portal "edit" URL for an API-created flow may redirect to the flow list. Open the details page
  and use Edit there, or keep changing it through the API.

## 5. Forms trigger gotcha

A flow written by hand receives the trigger body as a batch:
`{ "value": [ { "eventType": "ResponseAdded", "resourceData": { "formId", "responseId" } } ] }`.
The path `triggerOutputs()?['body/resourceData/responseId']` is empty here. Use:

```
@first(triggerBody()?['value'])?['resourceData']?['responseId']
```

Form answers come back keyed by question id: `outputs('Get_response_details')?['body/r<32 hex>']`.
Multi-select answers arrive as a JSON-like string such as `["A","B"]`, so strip `[`, `]` and quotes.

## 6. HTTP-trigger flows (anonymous)

If the tenant allows it, `triggerAuthenticationType: "All"` makes an HTTP trigger callable without sign-in.
Return CORS headers from a Response action. The callback URL contains a signature, so treat it like a secret.

## 7. Debug a failed run

1. Portal: flow details, 28-day run history, open the failed run.
2. Click the red action and read **Inputs** and **Outputs**. A 400 with an empty parameter usually means a bad expression path.
3. Click the trigger to see the real trigger body and fix the path to match it.
4. Fix through the API, reactivate, and test with a real submission.

## Browser-tool notes

- Very large inline JavaScript can be rejected by the browser extension. Build the JSON inside the page from
  compact code instead of pasting a huge literal.
- A tab can vanish mid-task. Open a new tab and retry.
- Output containing URLs with signatures or query strings may be blocked. Do not print callback URLs.
