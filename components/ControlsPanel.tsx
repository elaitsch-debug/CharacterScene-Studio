
import React, { useState, useCallback } from 'react';
import { AspectRatio, Character, ToolType } from '../types';
import { Button } from './common/Button';
import { generateScene, editImage, generateVideo } from '../services/geminiService';
import { ApiKeySelector } from './ApiKeySelector';

interface ControlsPanelProps {
  activeTool: ToolType;
  selectedCharacters: Character[];
  setLoading: (isLoading: boolean, message: string) => void;
  setError: (error: string | null) => void;
  onGenerationComplete: (content: { type: 'image' | 'video'; url: string }) => void;
}

const SceneBuilder: React.FC<Omit<ControlsPanelProps, 'activeTool'>> = ({ selectedCharacters, setLoading, setError, onGenerationComplete }) => {
  const [prompt, setPrompt] = useState('Two characters having a picnic in a sunny park.');
  
  const handleGenerate = useCallback(async () => {
    if (selectedCharacters.length === 0) {
      setError("Please select at least one character from the library.");
      return;
    }
    setLoading(true, "Building your scene...");
    setError(null);
    try {
      const imageUrl = await generateScene(selectedCharacters, prompt);
      onGenerationComplete({ type: 'image', url: imageUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate scene.");
    } finally {
      setLoading(false, "");
    }
  }, [selectedCharacters, prompt, setLoading, setError, onGenerationComplete]);

  return (
    <div>
      <h3 className="font-bold text-lg mb-4">Scene Builder</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Selected Characters</label>
          <div className="bg-gray-800 p-2 rounded-md min-h-[40px] flex flex-wrap gap-2">
            {selectedCharacters.length > 0 ? selectedCharacters.map(c => (
              <span key={c.id} className="bg-indigo-600 text-white px-2 py-1 text-sm rounded">{c.name}</span>
            )) : <p className="text-gray-500 text-sm">Select from library</p>}
          </div>
        </div>
        <div>
          <label htmlFor="scene-prompt" className="block text-sm font-medium text-gray-300 mb-1">Scene Prompt</label>
          <textarea
            id="scene-prompt"
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., A wizard teaching a young apprentice in a mystical library..."
          />
        </div>
        <Button onClick={handleGenerate} disabled={selectedCharacters.length === 0} className="w-full">Generate Scene</Button>
      </div>
    </div>
  );
};

const ImageEditor: React.FC<Omit<ControlsPanelProps, 'activeTool' | 'selectedCharacters'>> = ({ setLoading, setError, onGenerationComplete }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('Add a retro, vintage filter.');

  const handleGenerate = useCallback(async () => {
    if (!imageFile) {
      setError("Please upload an image to edit.");
      return;
    }
    setLoading(true, "Applying your edits...");
    setError(null);
    try {
      const imageUrl = await editImage(imageFile, prompt);
      onGenerationComplete({ type: 'image', url: imageUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to edit image.");
    } finally {
      setLoading(false, "");
    }
  }, [imageFile, prompt, setLoading, setError, onGenerationComplete]);

  return (
    <div>
      <h3 className="font-bold text-lg mb-4">Image Editor</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-1">Upload Image</label>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600"
          />
        </div>
        <div>
          <label htmlFor="edit-prompt" className="block text-sm font-medium text-gray-300 mb-1">Edit Prompt</label>
          <input
            id="edit-prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"
            placeholder="e.g., Add a futuristic helmet"
          />
        </div>
        <Button onClick={handleGenerate} disabled={!imageFile} className="w-full">Generate Edit</Button>
      </div>
    </div>
  );
};

const VideoGenerator: React.FC<Omit<ControlsPanelProps, 'activeTool' | 'selectedCharacters'>> = ({ setLoading, setError, onGenerationComplete }) => {
    const [isKeySelected, setIsKeySelected] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState('A neon hologram of a cat driving at top speed');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');

    const handleGenerate = useCallback(async () => {
        if (!imageFile) {
            setError("Please upload a starting image for the video.");
            return;
        }
        setError(null);
        try {
            const videoUrl = await generateVideo(imageFile, prompt, aspectRatio, (msg) => setLoading(true, msg));
            onGenerationComplete({ type: 'video', url: videoUrl });
        } catch (err) {
            if (err instanceof Error && err.message.includes('Requested entity was not found')) {
                setError("API Key error. Please re-select your key.");
                setIsKeySelected(false);
            } else {
                setError(err instanceof Error ? err.message : "Failed to generate video.");
            }
        } finally {
            setLoading(false, "");
        }
    }, [imageFile, prompt, aspectRatio, setLoading, setError, onGenerationComplete]);

    if (!isKeySelected) {
        return <ApiKeySelector onKeySelected={() => setIsKeySelected(true)} />;
    }

    return (
        <div>
            <h3 className="font-bold text-lg mb-4">Video Generator</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="video-image-upload" className="block text-sm font-medium text-gray-300 mb-1">Starting Image</label>
                    <input type="file" id="video-image-upload" accept="image/*" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600" />
                </div>
                <div>
                    <label htmlFor="video-prompt" className="block text-sm font-medium text-gray-300 mb-1">Video Prompt</label>
                    <textarea id="video-prompt" rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Aspect Ratio</label>
                    <div className="flex gap-2">
                        {(['16:9', '9:16'] as AspectRatio[]).map(ratio => (
                            <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`px-3 py-1.5 rounded-md text-sm ${aspectRatio === ratio ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                {ratio} {ratio === '16:9' ? '(Landscape)' : '(Portrait)'}
                            </button>
                        ))}
                    </div>
                </div>
                <Button onClick={handleGenerate} disabled={!imageFile} className="w-full">Generate Video</Button>
            </div>
        </div>
    );
};


export const ControlsPanel: React.FC<ControlsPanelProps> = (props) => {
  const renderControls = () => {
    switch (props.activeTool) {
      case 'SCENE_BUILDER':
        return <SceneBuilder {...props} />;
      case 'IMAGE_EDITOR':
        return <ImageEditor {...props} />;
      case 'VIDEO_GENERATOR':
        return <VideoGenerator {...props} />;
      default:
        return null;
    }
  };

  return (
    <aside className="w-80 bg-gray-800/50 p-4 border-l border-gray-700 overflow-y-auto">
      {renderControls()}
    </aside>
  );
};
