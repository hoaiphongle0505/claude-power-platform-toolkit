// Paste into the browser console (or a JS tool) on the Dataverse org origin while signed in.
// Creates an inactive flow: Forms response -> Dataverse row -> (issues only) email + Teams card.
// Before running: create/bind connection references (see skills/dataverse-flow-api/SKILL.md).
(async () => {
  const CONFIG = {
    flowName: 'Device Check - Process Form Response',
    formId: '<FORM_ID>',
    q: { dev: 'r<DEVICE_QUESTION_ID>', ok: 'r<YESNO_QUESTION_ID>', prob: 'r<PROBLEM_QUESTION_ID>', det: 'r<DETAILS_QUESTION_ID>', who: 'r<WHO_QUESTION_ID>' },
    table: '<publisher>_<table plural logical name>',      // entity set name
    cols: { title: '<prefix>_feedbacktitle', content: '<prefix>_feedbackcontent', time: '<prefix>_feedbackdatetime', type: '<prefix>_feedbacktype' },
    typeConfirmed: 0, typeIssue: 0,                         // numeric choice values
    notifyEmail: '<you@example.com>',
    appUrl: '<APP_URL>',
    brand: '#0b6b50', company: '<Company name>', system: 'IT Device Check',
    refs: { forms: '<forms connection reference logical name>', teams: '<teams ...>', office365: '<office365 ...>', dataverse: '<dataverse ...>' },
  };
  const C = CONFIG, G = C.brand;
  const o = n => `@{outputs('${n}')}`;
  const g = k => `outputs('Get_response_details')?['body/${C.q[k]}']`, cE = k => `coalesce(${g(k)},'')`;
  const td = 'padding:10px 0;border-bottom:1px solid #eef1f0;font-size:13px';
  const row = (l, n) => `<tr><td style="${td};color:#555">${l}</td><td style="${td};text-align:right;font-weight:600;color:#111">${o(n)}</td></tr>`;
  const html = `<div style="background:#f0f1f1;padding:24px 0;font-family:Segoe UI,Arial,sans-serif"><table align="center" width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e3e6e5;width:600px;max-width:100%"><tr><td style="padding:18px 24px;border-bottom:2px solid #111"><span style="font-size:16px;font-weight:700;color:${G}">${C.company}</span><br><span style="font-size:11px;color:#666">${C.system}</span></td></tr><tr><td style="padding:20px 24px"><div style="display:inline-block;background:#e3f1ec;color:${G};font-size:11px;font-weight:700;padding:4px 8px">Status: Issue reported</div><div style="font-size:18px;font-weight:700;color:#111;margin-top:14px">Feedback from QR scan</div><table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px">${row('Device','Code')}${row('Type','Kind')}${row('Problem','Problems')}${row('Details','Details')}${row('Reported by','Who')}</table><div style="margin-top:20px"><a href="${C.appUrl}" style="background:${G};color:#fff;text-decoration:none;font-weight:700;font-size:13px;padding:10px 16px;display:inline-block">Open app</a></div></td></tr></table></div>`;
  const tb = (t, x = {}) => ({ type: 'TextBlock', text: t, ...x }), fact = (t, n) => ({ title: t, value: o(n) });
  const card = { type: 'AdaptiveCard', $schema: 'http://adaptivecards.io/schemas/adaptive-card.json', version: '1.4',
    body: [{ type: 'Container', style: 'emphasis', items: [tb(C.company, { weight: 'Bolder', size: 'Medium', color: 'Accent' }), tb(C.system, { isSubtle: true, size: 'Small', spacing: 'None' })] },
      tb('Status: Issue reported', { weight: 'Bolder', color: 'Good', spacing: 'Medium' }), tb('Feedback from QR scan', { size: 'Large', weight: 'Bolder', wrap: true }),
      { type: 'FactSet', facts: [fact('Device', 'Code'), fact('Type', 'Kind'), fact('Problem', 'Problems'), fact('Details', 'Details'), fact('Reported by', 'Who')] }],
    actions: [{ type: 'Action.OpenUrl', title: 'Open app', url: C.appUrl }] };
  const ra = n => ({ [n]: ['Succeeded'] });
  const Cmp = (i, after) => ({ type: 'Compose', inputs: i, runAfter: after ? ra(after) : {} });
  const api = n => '/providers/Microsoft.PowerApps/apis/' + n;
  const op = (c, id, p, after) => ({ type: 'OpenApiConnection', inputs: { host: { connectionName: c, operationId: id, apiId: api(c) }, parameters: p, authentication: "@parameters('$authentication')" }, runAfter: after ? ra(after) : {} });
  const rec = (t, ty, c) => ({ entityName: C.table, ['item/' + C.cols.title]: t, ['item/' + C.cols.content]: c, ['item/' + C.cols.time]: '@utcNow()', ['item/' + C.cols.type]: ty });
  const A = {
    Get_response_details: op('shared_microsoftforms', 'GetFormResponseById', { form_id: C.formId, response_id: "@first(triggerBody()?['value'])?['resourceData']?['responseId']" }),
    Device: Cmp(`@${cE('dev')}`, 'Get_response_details'),
    Kind: Cmp("@first(split(outputs('Device'),' '))", 'Device'),
    Code: Cmp("@if(greater(length(split(outputs('Device'),' ')),1),split(outputs('Device'),' ')[1],outputs('Device'))", 'Kind'),
    Is_OK: Cmp(`@contains(${cE('ok')},'Yes')`, 'Code'),
    Problems: Cmp(`@if(empty(${cE('prob')}),'-',replace(replace(replace(${cE('prob')},'[',''),']',''),'"',''))`, 'Is_OK'),
    Details: Cmp(`@if(empty(${cE('det')}),'-',${g('det')})`, 'Problems'),
    Who: Cmp(`@if(empty(${cE('who')}),'not given',${g('who')})`, 'Details'),
    Check_answer: { type: 'If', expression: { equals: ["@outputs('Is_OK')", true] },
      actions: { Log_confirmed: { ...op('shared_commondataserviceforapps', 'CreateRecord', rec(`Confirmed [${o('Code')}] ${o('Kind')}`, C.typeConfirmed, `Everything is correct. (Reporter: ${o('Who')}; via QR form)`)), runAfter: {} } },
      else: { actions: {
        Log_issue: { ...op('shared_commondataserviceforapps', 'CreateRecord', rec(`Issue [${o('Code')}] ${o('Kind')}`, C.typeIssue, `${o('Problems')} | ${o('Details')} (Reporter: ${o('Who')}; via QR form)`)), runAfter: {} },
        Email_IT: op('shared_office365', 'SendEmailV2', { 'emailMessage/To': C.notifyEmail, 'emailMessage/Subject': `[Device check] ${o('Code')} - Issue reported`, 'emailMessage/Body': html, 'emailMessage/Importance': 'Normal' }, 'Log_issue'),
        Teams_card: op('shared_teams', 'PostCardToConversation', { poster: 'Flow bot', location: 'Chat with Flow bot', 'body/recipient': C.notifyEmail, 'body/messageBody': JSON.stringify(card) }, 'Email_IT') } },
      runAfter: ra('Who') } };
  const cr = (a, n) => ({ runtimeSource: 'embedded', connection: { connectionReferenceLogicalName: n }, api: { name: a } });
  const cd = { properties: {
    connectionReferences: { shared_microsoftforms: cr('shared_microsoftforms', C.refs.forms), shared_teams: cr('shared_teams', C.refs.teams), shared_office365: cr('shared_office365', C.refs.office365), shared_commondataserviceforapps: cr('shared_commondataserviceforapps', C.refs.dataverse) },
    definition: { $schema: 'https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#', contentVersion: '1.0.0.0',
      parameters: { $connections: { defaultValue: {}, type: 'Object' }, $authentication: { defaultValue: {}, type: 'SecureObject' } },
      triggers: { When_a_new_response_is_submitted: { type: 'OpenApiConnectionWebhook', inputs: { host: { connectionName: 'shared_microsoftforms', operationId: 'CreateFormWebhook', apiId: api('shared_microsoftforms') }, parameters: { form_id: C.formId }, authentication: "@parameters('$authentication')" } } },
      actions: A } }, schemaVersion: '1.0.0.0' };
  const r = await fetch('/api/data/v9.2/workflows', { method: 'POST', headers: { 'Content-Type': 'application/json', 'OData-Version': '4.0', Accept: 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ name: C.flowName, category: 5, type: 1, primaryentity: 'none', statecode: 0, clientdata: JSON.stringify(cd) }) });
  console.log('create flow status', r.status);
  return r.status;
})();
