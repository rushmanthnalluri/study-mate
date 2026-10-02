import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Copy, Check, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MermaidViewerProps {
  code: string;
  title?: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'strict',
  fontFamily: 'Inter, system-ui, sans-serif',
  themeVariables: {
    primaryColor: '#fbebed',
    primaryTextColor: '#831d32',
    primaryBorderColor: '#b4374f',
    lineColor: '#691829',
    secondaryColor: '#f5f3f0',
    tertiaryColor: '#ffffff'
  }
});

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ code, title = "Process Architecture & Flowchart" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgUrl, setSvgUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1);
  const [renderError, setRenderError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const renderDiagram = async () => {
      try {
        setRenderError(false);
        const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, code);
        if (isMounted) {
          const blob = new Blob([svg], { type: 'image/svg+xml' });
          const nextUrl = URL.createObjectURL(blob);
          setSvgUrl(previous => {
            if (previous) URL.revokeObjectURL(previous);
            return nextUrl;
          });
        }
      } catch (err) {
        console.warn('Mermaid rendering issue, using styled fallback:', err);
        if (isMounted) {
          setRenderError(true);
        }
      }
    };

    if (code) {
      renderDiagram();
    }

    return () => {
      isMounted = false;
      setSvgUrl(previous => {
        if (previous) URL.revokeObjectURL(previous);
        return '';
      });
    };
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const zoomIn = () => setScale(s => Math.min(s + 0.2, 1.8));
  const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.6));
  const resetZoom = () => setScale(1);

  return (
    <div className="bg-white border border-surface-border rounded-xl shadow-mobile-card overflow-hidden my-4">
      {/* Diagram header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-subtle border-b border-surface-border">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-800"></span>
          <span className="text-xs font-semibold text-surface-dark uppercase tracking-wider font-condensed">
            {title}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={zoomOut}
            title="Zoom Out"
            aria-label="Zoom out diagram"
            className="p-1 rounded text-surface-muted hover:text-surface-dark hover:bg-white transition-colors"
          >
            <ZoomOut size={15} />
          </button>
          <button
            onClick={resetZoom}
            title="Reset Zoom"
            aria-label="Reset diagram zoom"
            className="p-1 rounded text-surface-muted hover:text-surface-dark hover:bg-white transition-colors text-xs font-mono"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={zoomIn}
            title="Zoom In"
            aria-label="Zoom in diagram"
            className="p-1 rounded text-surface-muted hover:text-surface-dark hover:bg-white transition-colors"
          >
            <ZoomIn size={15} />
          </button>
          <div className="h-4 w-px bg-surface-border mx-1"></div>
          <button
            onClick={handleCopy}
            title="Copy Diagram Code"
            className="flex items-center space-x-1 px-2 py-1 text-xs text-brand-800 hover:bg-brand-50 rounded transition-colors font-medium"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Render Area */}
      <div className="p-4 overflow-x-auto min-h-[160px] flex items-center justify-center bg-surface">
        {!renderError && svgUrl ? (
          <div
            ref={containerRef}
            className="transition-transform duration-150 origin-center max-w-full"
            style={{ transform: `scale(${scale})` }}
          >
            <img
              src={svgUrl}
              alt={title}
              className="max-w-full h-auto"
              draggable={false}
            />
          </div>
        ) : (
          <div className="w-full text-left font-mono text-xs p-3 bg-stone-900 text-stone-100 rounded-lg overflow-x-auto">
            <div className="text-amber-400 font-sans font-semibold mb-2">Process / Architecture Flow:</div>
            <pre className="whitespace-pre-wrap">{code}</pre>
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-surface text-center border-t border-surface-border/60">
        <p className="text-[11px] text-surface-muted italic">
          💡 KL Exam Tip: Drawing this clean labeled flowchart secures the mandatory 2 marks reserved for diagrams.
        </p>
      </div>
    </div>
  );
};
