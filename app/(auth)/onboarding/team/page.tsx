'use client';

import { CreateTeamCard } from '@/components/cards/CreateTeamCard';
import { JoinTeamCard } from '@/components/cards/JoinTeamCard';
import { useState } from 'react';

type SelectedOption = 'create' | 'join' | null;

export default function Page() {
  const [selectedOption, setSelectedOption] = useState<SelectedOption>(null);

  const handleReset = () => setSelectedOption(null);

  return (
<>
  
    <div className="mb-8">
      <h2 className="text-white/95 text-2xl tracking-tight mb-2">
        Choose how you want to get started
      </h2>
      <p className="text-white/40">
        Create a team or join an existing workspace.
      </p>
    </div>

    <div className="transition-all duration-500">
        <CreateTeamCard 
            isSelected={selectedOption === 'create'}
            isOtherSelected={selectedOption === 'join'}
            onSelect={() => setSelectedOption('create')}
            onReset={handleReset}
        />
        
        <JoinTeamCard 
            isSelected={selectedOption === 'join'}
            isOtherSelected={selectedOption === 'create'}
            onSelect={() => setSelectedOption('join')}
            onReset={handleReset}
        />
    </div>
    </>
  );
} 