
import React from 'react';
import { Character } from '../types';
import { Button } from './common/Button';
import { AddUserIcon } from '../constants';

interface SidebarProps {
  characters: Character[];
  selectedCharacterIds: string[];
  onCharacterSelect: (id: string) => void;
  onAddCharacterClick: () => void;
}

const CharacterCard: React.FC<{
  character: Character;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ character, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
        isSelected ? 'border-indigo-500 scale-105' : 'border-transparent hover:border-indigo-600'
      }`}
    >
      <img src={character.imageUrl} alt={character.name} className="w-full h-auto aspect-square object-cover" />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
        <p className="text-white font-semibold text-sm truncate">{character.name}</p>
      </div>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ characters, selectedCharacterIds, onCharacterSelect, onAddCharacterClick }) => {
  return (
    <aside className="w-64 bg-gray-800/50 p-4 flex flex-col border-r border-gray-700">
      <h2 className="text-lg font-semibold mb-4">Character Library</h2>
      <Button onClick={onAddCharacterClick} className="mb-4">
        <AddUserIcon className="w-5 h-5" />
        New Character
      </Button>
      <div className="flex-grow overflow-y-auto pr-2">
        {characters.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p>Your library is empty.</p>
            <p className="text-sm">Create a new character to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {characters.map(char => (
              <CharacterCard
                key={char.id}
                character={char}
                isSelected={selectedCharacterIds.includes(char.id)}
                onSelect={() => onCharacterSelect(char.id)}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
