# Workflow Détaillé : Détection des Inondations par Sentinel-1 SAR (C-Band)

## 1. Principes Physiques du Radar SAR pour l'Eau Libre
Le capteur Sentinel-1 C-SAR (5.405 GHz) émet des micro-ondes actives.
Sur une surface terrestre rugueuse (sol agricole, végétation), la rétrodiffusion est diffuse avec un coefficient $\sigma^0$ typiquement compris entre **-12 dB et -8 dB**.
Sur de l'eau libre (nappe d'inondation), l'onde incidente subit une **réflexion spéculaire** dirigée à l'opposé du récepteur radar :
le signal de retour chute drastiquement, atteignant typiquement **-20 dB à -16 dB** sur la polarisation VV.

## 2. Étapes du Traitement Radiométrique
1. **Calibration Radiométrique :** Conversion des Digital Numbers (DN) en coefficient de rétrodiffusion calibré $\sigma^0$ ou $\gamma^0$.
2. **Filtrage de Speckle :** Application du filtre de Lee (fenêtre 5x5 ou 7x7) pour réduire le bruit de grenaille sans détruire les contours des berges.
3. **Différentiel Logarithmique (Log-Ratio) :**
   $$\Delta \sigma^0_{\text{dB}} = \sigma^0_{\text{post}} - \sigma^0_{\text{pre}} = 10 \cdot \log_{10}\left(\frac{\sigma^0_{\text{post}}}{\sigma^0_{\text{pre}}}\right)$$
4. **Seuillage Bimodal (Otsu / Seuil Fixe) :**
   Une chute $\Delta \sigma^0 < -4.5 \text{ dB}$ ou un niveau absolu $\sigma^0_{\text{post}} < -15.5 \text{ dB}$ qualifie la cellule comme submergée.
5. **Masquage Topographique (DEM 30m) :**
   Exclusion des pentes supérieures à 8° pour éviter les faux positifs causés par les ombres radar sur les versants montagneux.
6. **Filtrage Morphologique :**
   Suppression des îlots d'eau inférieurs à 2 hectares (bruit résiduel).

## 3. Données Réelles vs Données Synthétiques
QARVYEN 2.0 distingue formellement les scènes authentiques issues du catalogue Copernicus Data Space Ecosystem (CDSE) des données de calibration synthétiques.
Le badge d'intégrité garantit que chaque acquisition est horodatée avec son identifiant officiel ESA (ex: `S1A_IW_GRDH_1SDV_20241018T184512_056102_06DCFC_81A4`).
