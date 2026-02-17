
export enum ImageSize {
  K1 = '1K',
  K2 = '2K',
  K4 = '4K'
}

export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '4:3',
  PORTRAIT = '3:4',
  WIDE = '16:9',
  ULTRAWIDE = '9:16'
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  config: {
    size: ImageSize;
    aspectRatio: AspectRatio;
  };
}

export interface AppState {
  isGenerating: boolean;
  error: string | null;
  history: GeneratedImage[];
  selectedSize: ImageSize;
  selectedAspectRatio: AspectRatio;
  hasKey: boolean;
}
