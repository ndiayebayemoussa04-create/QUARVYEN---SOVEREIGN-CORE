# Exécution openEO sur Copernicus Data Space Ecosystem (CDSE)

## Spécification du Graphe de Processus openEO
QARVYEN 2.0 génère des graphes de processus JSON standardisés et compatibles avec l'API openEO v1.2.0 de l'ESA.

```json
{
  "process_graph": {
    "load_post": {
      "process_id": "load_collection",
      "arguments": {
        "id": "SENTINEL1_GRD",
        "spatial_extent": { "west": -15.15, "east": -14.85, "south": 16.55, "north": 16.78 },
        "temporal_extent": ["2024-10-18T00:00:00Z", "2024-10-18T23:59:59Z"],
        "bands": ["VV"]
      }
    },
    "sar_backscatter": {
      "process_id": "sar_backscatter",
      "arguments": {
        "data": { "from_node": "load_post" },
        "coefficient": "sigma0",
        "elevation_model": "COPERNICUS_30M"
      }
    },
    "speckle_lee": {
      "process_id": "apply_kernel",
      "arguments": {
        "data": { "from_node": "sar_backscatter" },
        "kernel": "Lee_5x5"
      }
    },
    "flood_threshold": {
      "process_id": "lte",
      "arguments": {
        "x": { "from_node": "speckle_lee" },
        "y": -15.5
      },
      "result": true
    }
  }
}
```

## Soumission en Batch Job CDSE
Pour soumettre ce graphe au cluster de calcul souverain européen :
```bash
curl -X POST "https://openeo.dataspace.copernicus.eu/openeo/1.2/jobs" \
  -H "Authorization: Bearer $CDSE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d @openeo_process_graph.json
```
