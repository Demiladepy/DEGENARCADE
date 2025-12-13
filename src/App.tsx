import { useState } from 'react';
import PhysicsScene from "./PhysicsScene"; // Renamed Coin Flip
import { Dashboard } from "./components/Dashboard";
import { SportsInterface } from "./components/SportsInterface";
import { ReferralDashboard } from "./components/ReferralDashboard";
import { Button } from "@radix-ui/themes";
import PlinkoScene from "./components/PlinkoScene";

function App() {
  const [mode, setMode] = useState<'dashboard' | 'coin' | 'sports' | 'plinko' | 'referral'>('dashboard');

  if (mode === 'dashboard') {
    return <Dashboard setMode={(m) => setMode(m as any)} />;
  }

  if (mode === 'coin') {
    return (
      <>
        <Button
          variant="ghost"
          onClick={() => setMode('dashboard')}
          style={{ position: 'absolute', top: 20, left: 20, zIndex: 200, color: 'white' }}
        >
          ← DASHBOARD
        </Button>
        <PhysicsScene />
      </>
    );
  }

  if (mode === 'sports') {
    return <SportsInterface onBack={() => setMode('dashboard')} />;
  }

  if (mode === 'plinko') {
    return (
      <PlinkoScene onBack={() => setMode('dashboard')} />
    );
  }

  if (mode === 'referral') {
    return (
      <>
        <Button
          variant="ghost"
          onClick={() => setMode('dashboard')}
          style={{ position: 'absolute', top: 20, left: 20, zIndex: 200, color: 'white' }}
        >
          ← DASHBOARD
        </Button>
        <ReferralDashboard />
      </>
    );
  }

  return <div>Error</div>;
}

export default App;
