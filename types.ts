export interface Character {
  id: string;
  name: string;
  imageUrl: string; // base64 data URL
  prompt: string;
}

export type ToolType = 'SCENE_BUILDER' | 'IMAGE_EDITOR' | 'VIDEO_GENERATOR';

export type AspectRatio = '16:9' | '9:16';

export interface GeneratedContent {
  type: 'image' | 'video';
  url: string;
}

// Fix: Removed conflicting global type declaration for window.aistudio to resolve a merge conflict.
// An ambient declaration is assumed to exist elsewhere in the project.
