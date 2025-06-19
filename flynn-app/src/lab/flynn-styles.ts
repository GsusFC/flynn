export const flynnStyles = `
  .flynn-slider {
    -webkit-appearance: none;
    appearance: none;
    height: 8px;
    background: #404040;
    border-radius: 4px;
    outline: none;
    transition: background 0.2s;
  }
  
  .flynn-slider:hover {
    background: #4a4a4a;
  }
  
  .flynn-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: #10b981;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .flynn-slider::-webkit-slider-thumb:hover {
    background: #059669;
  }
  
  .flynn-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #10b981;
    border-radius: 50%;
    cursor: pointer;
    border: none;
    transition: background 0.2s;
  }
  
  .flynn-slider::-moz-range-thumb:hover {
    background: #059669;
  }
  
  .flynn-select {
    width: 100%;
    padding: 0.5rem;
    background-color: #171717;
    border: 1px solid #404040;
    border-radius: 0.375rem;
    color: #e5e5e5;
    font-size: 0.875rem;
    font-family: 'Geist Mono', monospace;
  }
  
  .flynn-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .flynn-panel {
    background: #171717;
    border: 1px solid #404040;
    border-radius: 8px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
  }
  
  .flynn-section-title {
    font-size: 1rem;
    font-weight: 600;
    color: #f5f5f5;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #404040;
    font-family: 'Geist Mono', monospace;
  }
  
  .flynn-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #e5e5e5;
    font-family: 'Geist Mono', monospace;
  }
  
  .flynn-value {
    color: white;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    font-size: 13px;
    font-weight: 500;
  }

  /* Dark theme overrides for better lab aesthetics */
  body {
    background-color: #000000;
  }
  
  /* Small tabs for Flynn Lab panels */
  .flynn-tabs-small {
    font-size: 11px !important;
  }

  /* Intelligent Presets Panel specific styles */
  .intelligent-presets-tabs button {
    font-size: 10px !important;
    line-height: 1.2 !important;
  }
  
  .intelligent-presets-tabs button.active {
    font-weight: 600 !important;
  }
  
  .intelligent-preset-item h4 {
    font-size: 12px !important;
  }
  
  .intelligent-preset-item p {
    font-size: 10px !important;
    line-height: 1.3 !important;
  }

  /* Override any framework defaults for intelligent presets */
  [data-intelligent-presets] button {
    font-size: 10px !important;
  }
  
  [data-intelligent-presets] input {
    font-size: 12px !important;
  }
`; 