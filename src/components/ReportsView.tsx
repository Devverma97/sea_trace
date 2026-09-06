import React, { useState } from 'react';
import {
  Incident,
  SlickDetection,
  DriftRun,
  CandidateSuspect,
  MarineWeather,
} from '../types';
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  CheckCircle2,
  AlertOctagon,
  Printer,
  ShieldAlert,
  Loader2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ReportsViewProps {
  incident: Incident;
  detection: SlickDetection;
  candidates: CandidateSuspect[];
  backwardRun: DriftRun | null;
  marineWeather: MarineWeather | null;
  selectedCandidateForReport?: CandidateSuspect | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  incident,
  detection,
  candidates,
  backwardRun,
  marineWeather,
  selectedCandidateForReport,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportText, setReportText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const prime = selectedCandidateForReport || candidates[0];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/gemini/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident,
          detection,
          backwardRun,
          candidates,
          marineWeather,
          targetSuspect: prime,
        }),
      });

      const data = await response.json();
      if (data.report) {
        setReportText(data.report);
      } else {
        setReportText(
          '### Legal Evidence Dossier Generation Failed\n\nPlease verify your Gemini API connection.'
        );
      }
    } catch (err: any) {
      console.error(err);
      setReportText(
        `### Error Calling Gemini AI Service\n\n${err.message || 'Network request failed'}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!reportText) return;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!reportText) return;
    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SeaTrace_Legal_Dossier_${incident.name.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">AI Legal Evidence Dossier & Audit Reports</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                GEMINI 2.5 FLASH POWERED
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Autonomous synthesis of satellite SAR radargrammetry, OpenDrift particle mechanics, and AIS transponder forensics
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {reportText && (
            <>
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold border border-gray-200 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold border border-gray-200 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Markdown</span>
              </button>
            </>
          )}

          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            <span>{isGenerating ? 'Synthesizing Dossier...' : 'Synthesize Legal Dossier'}</span>
          </button>
        </div>
      </div>

      {/* Model & Source Context Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Intelligence Source:</span>
          <span className="font-semibold text-gray-800">Google Gemini 2.5 Flash</span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-500">
            Incident: <strong className="text-gray-900">{incident.name}</strong>
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-500">
            Target Vessel: <strong className="text-rose-600">{prime?.vessel.name || 'N/A'}</strong>
          </span>
        </div>

        <div className="text-[11px] text-gray-500">
          Standard: <span className="font-semibold text-gray-800">IMO Resolution MEPC.117(52) & MARPOL Annex I</span>
        </div>
      </div>

      {/* Main Report Document Container (Paper style) */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm space-y-6 text-gray-800 font-sans leading-relaxed">
        {reportText ? (
          <div className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight prose-a:text-indigo-600 prose-code:text-indigo-700 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-strong:text-gray-900">
            <ReactMarkdown>{reportText}</ReactMarkdown>
          </div>
        ) : (
          <div className="py-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto shadow-xs">
              <BookOpen className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900">Legal Evidence Dossier Ready for Synthesis</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Click <strong>"Synthesize Legal Dossier"</strong> above. Gemini will cross-correlate the Sentinel-1 SAR slick
                footprint, the OpenDrift Runge-Kutta backtracked release ellipse, and the AIS speed and blackout profiles of{' '}
                <strong>{prime?.vessel.name}</strong> to produce a formal MARPOL Annex I violation audit.
              </p>
            </div>

            {/* Preview of Key Intercept Metrics */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-left text-xs space-y-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Evidence Package Summary:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-700 font-mono">
                <div>• Slick Area: <strong className="text-gray-900">{detection.spillAreaKm2} km²</strong></div>
                <div>• SAR Dampening: <strong className="text-gray-900">-14.2 dB</strong></div>
                <div>• Release Window: <strong className="text-gray-900">{backwardRun?.durationHours || 12}h prior</strong></div>
                <div>• Closest Intercept: <strong className="text-gray-900">{prime?.minDistanceToOriginKm.toFixed(1) || 0} km</strong></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
