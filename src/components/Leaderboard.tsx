
import { Flex, Text, Card } from "@radix-ui/themes";
import { motion } from "framer-motion";

// MOCK DATA - FANTASY PREMIER LEAGUE STYLE
const RANKINGS = [
    { rank: 1, user: "SuiWhale_99", teamName: "To The Moon FC", gwPoints: 85, totalPoints: 2140, avatar: "/avatars/avatar1.png" },
    { rank: 2, user: "DegenKing", teamName: "Rug Pull United", gwPoints: 72, totalPoints: 2095, avatar: "/avatars/avatar2.png" },
    { rank: 3, user: "AlphaHunter", teamName: "Diamond Hands", gwPoints: 91, totalPoints: 2088, avatar: "/avatars/avatar3.png" },
    { rank: 4, user: "PixelPunter", teamName: "Move Protocolters", gwPoints: 64, totalPoints: 1950, avatar: "/avatars/avatar4.png" },
    { rank: 5, user: "WagmiWarrior", teamName: "Liquidity Poolers", gwPoints: 55, totalPoints: 1890, avatar: "/avatars/avatar1.png" },
    { rank: 6, user: "GasFeeGuzzler", teamName: "Gwei City", gwPoints: 48, totalPoints: 1820, avatar: "/avatars/avatar2.png" },
    { rank: 7, user: "ChartWatcher", teamName: "Candle Sticks", gwPoints: 60, totalPoints: 1750, avatar: "/avatars/avatar3.png" },
];

export const Leaderboard = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}
        >
            <Flex justify="between" align="end" style={{ marginBottom: 20 }}>
                <Text size="8" weight="bold" style={{ fontFamily: 'Orbitron' }}>GLOBAL LEAGUE</Text>
                <Text color="gray">Gameweek 34</Text>
            </Flex>

            {/* TOP 3 PODIUM (Optional Visual) */}
            <Flex gap="4" style={{ marginBottom: 40 }} justify="center" align="end">
                {[RANKINGS[1], RANKINGS[0], RANKINGS[2]].map((player, idx) => (
                    <Flex
                        key={player.rank}
                        direction="column"
                        align="center"
                        style={{ position: 'relative', marginTop: idx === 1 ? -20 : 0 }}
                    >
                        <div style={{
                            width: idx === 1 ? 100 : 80,
                            height: idx === 1 ? 100 : 80,
                            borderRadius: '50%',
                            border: `3px solid ${idx === 1 ? '#ffd700' : idx === 0 ? '#c0c0c0' : '#cd7f32'}`,
                            backgroundImage: `url(${player.avatar})`,
                            backgroundSize: 'cover',
                            marginBottom: 8
                        }} />
                        <Text weight="bold" size={idx === 1 ? "4" : "2"}>{player.user}</Text>
                        <Text size="1" color="gray">{player.totalPoints} pts</Text>
                        <div style={{
                            marginTop: 10,
                            width: idx === 1 ? 120 : 100,
                            height: idx === 1 ? 140 : 100,
                            background: 'var(--glass-panel)',
                            borderTopLeftRadius: 8,
                            borderTopRightRadius: 8,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: 40,
                            fontWeight: 'bold',
                            color: '#ffffff20'
                        }}>
                            {player.rank}
                        </div>
                    </Flex>
                ))}
            </Flex>

            {/* TABLE */}
            <Card style={{ padding: 0, background: 'var(--glass-panel)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                    <thead>
                        <tr style={{ background: '#ffffff10', textAlign: 'left' }}>
                            <th style={{ padding: 16 }}>Rank</th>
                            <th style={{ padding: 16 }}>Team & Manager</th>
                            <th style={{ padding: 16 }}>GW Points</th>
                            <th style={{ padding: 16 }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {RANKINGS.map((row, i) => (
                            <motion.tr
                                key={row.rank}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                style={{ borderBottom: '1px solid #ffffff10' }}
                            >
                                <td style={{ padding: 16, fontWeight: 'bold', color: row.rank <= 3 ? '#00f3ff' : 'white' }}>
                                    #{row.rank}
                                </td>
                                <td style={{ padding: 16 }}>
                                    <Flex align="center" gap="3">
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `url(${row.avatar})`, backgroundSize: 'cover' }} />
                                        <Flex direction="column">
                                            <Text weight="bold">{row.teamName}</Text>
                                            <Text size="1" color="gray">{row.user}</Text>
                                        </Flex>
                                    </Flex>
                                </td>
                                <td style={{ padding: 16, color: '#00ff88' }}>{row.gwPoints}</td>
                                <td style={{ padding: 16, fontWeight: 'bold' }}>{row.totalPoints}</td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </Card>

        </motion.div>
    );
};
