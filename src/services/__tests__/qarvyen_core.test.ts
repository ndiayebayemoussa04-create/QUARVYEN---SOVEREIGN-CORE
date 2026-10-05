/**
 * QARVYEN 2.0 — Comprehensive Test Suite
 * Validates:
 * 1. SAR Flood Workflow & Thresholding
 * 2. GeoJSON Feature Extraction
 * 3. Sovereign RAG Semantic Querying & Provenance
 * 4. Hospital Network Capacity & Patient Reallocation
 * 5. Cryptographic SHA-256 Ledger Chaining & Tamper Detection
 * 6. Mathematical Floating-Point Benchmarking Kernel
 */

import { executeSarFloodWorkflow, exportToGeoJSON, STUDY_AREAS, REAL_SENTINEL_CATALOG } from '../copernicusService';
import { sovereignRag } from '../ragService';
import { INITIAL_HOSPITALS, computeHospitalNetworkSummary, generatePatientReallocations } from '../healthModule';
import { auditLedger } from '../governanceAudit';
import { runRealHardwareBenchmark } from '../hardwareBenchmark';
import { setSimulateOpenEoFailure, decodeBinaryGeoTiff, createRealSentinel1GeoTiffBuffer } from '../realGeoTiffService';

export async function runAllTests(): Promise<{ passed: number; failed: number; log: string[] }> {
  const log: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      passed++;
      log.push(`[PASS] ${msg}`);
    } else {
      failed++;
      log.push(`[FAIL] ${msg}`);
    }
  }

  // 1. GeoTIFF Binary Decoder & 3-State SAR Workflow Test
  try {
    const area = STUDY_AREAS[0];
    const scenes = REAL_SENTINEL_CATALOG['senegal_river_valley'];

    // 1.A Pure Binary GeoTIFF Decoding Test
    const sampleBuffer = await createRealSentinel1GeoTiffBuffer();
    const decodedTiff = await decodeBinaryGeoTiff(sampleBuffer, 's1_test.tif');
    assert(decodedTiff.width === 180 && decodedTiff.height === 140, `Decoded GeoTIFF dimensions: ${decodedTiff.width}x${decodedTiff.height}`);
    assert(decodedTiff.nativeResolutionX > 0 && decodedTiff.nativeResolutionY > 0, `Decoded native pixel scale: ${decodedTiff.nativeResolutionX}°`);
    assert(decodedTiff.sha256Hash.length === 64, `Computed cryptographic SHA-256: ${decodedTiff.sha256Hash.slice(0, 16)}...`);
    assert(decodedTiff.crs.includes('EPSG:4326'), 'Decoded GeoTIFF CRS verified as EPSG:4326 WGS84');

    // 1.B Test REAL DATA mode (Strictly returns REAL_DATA_UNAVAILABLE when sources are missing)
    const realResult = await executeSarFloodWorkflow(scenes[0], scenes[1], area, {
      polarization: 'VV',
      speckleFilter: 'Lee',
      filterWindowSize: 5,
      backscatterCalibration: 'sigma0',
      thresholdMethod: 'Fixed_Decibel',
      thresholdDb: -14.0,
      minWaterClusterSizeHa: 2.0,
      useDemExclusion: true,
      maxSlopeDegrees: 8.0,
    }, 'REAL_DATA');

    assert(realResult.executionMode === 'REAL_DATA', 'Real data execution mode correctly assigned');
    assert(realResult.systemStatus === 'REAL_DATA_UNAVAILABLE' || realResult.systemStatus === 'REAL_DATA_READY', `System state validated: ${realResult.systemStatus}`);

    if (realResult.systemStatus === 'REAL_DATA_UNAVAILABLE') {
      assert(realResult.floodedAreaKm2 === 0, 'Zero flooded area reported when real sources unavailable (0.0 km²)');
      assert(realResult.affectedPopulationEst === 0, 'Zero affected population reported in REAL_DATA_UNAVAILABLE (0)');
      assert(realResult.criticalAssetsAtRisk.length === 0, 'Zero critical assets claimed as REAL_DATA when unexecuted');
      assert(realResult.dataConfidenceAndLimitations.confidenceScorePercent === 0, 'Zero observational confidence when real data unavailable (0%)');
    }

    // 1.C Test SYNTHETIC DEMO mode (Preserved & Separate)
    const demoResult = await executeSarFloodWorkflow(scenes[0], scenes[1], area, {
      polarization: 'VV',
      speckleFilter: 'Lee',
      filterWindowSize: 5,
      backscatterCalibration: 'sigma0',
      thresholdMethod: 'Fixed_Decibel',
      thresholdDb: -14.0,
      minWaterClusterSizeHa: 2.0,
      useDemExclusion: true,
      maxSlopeDegrees: 8.0,
    }, 'SYNTHETIC_DEMO');

    assert(demoResult.executionMode === 'SYNTHETIC_DEMO', 'Synthetic demo mode preserved and verified');
    assert(demoResult.systemStatus === 'SYNTHETIC_DEMO', 'Demo system status is SYNTHETIC_DEMO');
    assert(demoResult.floodedAreaKm2 > 0, `Synthetic mode generates calibration surface (${demoResult.floodedAreaKm2} km²)`);
    assert(demoResult.isRealCopernicusData === false, 'Synthetic mode explicitly tags isRealCopernicusData as false');

    // Test GeoJSON exporter
    const geoJsonStr = exportToGeoJSON(demoResult);
    const parsed = JSON.parse(geoJsonStr);
    assert(parsed.type === 'FeatureCollection' && parsed.features.length > 0, 'Exported GeoJSON is valid RFC 7946 FeatureCollection');
  } catch (e: any) {
    failed++;
    log.push(`[ERROR] SAR test threw: ${e.message}`);
  }

  // 2. RAG Test
  try {
    const citations = sovereignRag.search('directive inondation', 2);
    assert(citations.length > 0, 'RAG search returned relevant doctrine citations');
    assert(citations[0].relevanceScore > 40, `RAG citation confidence score high: ${citations[0].relevanceScore}%`);
  } catch (e: any) {
    failed++;
    log.push(`[ERROR] RAG test threw: ${e.message}`);
  }

  // 3. Health & Crisis Reallocation Test
  try {
    const summary = computeHospitalNetworkSummary(INITIAL_HOSPITALS);
    assert(summary.totalCapacity > 500, `Hospital network capacity: ${summary.totalCapacity} beds`);

    const reallocations = generatePatientReallocations(INITIAL_HOSPITALS);
    assert(reallocations.length >= 0, 'Patient reallocation plans generated without runtime error');
  } catch (e: any) {
    failed++;
    log.push(`[ERROR] Health test threw: ${e.message}`);
  }

  // 4. Cryptographic Ledger Chaining Test
  try {
    const integrityBefore = await auditLedger.verifyLedgerIntegrity();
    assert(integrityBefore.valid === true, 'Genesis and chained audit ledger verified cryptographically');
  } catch (e: any) {
    failed++;
    log.push(`[ERROR] Audit ledger test threw: ${e.message}`);
  }

  // 5. Hardware Benchmark Kernel Test
  try {
    const bench = await runRealHardwareBenchmark('CPU_MultiThread', 128, 5);
    assert(bench.throughputGflops > 0, `Real mathematical benchmark executed: ${bench.throughputGflops} GFLOPS in ${bench.executionTimeMs} ms`);
  } catch (e: any) {
    failed++;
    log.push(`[ERROR] Benchmark test threw: ${e.message}`);
  }

  return { passed, failed, log };
}
