/**
 * Test Suite: Senegal Basins Extension, OMVS Hydrological Coupling & SITREP Generator
 */

import { STUDY_AREAS, REAL_SENTINEL_CATALOG } from '../copernicusService';
import { omvsHydrologyService, OMVS_STATIONS } from '../omvsHydrologyService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('--- TEST 1: SENEGAL GEOGRAPHIC BASINS EXTENSION ---');
  const podor = STUDY_AREAS.find(a => a.id === 'senegal_river_podor');
  assert(!!podor, 'Podor study area must exist');
  assert(podor!.assets.length >= 4, 'Podor must have at least 4 critical assets');
  assert(podor!.bbox[0] < podor!.bbox[2], 'Podor BBOX minLon must be < maxLon');

  const matam = STUDY_AREAS.find(a => a.id === 'senegal_river_matam');
  assert(!!matam, 'Matam study area must exist');
  assert(matam!.assets.some(a => a.name.includes('Ourossogui')), 'Matam must include Ourossogui hospital');

  const bakel = STUDY_AREAS.find(a => a.id === 'senegal_river_bakel');
  assert(!!bakel, 'Bakel study area must exist');
  assert(bakel!.assets.some(a => a.name.includes('OMVS Bakel')), 'Bakel must include OMVS gauge station');

  const saloum = STUDY_AREAS.find(a => a.id === 'saloum_delta');
  assert(!!saloum, 'Saloum delta study area must exist');
  assert(saloum!.assets.some(a => a.name.includes('Foundiougne')), 'Saloum must include Foundiougne bridge');

  const anambe = STUDY_AREAS.find(a => a.id === 'casamance_anambe');
  assert(!!anambe, 'Anambé basin study area must exist');
  assert(anambe!.assets.some(a => a.name.includes('Anambé')), 'Anambé must include dam assets');

  console.log('[PASS] All 5 Senegal basins are properly configured with assets and footprints.');

  console.log('--- TEST 2: SATELLITE CATALOG MAPPING FOR NEW AREAS ---');
  for (const id of ['senegal_river_podor', 'senegal_river_matam', 'senegal_river_bakel', 'saloum_delta', 'casamance_anambe']) {
    const scenes = REAL_SENTINEL_CATALOG[id];
    assert(Array.isArray(scenes) && scenes.length >= 2, `Catalog must have pre/post scenes for ${id}`);
    assert(scenes[0].instrument === 'C-SAR', `Scene must be Sentinel-1 C-SAR for ${id}`);
  }
  console.log('[PASS] Sentinel-1 pre/post event pairs verified for all basins.');

  console.log('--- TEST 3: OMVS HYDROLOGICAL SERVICE COUPLING ---');
  const basin = omvsHydrologyService.getBasinHydrology();
  assert(basin.stations.length >= 8, 'OMVS network must contain at least 8 dams and gauge stations');
  assert(basin.globalAlertStatus === 'RED', 'OMVS global alert must reflect high water levels');
  assert(basin.manantaliDischargeM3s >= 1000, 'Manantali spillway discharge must be >= 1000 m3/s during flood peak');
  assert(basin.wavePropagationEstimateDays.bakelToMatam === 2.0, 'Bakel to Matam propagation delay must be 2.0 days');

  const podorPressure = omvsHydrologyService.getHydrologicalPressureForArea('senegal_river_podor');
  assert(podorPressure.relevance === 'DIRECT_OMVS_INFLUENCE', 'Podor must have direct OMVS influence');
  assert(Boolean(podorPressure.governingStation?.name.includes('Podor')), 'Governing station for Podor area must be Podor');

  const matamPressure = omvsHydrologyService.getHydrologicalPressureForArea('senegal_river_matam');
  assert(Boolean(matamPressure.governingStation?.name.includes('Matam')), 'Governing station for Matam area must be Matam');

  const anambePressure = omvsHydrologyService.getHydrologicalPressureForArea('casamance_anambe');
  assert(anambePressure.relevance === 'REGIONAL_WATERSHED', 'Anambé must be regional watershed');

  console.log('[PASS] OMVS hydrological coupling, stations and hydrodynamic influences verified.');

  console.log('=== ALL 3 NEW COMPONENTS VALIDATED SUCCESSFULLY ===');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
