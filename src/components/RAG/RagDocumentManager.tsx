/**
 * QARVYEN 2.0 — Sovereign RAG Knowledge & Document Manager
 * Priority 4: PDF, TXT & Markdown Ingestion, Semantic Indexing,
 * Vector Search & Strict Provenance Tracking.
 */

import React, { useState } from 'react';
import { sovereignRag } from '../../services/ragService';
import {
  RagDocument,
  RagChunk,
  RagSourceCitation,
  UserProfile,
  SecurityClearance
} from '../../types/qarvyen';
import {
  FileText,
  Upload,
  Search,
  BookOpen,
  Shield,
  Layers,
  CheckCircle2,
  Lock,
  Plus
} from 'lucide-react';

interface RagDocumentManagerProps {
  currentUser: UserProfile;
}

export const RagDocumentManager: React.FC<RagDocumentManagerProps> = ({ currentUser }) => {
  const [documents, setDocuments] = useState<RagDocument[]>(sovereignRag.getDocuments());
  const [searchQuery, setSearchQuery] = useState('Directive Inondation et seuil de rétrodiffusion radar Sentinel-1');
  const [searchResults, setSearchResults] = useState<RagSourceCitation[]>(() =>
    sovereignRag.search('Directive Inondation et seuil de rétrodiffusion radar Sentinel-1', 4)
  );

  // New Document Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<RagDocument['category']>('technical_manual');
  const [newClassification, setNewClassification] = useState<SecurityClearance>('DIFFUSION_RESTREINTE');
  const [newContent, setNewContent] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const results = sovereignRag.search(searchQuery, 4);
    setSearchResults(results);
  };

  const handleImportDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const doc = sovereignRag.addDocument(
      newTitle,
      `${newTitle.toLowerCase().replace(/\s+/g, '_')}.md`,
      newContent,
      'text/markdown',
      newCategory,
      newClassification
    );

    setDocuments(sovereignRag.getDocuments());
    setNewTitle('');
    setNewContent('');
    setIsUploading(false);

    // Refresh search
    setSearchResults(sovereignRag.search(searchQuery, 4));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-mono uppercase text-sky-300 font-bold">
              MOTEUR RAG SOUVERAIN EN ENCLAVE LOCALE
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Base de Connaissances, Textes Doctrিনaux & Indexation Sémantique
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
            Indexation vectorielle et lexicale (TF-IDF / Embeddings) assurant l'ancrage inviolable des raisonnements IA dans le corpus légal et technique.
          </p>
        </div>

        <button
          onClick={() => setIsUploading(!isUploading)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-950/50 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Importer une Doctrine (PDF / TXT / MD)
        </button>
      </div>

      {/* Upload Form Modal / Panel */}
      {isUploading && (
        <form onSubmit={handleImportDocument} className="bg-slate-900 border border-sky-800/80 p-5 rounded-xl space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-sky-400" />
              Ingestion Documentaire dans l'Index RAG
            </h3>
            <button
              type="button"
              onClick={() => setIsUploading(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Annuler
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Titre de la Doctrine</label>
              <input
                type="text"
                required
                placeholder="Ex: Protocole Inondation Région Nord 2024"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Catégorie</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
              >
                <option value="doctrine">Doctrine de Sécurité Civile</option>
                <option value="legal">Directive Légale / Cadre EU</option>
                <option value="technical_manual">Manuel Technique Radar SAR</option>
                <option value="local_risk_plan">Plan de Prévention Territorial (PPRI)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Niveau d'Habilitation</label>
              <select
                value={newClassification}
                onChange={e => setNewClassification(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
              >
                <option value="PUBLIC">PUBLIC</option>
                <option value="DIFFUSION_RESTREINTE">DIFFUSION RESTREINTE</option>
                <option value="CONFIDENTIEL_DEFENSE">CONFIDENTIEL DÉFENSE</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block text-xs mb-1">Contenu Textuel ou Markdown</label>
            <textarea
              required
              rows={4}
              placeholder="Collez ici le texte de la doctrine, les seuils hydrologiques, les instructions d'évacuation ou le manuel d'exploitation..."
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-xs font-mono focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer"
            >
              Indexer & Découper en Chunks Vectoriels
            </button>
          </div>
        </form>
      )}

      {/* Semantic Search Sandbox */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
          <Search className="w-4 h-4 text-cyan-400" />
          Testeur de Recherche Sémantique & Traçabilité des Provenances
        </h3>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Posez une question doctrinale ou un paramètre technique..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            Rechercher
          </button>
        </form>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {searchResults.map((res, i) => (
            <div key={i} className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-sky-300 font-semibold truncate max-w-[240px]">
                  {res.documentTitle}
                </span>
                <span className="text-emerald-400 text-[10px] font-bold">
                  Score : {res.relevanceScore}%
                </span>
              </div>
              <p className="text-[11px] text-slate-300 italic bg-slate-900/80 p-2 rounded border border-slate-800/80">
                "{res.excerpt}"
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Page : {res.page || 1}</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {res.classification}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indexed Documents Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            Doctrines et Corpus Juridique Indexés ({documents.length})
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Enclave Chiffrée AES-256</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 text-[11px] uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Habilitation</th>
                <th className="px-4 py-3">Chunks</th>
                <th className="px-4 py-3">Taille</th>
                <th className="px-4 py-3">Statut Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {documents.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      {doc.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">{doc.summary}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {doc.category}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-800 text-amber-300">
                      {doc.classification}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cyan-400 font-bold">
                    {doc.chunksCount} chunks
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {(doc.sizeBytes / 1024).toFixed(1)} KB
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      INDEXÉ
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
