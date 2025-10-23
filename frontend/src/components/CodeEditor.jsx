import React from 'react';
import { ChevronDown, Loader } from 'lucide-react';

export default function CodeEditor({
  label,
  value,
  onChange,
  language,
  onLanguageChange,
  languages,
  readOnly,
  isLoading
}) {
  return (
    <div className="code-editor">
      <div className="editor-header">
        <label>{label}</label>
        <select value={language} onChange={(e) => onLanguageChange(e.target.value)}>
          {languages.map(lang => (
            <option key={lang} value={lang.toLowerCase()}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      <div className="editor-body">
        {isLoading ? (
          <div className="editor-loading">
            <Loader className="spinner" />
            <p>Translating...</p>
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            readOnly={readOnly}
            placeholder={readOnly ? 'Translation will appear here...' : 'Paste your code here...'}
            spellCheck="false"
          />
        )}
      </div>
    </div>
  );
}