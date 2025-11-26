import React, { useState, useCallback } from 'react';
import { Character, ToolType, GeneratedContent } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { ControlsPanel } from './components/ControlsPanel';
import { CharacterCreatorModal } from './components/CharacterCreatorModal';

function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeTool, setActiveTool] = useState<ToolType>('SCENE_BUILDER');
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);

  const handleSetLoading = useCallback((loading: boolean, message: string) => {
    setIsLoading(loading);
    setLoadingMessage(message);
  }, []);

  const handleGenerationComplete = useCallback((content: GeneratedContent) => {
    setGeneratedContent(content);
    setError(null);
  }, []);

  const handleCharacterSelect = (id: string) => {
    setSelectedCharacterIds(prev =>
      prev.includes(id) 
        ? prev.filter(charId => charId !== id) 
        : [...prev, id] // Add new selections to the end (top layer)
    );
  };

  const handleCharacterReorder = useCallback((reorderedCharacters: Character[]) => {
    const newIds = reorderedCharacters.map(c => c.id);
    setSelectedCharacterIds(newIds);
  }, []);

  const handleSaveCharacter = (character: Character) => {
    setCharacters(prev => [...prev, character]);
    setIsCreatorModalOpen(false);
  };
  
  // The order of selectedCharacterIds determines the layer order (index 0 is the back).
  // This logic preserves that order when creating the selectedCharacters array.
  const selectedCharacters = selectedCharacterIds
    .map(id => characters.find(c => c.id === id))
    .filter((c): c is Character => c !== undefined);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900">
      <Header activeTool={activeTool} setActiveTool={setActiveTool} />
      <div className="flex flex-grow overflow-hidden">
        <Sidebar
          characters={characters}
          selectedCharacterIds={selectedCharacterIds}
          onCharacterSelect={handleCharacterSelect}
          onAddCharacterClick={() => setIsCreatorModalOpen(true)}
        />
        <Canvas
          isLoading={isLoading}
          loadingMessage={loadingMessage}
          generatedContent={generatedContent}
          error={error}
          selectedCharacters={selectedCharacters}
          onCharacterReorder={handleCharacterReorder}
        />
        <ControlsPanel
          activeTool={activeTool}
          selectedCharacters={selectedCharacters}
          setLoading={handleSetLoading}
          setError={setError}
          onGenerationComplete={handleGenerationComplete}
        />
      </div>
      {isCreatorModalOpen && (
        <CharacterCreatorModal 
          onClose={() => setIsCreatorModalOpen(false)}
          onSave={handleSaveCharacter}
        />
      )}
    </div>
  );
}

export default App;