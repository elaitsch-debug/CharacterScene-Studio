import React, { useState } from 'react';
import { GeneratedContent, Character } from '../types';
import { Loader } from './common/Loader';
import { SceneIcon } from '../constants';

interface CanvasProps {
  isLoading: boolean;
  loadingMessage: string;
  generatedContent: GeneratedContent | null;
  error: string | null;
  selectedCharacters: Character[];
  onCharacterReorder: (reorderedCharacters: Character[]) => void;
}

const LayerManager: React.FC<{ 
  characters: Character[]; 
  onReorder: (reordered: Character[]) => void;
}> = ({ characters, onReorder }) => {
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        setDraggedItemId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
        e.preventDefault();
        if (!draggedItemId || draggedItemId === targetId) return;

        // The UI list is reversed, so we operate on a reversed copy
        const currentCharacters = [...characters].reverse();
        const draggedIndex = currentCharacters.findIndex(c => c.id === draggedItemId);
        const targetIndex = currentCharacters.findIndex(c => c.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const reordered = [...currentCharacters];
        const [draggedItem] = reordered.splice(draggedIndex, 1);
        reordered.splice(targetIndex, 0, draggedItem);
        
        // Reverse it back to the original order (back-to-front) before calling onReorder
        onReorder(reordered.reverse());
        setDraggedItemId(null);
    };
    
    const handleDragEnd = () => {
        setDraggedItemId(null);
    };

    if (characters.length <= 1) {
        return null;
    }

    return (
        <div className="absolute bottom-4 right-4 bg-gray-800/80 backdrop-blur-md border border-gray-600 rounded-lg p-3 shadow-lg z-10 w-48">
            <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Layers (Top to Bottom)</h4>
            <div className="space-y-2">
                {[...characters].reverse().map(char => (
                    <div
                        key={char.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, char.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, char.id)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-2 p-2 rounded-md cursor-grab transition-all ${draggedItemId === char.id ? 'opacity-50 bg-indigo-500 scale-105' : 'bg-gray-700/50 hover:bg-gray-600/50'}`}
                    >
                        <img src={char.imageUrl} alt={char.name} className="w-8 h-8 rounded object-cover" />
                        <span className="text-sm font-medium text-white truncate">{char.name}</span>
                    </div>
                ))}
            </div>
             <p className="text-xs text-gray-500 mt-2 text-center">Drag to reorder layers.</p>
        </div>
    );
};


export const Canvas: React.FC<CanvasProps> = ({ isLoading, loadingMessage, generatedContent, error, selectedCharacters, onCharacterReorder }) => {
  const renderContent = () => {
    if (isLoading) {
      return <Loader message={loadingMessage} />;
    }
    if (error) {
      return (
        <div className="text-center text-red-400 bg-red-900/50 p-6 rounded-lg">
          <h3 className="font-bold text-lg mb-2">An Error Occurred</h3>
          <p>{error}</p>
        </div>
      );
    }
    if (generatedContent) {
      if (generatedContent.type === 'image') {
        return <img src={generatedContent.url} alt="Generated content" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />;
      }
      if (generatedContent.type === 'video') {
        return <video src={generatedContent.url} controls autoPlay loop className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />;
      }
    }
    return (
      <div className="text-center text-gray-500 flex flex-col items-center gap-4">
        <SceneIcon className="w-24 h-24 text-gray-700" />
        <h2 className="text-2xl font-bold">Your Scene Awaits</h2>
        <p>Use the controls on the right to build your masterpiece.</p>
      </div>
    );
  };

  return (
    <main className="relative flex-grow p-6 flex items-center justify-center bg-gray-900/70">
      <div className="w-full h-full flex items-center justify-center">
        {renderContent()}
      </div>
      <LayerManager characters={selectedCharacters} onReorder={onCharacterReorder} />
    </main>
  );
};