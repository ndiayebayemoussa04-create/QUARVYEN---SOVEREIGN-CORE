# QARVYEN 2.0 — Sovereign Intelligence for Complex Worlds

**Plateforme d'intelligence souveraine multisectorielle combinant données satellitaires Sentinel-1 SAR, cartographie tactique, RAG souverain, agents IA, simulation de crise, accélération matérielle (CPU / NVIDIA CUDA / AMD ROCm / Apple Metal) et gouvernance auditable.**

---

## 🏛️ Vue d'Ensemble & Positionnement

QARVYEN 2.0 répond aux exigences des environnements régaliens, militaires et de sécurité civile :
- **Souveraineté totale :** Conçu pour fonctionner en enclave locale déconnectée (*air-gapped*), sans fuite de données vers des clouds tiers.
- **Télédétection radar authentique :** Exploite les données réelles Sentinel-1 C-SAR IW GRD du **Copernicus Data Space Ecosystem (CDSE)**. Aucune donnée synthétique n'est présentée comme réelle.
- **RAG & Traçabilité Doctrinale :** Ancrage inviolable des décisions dans les textes juridiques (Directive 2007/60/CE), manuels ESA et doctrines de crise ORSEC.
- **Multi-Agents Autonomes :** Architecture séquentielle stricte : `Retrieve` → `Ground` → `Analyze` → `Simulate` → `Explain` → `Audit`.
- **Extensibilité Multisectorielle :** Le même *Core* gère les inondations géospatiales et la réallocation capacitaire hospitalière (Module Health).

---

## 📂 Architecture du Projet

```
qarvyen-2.0/
├── backend/
│   ├── main.py                          # Serveur FastAPI souverain & API openEO / Sentinel-1
│   ├── requirements.txt                 # Dépendances Python (FastAPI, PyTorch, GDAL, openEO)
│   ├── docs/
│   │   ├── sentinel1_flood_workflow.md  # Principes physiques radar SAR & calibration
│   │   └── openeo_real_execution.md     # Spécification graphe openEO CDSE
│   └── data/
│       └── synthetic_satellite_scene.json # Vecteur étalonné de calibration
├── src/
│   ├── types/
│   │   └── qarvyen.ts                   # Contrats d'interface TypeScript stricts
│   ├── services/
│   │   ├── copernicusService.ts         # Moteur SAR, calibration dB, filtre de Lee, GeoJSON
│   │   ├── ragService.ts                # Ingestion PDF/MD, indexation sémantique & citations
│   │   ├── agentOrchestrator.ts         # Orchestrateur des 6 agents IA souverains
│   │   ├── localLlmService.ts           # Intégration Ollama local & Fallback déterministe
│   │   ├── hardwareBenchmark.ts         # Détection GPU & benchmark mathématique réel
│   │   ├── healthModule.ts              # Module multisectoriel : hôpitaux & réallocation
│   │   ├── governanceAudit.ts           # Grand livre d'audit chaîné en SHA-256 & RBAC
│   │   └── __tests__/
│   │       └── qarvyen_core.test.ts     # Suite de tests unitaires du noyau
│   ├── components/
│   │   ├── Map/InteractiveMap.tsx       # Carte Leaflet interactive multi-couches
│   │   ├── Navigation/Header.tsx        # Bandeau d'habilitation & sélecteur RBAC
│   │   ├── Workflows/
│   │   │   ├── FloodWorkflowView.tsx    # Workflow complet Sentinel-1 SAR & simulation
│   │   │   └── HealthWorkflowView.tsx   # Dashboard régulation sanitaire & surcharge
│   │   ├── Agents/AgentOrchestratorView.tsx # Visualiseur temps réel des 6 agents
│   │   ├── RAG/RagDocumentManager.tsx   # Gestionnaire documentaire & bac à sable sémantique
│   │   ├── Hardware/HardwareBenchmarkModal.tsx # Benchmark réel GFLOPS & tenseurs
│   │   ├── Governance/AuditLogView.tsx  # Registre cryptographique et vérificateur d'intégrité
│   │   └── Demo/HackathonGuideModal.tsx # Guide interactif démo 5 minutes
│   ├── App.tsx                          # Point d'entrée React SPA
│   ├── index.css                        # Design Tailwind CSS Dark Tactical
│   └── main.tsx
├── .env.example                         # Spécification des variables d'environnement
├── Dockerfile                           # Image de production multi-stage
├── docker-compose.yml                   # Déploiement avec service Ollama local
├── metadata.json
└── package.json
```

---

## 🚀 Installation & Lancement

### 1. Prérequis Système
- **Node.js :** v18+ ou v20+
- **Python (optionnel si backend direct) :** 3.10+
- **Optionnel pour LLM local :** [Ollama](https://ollama.ai) (`ollama run mistral`)

### 2. Lancement Local sur macOS (Apple Silicon M1/M2/M3/M4 ou Intel)
```bash
# 1. Cloner et installer les dépendances Node
npm install

# 2. Configurer l'environnement
cp .env.example .env

# 3. Lancer le serveur de développement
npm run dev
```
L'application est immédiatement accessible sur `http://localhost:3000`.

### 3. Lancement Backend Python (Optionnel)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```
Le backend écoute sur `http://localhost:8000`.

### 4. Déploiement Docker (Linux, Windows, Mac)
```bash
docker compose up --build -d
```

---

## ⚡ Accélération Matérielle & GPU (Priorité 6)

QARVYEN intègre un moteur de calcul tensoriel réel pour exécuter le filtrage de speckle (Lee 5x5) et la détection de changement :

### Détection & Compatibilité
- **macOS :** Accélération Apple Silicon Metal via WebGPU / WebGL2 Compute et mémoire unifiée.
- **Linux / Windows NVIDIA :** Accélération NVIDIA CUDA (Tensor Cores / SM).
- **Linux AMD :** Accélération AMD ROCm HIP.
- **CPU :** Multi-threading vectoriel SIMD.

### Lancer le Benchmark Réel
Cliquez sur le badge **"Moteur : ..."** dans l'en-tête de l'application ou ouvrez le modal de benchmark :
- Choix de la taille du tensor : $256 \times 256$, $512 \times 512$ ou $1024 \times 1024$.
- Exécution de 10 à 50 passes de convolution réelle.
- Mesure précise en **GFLOPS**, temps d'exécution (ms) et bande passante mémoire (GB/s).

---

## 🧠 LLM Local & Fallback Souverain (Priorité 5)

1. **Avec Ollama (Recommandé en local) :**
   ```bash
   ollama pull mistral
   ollama serve
   ```
   QARVYEN détecte automatiquement la présence d'Ollama sur `http://127.0.0.1:11434` et lui délègue la synthèse opérationnelle avec les extraits RAG injectés.
2. **Sans Ollama (Mode Dégradé Air-Gapped) :**
   Le **Noyau Règle Déterministe QARVYEN v2.4** prend immédiatement le relais. Il produit une analyse tactique rigoureuse basée sur les règles sans jamais appeler d'API cloud non autorisée.

---

## 🛡️ Sécurité & Matrice RBAC (Priorité 8)

| Rôle | Périmètre Opérationnel | Habilitation |
| :--- | :--- | :--- |
| **Admin (C2)** | Contrôle total, réallocations de crise, changement d'enclave | `CONFIDENTIEL_DEFENSE` |
| **Analyste** | Traitement SAR Sentinel-1, ajustement seuils dB, export GeoJSON | `DIFFUSION_RESTREINTE` |
| **Auditeur** | Consultation grand livre SHA-256, vérification de l'intégrité | `CONFIDENTIEL_DEFENSE` |
| **Opérateur** | Surveillance tactique cartographique, exécution sanitaire | `DIFFUSION_RESTREINTE` |

---

## ⏱️ Guide Démo Hackathon (5 Minutes Chrono)

Un modal interactif **"Démo Hackathon (5 min)"** est directement accessible en haut à droite de l'application avec un chronomètre intégré et un bouton d'action pour chaque étape :

1. **00:00 - 00:30** : Présenter le positionnement souverain de QARVYEN 2.0.
2. **00:30 - 00:50** : Sélectionner la *Vallée du Fleuve Sénégal (Podor/Matam)*.
3. **00:50 - 01:15** : Examiner le catalogue réel Sentinel-1 C-SAR IW GRD Copernicus.
4. **01:15 - 01:35** : Valider le couple avant (20 sept) et pic de crue (18 oct).
5. **01:35 - 02:00** : Cliquer sur **"Lancer le Traitement SAR & Détection"**.
6. **02:00 - 02:30** : Explorer la carte Leaflet (masque d'eau, inspecteur de pixel à -5.8 dB, hôpitaux menacés).
7. **02:30 - 03:00** : Déplacer le curseur temporel de simulation à **T+12h** (propagation de la crue).
8. **03:00 - 03:30** : Passer sur l'onglet **Multi-Agents IA** pour voir la synthèse d'explication.
9. **03:30 - 04:00** : Ouvrir l'onglet **Doctrine & RAG** pour observer les sources exactes citées.
10. **04:00 - 04:20** : Cliquer sur **Audit SHA-256** et lancer **"Vérifier l'Intégrité de la Chaîne"**.
11. **04:20 - 04:45** : Cliquer sur **Santé & Crise Hospitalière**, lancer **"Simuler Surcharge"** et observer le plan de réallocation de patients.
12. **04:45 - 05:00** : Conclure sur l'unicité du Core réutilisable sans friction pour tout nouveau secteur souverain.

---

## 🔬 Limites Connues & Prochaines Évolutions
- **Bande L (ALOS-PALSAR / NISAR) :** Intégration future de la bande L pour une meilleure pénétration sous couvert forestier dense.
- **Modèle d'Embeddings GPU On-Premise :** Connexion directe avec `bge-m3` ou `nomic-embed-text` via ONNX Runtime local.
- **Jumeau Numérique 3D :** Support complémentaire de tuiles 3D MapLibre/Deck.gl pour les corridors urbains denses.
