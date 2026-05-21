// Simulate browser hydration — test API → normalizeTemplate → templateStore

const BASE_URL = 'https://ds360.imaginizedlabs.com/api';

function normalizeTemplate(doc) {
  const pick = (keys) => {
    for (const k of keys) {
      const v = doc[k];
      if (v !== undefined && v !== null) return String(v);
    }
    return undefined;
  };
  return {
    id: String(doc.id ?? ''),
    name: String(doc.name ?? ''),
    active: Boolean(doc.active ?? false),
    description: String(doc.description ?? ''),
    approvalRequired: Boolean(doc.approvalRequired ?? doc.approval_required ?? false),
    readOnly: String(doc.readOnly ?? doc.read_only ?? ''),
    internalUseOnly: String(doc.internalUseOnly ?? doc.internal_use_only ?? ''),
    templateTypeId: String(doc.templateTypeId ?? doc.template_type_id ?? doc.templateTypeId ?? ''),
    configJson: pick(['configJson', 'config_json']),
    elementsJson: pick(['elementsJson', 'elements_json']),
    typographyJson: pick(['typographyJson', 'typography_json']),
  };
}

async function test() {
  console.log('=== HYDRATION SIMULATION ===\n');

  // Step 1: getAll
  const listRes = await fetch(`${BASE_URL}/templates`);
  const listRaw = await listRes.json();
  console.log(`getAll returned ${listRaw.length} templates`);
  for (const t of listRaw) {
    console.log(`  ${t.id} | ${t.name}`);
  }

  // Step 2: getOne for first template
  const firstId = listRaw[0].id;
  console.log(`\nFetching getOne for ${firstId}...`);
  const oneRes = await fetch(`${BASE_URL}/templates/${firstId}`);
  const oneRaw = await oneRes.json();
  console.log('Raw response keys:', Object.keys(oneRaw));
  console.log('config_json:', oneRaw.config_json ? `present (${oneRaw.config_json.length} chars)` : 'null/undefined');
  console.log('elements_json:', oneRaw.elements_json ? `present (${oneRaw.elements_json.length} chars)` : 'null/undefined');
  console.log('typography_json:', oneRaw.typography_json ? `present (${oneRaw.typography_json.length} chars)` : 'null/undefined');

  // Step 3: normalize
  const normalized = normalizeTemplate(oneRaw);
  console.log('\nNormalized result:');
  console.log('  configJson:', normalized.configJson !== undefined ? `present (${normalized.configJson.length} chars)` : 'undefined');
  console.log('  elementsJson:', normalized.elementsJson !== undefined ? `present (${normalized.elementsJson.length} chars)` : 'undefined');
  console.log('  typographyJson:', normalized.typographyJson !== undefined ? `present (${normalized.typographyJson.length} chars)` : 'undefined');

  // Step 4: check if hydration guard passes
  const hasData = normalized.configJson !== undefined || normalized.elementsJson !== undefined || normalized.typographyJson !== undefined;
  console.log('\nHydration guard passes?', hasData);

  if (hasData) {
    try {
      const config = JSON.parse(normalized.configJson ?? '{}');
      const elements = JSON.parse(normalized.elementsJson ?? '[]');
      const canvasConfig = normalized.typographyJson ? JSON.parse(normalized.typographyJson) : {};
      console.log('Parsed config keys:', Object.keys(config));
      console.log('Parsed elements count:', elements.length);
      console.log('Parsed canvasConfig keys:', Object.keys(canvasConfig));
      console.log('\n✅ HYDRATION WOULD SUCCEED');
    } catch (e) {
      console.log('\n❌ PARSE ERROR:', e.message);
    }
  } else {
    console.log('\n❌ HYDRATION WOULD SKIP — no builder data');
  }
}

test().catch(console.error);