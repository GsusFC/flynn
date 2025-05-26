declare module 'gif.js' {
  interface GIFOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    background?: string;
    dither?: boolean;
    repeat?: number;
    globalPalette?: boolean;
  }

  interface GIFFrame {
    delay?: number;
  }

  class GIF {
    constructor(options: GIFOptions);
    addFrame(canvas: HTMLCanvasElement, options?: GIFFrame): void;
    on(event: 'finished', callback: (blob: Blob) => void): void;
    on(event: 'progress', callback: (progress: number) => void): void;
    render(): void;
  }

  export = GIF;
}
