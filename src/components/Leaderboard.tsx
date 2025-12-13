import { Flex, Text, Card, Badge } from "@radix-ui/themes";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// SUI HUB LOCATIONS IN AFRICA
const SUI_HUBS = [
    "Lagos", "Nairobi", "Cape Town", "Accra", "Cairo",
    "Johannesburg", "Kigali", "Addis Ababa", "Dar es Salaam", "Kampala"
];

const USER_PREFIXES = ["SuiWhale", "Degen", "Move", "AptosKiller", "Mysten", "ZkLogin", "BullShark"];

const generateRandomName = () => {
    const isHub = Math.random() > 0.4;
    if (isHub) {
        return `SuiHub ${SUI_HUBS[Math.floor(Math.random() * SUI_HUBS.length)]}`;
    }
    return `${USER_PREFIXES[Math.floor(Math.random() * USER_PREFIXES.length)]}_${Math.floor(Math.random() * 999)}`;
};

const generateInitialData = () => {
    return Array.from({ length: 15 }).map((_, i) => ({
        id: `user-${i}`,
        rank: i + 1,
        user: generateRandomName(),
        teamName: `Team ${String.fromCharCode(65 + i)}`,
        gwPoints: Math.floor(Math.random() * 100),
        totalPoints: 2000 + Math.floor(Math.random() * 500),
        avatar: `/avatars/avatar${(i % 4) + 1}.png`,
        change: 0 // 0 = same, 1 = up, -1 = down
    })).sort((a, b) => b.totalPoints - a.totalPoints);
};

export const Leaderboard = () => {
    const [rankings, setRankings] = useState(generateInitialData());

    useEffect(() => {
        const interval = setInterval(() => {
            setRankings(prev => {
                // Randomly update 3 players' scores
                const newRankings = [...prev];
                for (let i = 0; i < 3; i++) {
                    const idx = Math.floor(Math.random() * newRankings.length);
                    const pointsAdd = Math.floor(Math.random() * 50);
                    newRankings[idx].totalPoints += pointsAdd;
                    newRankings[idx].gwPoints += Math.floor(pointsAdd / 5);
                }

                // Re-sort
                const sorted = [...newRankings].sort((a, b) => b.totalPoints - a.totalPoints);

                // Recalculate ranks and track changes
                return sorted.map((player, index) => {
                    const oldRank = player.rank;
                    const newRank = index + 1;
                    let change = 0;
                    if (oldRank > newRank) change = 1; // Moved up
                    if (oldRank < newRank) change = -1; // Moved down

                    return { ...player, rank: newRank, change };
                });
            });
        }, 2000); // 2 second updates for "Real Time" feel

        return () => clearInterval(interval);
    }, []);

    const top3 = [rankings[1], rankings[0], rankings[2]]; // 2nd, 1st, 3rd for podium

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}
        >
            <Flex justify="between" align="end" style={{ marginBottom: 20 }}>
                <Flex direction="column">
                    <Text size="8" weight="bold" style={{ fontFamily: 'Orbitron' }}>AFRICA LIVE HUB</Text>
                    <Flex gap="2" align="center">
                        <span style={{ width: 8, height: 8, background: '#00ff88', borderRadius: '50%', boxShadow: '0 0 10px #00ff88' }} />
                        <Text color="gray" size="2">LIVE UPDATES ENABLED</Text>
                    </Flex>
                </Flex>
                <Text color="gray">Season 1: Epoch 420</Text>
            </Flex>

            {/* TOP 3 PODIUM */}
            <Flex gap="4" style={{ marginBottom: 40 }} justify="center" align="end">
                {top3.map((player, idx) => {
                    // 0 -> 2nd place (Silver), 1 -> 1st place (Gold), 2 -> 3rd place (Bronze)
                    const color = idx === 1 ? '#ffd700' : idx === 0 ? '#c0c0c0' : '#cd7f32';
                    const height = idx === 1 ? 140 : 100;

                    return (
                        <Flex
                            key={player.id}
                            direction="column"
                            align="center"
                            style={{ position: 'relative', marginTop: idx === 1 ? -20 : 0 }}
                        >
                            <motion.div
                                layoutId={player.id}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                style={{
                                    width: idx === 1 ? 100 : 80,
                                    height: idx === 1 ? 100 : 80,
                                    borderRadius: '50%',
                                    border: `3px solid ${color}`,
                                    backgroundImage: `url(${player.avatar})`,
                                    backgroundSize: 'cover',
                                    marginBottom: 8,
                                    boxShadow: `0 0 20px ${color}40`
                                }}
                            />
                            <Text weight="bold" size={idx === 1 ? "4" : "2"}>{player.user}</Text>
                            <Text size="1" color="gray">{player.totalPoints} pts</Text>

                            <div style={{
                                marginTop: 10,
                                width: idx === 1 ? 120 : 100,
                                height,
                                background: 'var(--glass-panel)',
                                borderTopLeftRadius: 8,
                                borderTopRightRadius: 8,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: 40,
                                fontWeight: 'bold',
                                color: '#ffffff20',
                                borderTop: `1px solid ${color}40`
                            }}>
                                {idx === 1 ? 1 : idx === 0 ? 2 : 3}
                            </div>
                        </Flex>
                    );
                })}
            </Flex>

            {/* TABLE */}
            <Card style={{ padding: 0, background: 'var(--glass-panel)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                    <thead>
                        <tr style={{ background: '#ffffff10', textAlign: 'left' }}>
                            <th style={{ padding: 16 }}>Rank</th>
                            <th style={{ padding: 16 }}>Player</th>
                            <th style={{ padding: 16 }}>Status</th>
                            <th style={{ padding: 16 }}>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {rankings.slice(0, 10).map((row) => (
                                <motion.tr
                                    key={row.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{ borderBottom: '1px solid #ffffff10' }}
                                >
                                    <td style={{ padding: 16, fontWeight: 'bold', color: row.rank <= 3 ? '#00f3ff' : 'white' }}>
                                        #{row.rank}
                                        {row.change === 1 && <span style={{ color: '#00ff88', marginLeft: 8, fontSize: 12 }}>▲</span>}
                                        {row.change === -1 && <span style={{ color: '#ff0055', marginLeft: 8, fontSize: 12 }}>▼</span>}
                                    </td>
                                    <td style={{ padding: 16 }}>
                                        <Flex align="center" gap="3">
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `url(${row.avatar})`, backgroundSize: 'cover' }} />
                                            <Text weight="bold">{row.user}</Text>
                                        </Flex>
                                    </td>
                                    <td style={{ padding: 16 }}>
                                        {row.user.includes('SuiHub') && (
                                            <Badge color="orange" variant="soft">HUB NODE</Badge>
                                        )}
                                    </td>
                                    <td style={{ padding: 16, fontWeight: 'bold' }}>{row.totalPoints}</td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </Card>

        </motion.div>
    );
};
