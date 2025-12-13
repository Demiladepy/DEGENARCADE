import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, HOUSE_POOL_ID } from '../constants';
// Imports removed

import { Flex, Text, Button } from '@radix-ui/themes';

// MOCK MATCHES
const MATCHES = [
    { id: "match_1", home: "Lakers", away: "Warriors", odds: { home: 180, away: 210 }, time: "LIVE" },
    { id: "match_2", home: "Chiefs", away: "Ravens", odds: { home: 150, away: 250 }, time: "20:00" },
    { id: "match_3", home: "Real Madrid", away: "Barca", odds: { home: 200, away: 190 }, time: "TOMORROW" }
];

export const SportsInterface = ({ onBack }: { onBack: () => void }) => {
    const account = useCurrentAccount();
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();
    const [selectedMatch, setSelectedMatch] = useState<any>(null);
    const [status, setStatus] = useState("");

    const handleBet = (matchId: string, selection: string, odds: number) => {
        if (!account) return alert("Connect Wallet!");
        setStatus("Confirming...");

        const tx = new Transaction();
        const [coin] = tx.splitCoins(tx.gas, [1000000000]); // 1 SUI stake hardcoded for demo

        tx.moveCall({
            target: `${PACKAGE_ID}::sports_bet::place_bet`,
            arguments: [
                tx.object(HOUSE_POOL_ID),
                coin,
                tx.pure.string(matchId), // Vector<u8>
                tx.pure.string(selection), // Vector<u8>
                tx.pure.u64(odds),
            ]
        });

        signAndExecute({ transaction: tx }, {
            onSuccess: (res) => {
                setStatus("BET PLACED! TICKET MINTED.");
                console.log(res);
            },
            onError: (err) => {
                setStatus("FAILED");
                console.error(err);
            }
        });
    };

    return (
        <Flex style={{ height: '100vh', background: '#09090b', color: 'white' }}>
            {/* Betting Sidebar */}
            <Flex direction="column" style={{ width: 350, borderRight: '1px solid #ffffff10', padding: 20 }}>
                <Button variant="ghost" onClick={onBack} style={{ alignSelf: 'start', marginBottom: 20 }}>← Back</Button>
                <Text size="6" weight="bold" style={{ fontFamily: 'Orbitron', marginBottom: 20 }}>SPORTSBOOK</Text>

                <Flex direction="column" gap="3">
                    {MATCHES.map(m => (
                        <div
                            key={m.id}
                            onClick={() => setSelectedMatch(m)}
                            style={{
                                padding: 16,
                                background: selectedMatch === m ? '#00f3ff20' : '#ffffff05',
                                border: selectedMatch === m ? '1px solid #00f3ff' : '1px solid transparent',
                                borderRadius: 12,
                                cursor: 'pointer'
                            }}
                        >
                            <Flex justify="between" style={{ marginBottom: 8 }}>
                                <Text size="1" color="gray">{m.time}</Text>
                                <Text size="1" color="crimson" weight="bold">LIVE</Text>
                            </Flex>
                            <Flex justify="between" align="center">
                                <Text weight="bold">{m.home}</Text>
                                <Text size="2" color="gray">vs</Text>
                                <Text weight="bold">{m.away}</Text>
                            </Flex>
                        </div>
                    ))}
                </Flex>
            </Flex>

            {/* Main Betting Area */}
            <Flex direction="column" style={{ flex: 1, padding: 40, alignItems: 'center', justifyContent: 'center' }}>
                {selectedMatch ? (
                    <div style={{ width: '100%', maxWidth: 600, background: '#1a1a1a', borderRadius: 24, padding: 40, border: '1px solid #333' }}>
                        <Text size="8" weight="bold" align="center" style={{ display: 'block', marginBottom: 10 }}>{selectedMatch.home} vs {selectedMatch.away}</Text>
                        <Text align="center" color="gray" style={{ marginBottom: 40 }}>Match Winner (1 SUI Stake)</Text>

                        <Flex gap="4">
                            <button
                                onClick={() => handleBet(selectedMatch.id, "HOME", selectedMatch.odds.home)}
                                style={{ flex: 1, padding: 30, borderRadius: 16, background: '#00f3ff20', border: '2px solid #00f3ff', color: '#00f3ff', fontSize: 20, fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                {selectedMatch.home} <br /><span style={{ fontSize: 14 }}>x{(selectedMatch.odds.home / 100).toFixed(2)}</span>
                            </button>

                            <button
                                onClick={() => handleBet(selectedMatch.id, "AWAY", selectedMatch.odds.away)}
                                style={{ flex: 1, padding: 30, borderRadius: 16, background: '#ff005520', border: '2px solid #ff0055', color: '#ff0055', fontSize: 20, fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                {selectedMatch.away} <br /><span style={{ fontSize: 14 }}>x{(selectedMatch.odds.away / 100).toFixed(2)}</span>
                            </button>
                        </Flex>

                        <Text align="center" size="4" weight="bold" color="amber" style={{ display: 'block', marginTop: 30 }}>{status}</Text>
                    </div>
                ) : (
                    <Text size="5" color="gray">Select a match to start printing money.</Text>
                )}
            </Flex>
        </Flex>
    );
};
