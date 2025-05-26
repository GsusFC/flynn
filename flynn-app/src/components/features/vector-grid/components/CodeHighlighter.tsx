'use client';

import React from 'react';

interface CodeHighlighterProps {
  code: string;
  language: 'svg' | 'js' | 'react';
  className?: string;
}

// Función para aplicar highlighting simple con Tailwind
const highlightCode = (code: string, language: string): string => {
  let highlighted = code;
  
  if (language === 'svg') {
    // SVG highlighting
    highlighted = highlighted
      // XML tags
      .replace(/(<\/?[\w-]+)([^>]*?)(>)/g, '<span style="color: #f87171;">$1</span><span style="color: #fbbf24;">$2</span><span style="color: #f87171;">$3</span>')
      // Atributos
      .replace(/(\w+)(=)("[^"]*")/g, '<span style="color: #a78bfa;">$1</span><span style="color: #38bdf8;">$2</span><span style="color: #4ade80;">$3</span>')
      // Comentarios
      .replace(/(<!--.*?-->)/g, '<span style="color: #64748b; font-style: italic;">$1</span>');
      
  } else if (language === 'js' || language === 'react') {
    // JavaScript/React highlighting
    highlighted = highlighted
      // Comentarios
      .replace(/(\/\/.*$)/gm, '<span style="color: #64748b; font-style: italic;">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #64748b; font-style: italic;">$1</span>')
      // Strings
      .replace(/('[^']*'|"[^"]*"|`[^`]*`)/g, '<span style="color: #4ade80;">$1</span>')
      // Keywords
      .replace(/\b(const|let|var|function|class|interface|export|import|from|return|if|else|for|while|switch|case|break|continue|async|await|try|catch|finally|throw|new|this|super|extends|implements|public|private|protected|static|readonly|typeof|instanceof)\b/g, '<span style="color: #a78bfa; font-weight: 500;">$1</span>')
      // Numbers
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color: #fb7185;">$1</span>')
      // React specific
      .replace(/\b(React|useEffect|useState|useRef|useCallback|useMemo|FC|ReactNode|HTMLCanvasElement)\b/g, '<span style="color: #38bdf8; font-weight: 500;">$1</span>')
      // Built-in objects
      .replace(/\b(console|document|window|Math|Date|JSON|Array|Object|Promise|setTimeout|setInterval|requestAnimationFrame|cancelAnimationFrame)\b/g, '<span style="color: #fbbf24;">$1</span>')
      // Canvas API
      .replace(/\b(getContext|clearRect|save|restore|translate|rotate|scale|beginPath|moveTo|lineTo|stroke|fill|fillRect|strokeRect|arc|createLinearGradient|createRadialGradient)\b/g, '<span style="color: #38bdf8;">$1</span>');
  }
  
  return highlighted;
};

export const CodeHighlighter: React.FC<CodeHighlighterProps> = ({ 
  code, 
  language, 
  className = '' 
}) => {
  const highlightedCode = highlightCode(code, language);
  const lines = code.split('\n');
  
  return (
    <div className={`font-mono text-sm leading-relaxed ${className}`}>
      <div className="flex">
        {/* Números de línea */}
        <div className="flex-shrink-0 pr-4 text-xs text-sidebar-foreground/40 text-right select-none">
          {lines.map((_, index) => (
            <div key={index} className="leading-relaxed">
              {index + 1}
            </div>
          ))}
        </div>
        
        {/* Código con highlighting */}
        <div className="flex-1 overflow-x-auto">
          <pre 
            className="whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ 
              __html: highlightedCode
            }} 
          />
        </div>
      </div>
    </div>
  );
};