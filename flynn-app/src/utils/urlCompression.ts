import pako from 'pako';

/**
 * Compress a configuration object to a Base64 string
 */
export function compressConfig(config: any): string {
  try {
    // 1. Serialize to JSON
    const jsonString = JSON.stringify(config);
    
    // 2. Compress with gzip
    const compressed = pako.gzip(jsonString);
    
    // 3. Encode to Base64
    const base64 = btoa(String.fromCharCode(...compressed));
    
    return base64;
  } catch (error) {
    console.error('Error compressing config:', error);
    throw new Error('Failed to compress configuration');
  }
}

/**
 * Decompress a Base64 string back to a configuration object
 */
export function decompressConfig(compressedString: string): any {
  try {
    // 1. Decode from Base64
    const binaryString = atob(compressedString);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // 2. Decompress with gzip
    const decompressed = pako.ungzip(bytes, { to: 'string' });
    
    // 3. Parse JSON
    const config = JSON.parse(decompressed);
    
    return config;
  } catch (error) {
    console.error('Error decompressing config:', error);
    throw new Error('Failed to decompress configuration');
  }
}

/**
 * Create a compressed share URL
 */
export function createCompressedShareUrl(config: any, origin: string): string {
  const compressed = compressConfig(config);
  return `${origin}/view?c=${encodeURIComponent(compressed)}`;
}

/**
 * Extract configuration from a compressed URL parameter
 */
export function extractConfigFromUrl(searchParams: URLSearchParams): any | null {
  const compressedParam = searchParams.get('c');
  if (!compressedParam) {
    return null;
  }
  
  try {
    return decompressConfig(decodeURIComponent(compressedParam));
  } catch (error) {
    console.error('Failed to extract config from URL:', error);
    return null;
  }
}