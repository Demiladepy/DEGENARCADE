import { Box, Flex, Text } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { ConnectButton } from "@mysten/dapp-kit";
import { motion, AnimatePresence } from "framer-motion";
import { MyBets } from "./MyBets";
import { ReferralDashboard } from "./ReferralDashboard";
import { Leaderboard } from "./Leaderboard";
import { MarketTerminal } from "./Terminal/MarketTerminal";

interface GameCardProps {
    title: string;
    image: string;
    watchers: string;
    active?: boolean;
    onPlay: () => void;
    actionLabel: string;
    color: string;
}

const GameCard = ({ title, image, watchers, active, onPlay, actionLabel, color }: GameCardProps) => (
    <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        style={{
            background: 'var(--glass-panel)',
            borderRadius: 24,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
            border: active ? `1px solid ${color}` : '1px solid #ffffff10',
            boxShadow: active ? `0 0 20px ${color}40` : 'none',
            cursor: 'pointer'
        }}
    >
        <Flex gap="3" align="center">
            <div style={{ width: 64, height: 64, borderRadius: 16, background: `url(${image})`, backgroundSize: 'cover' }} />
            <Flex direction="column">
                <Text weight="bold" size="3" style={{ color: 'white' }}>{title}</Text>
                <Text size="2" style={{ color: '#888' }}>{watchers} playing</Text>
            </Flex>
        </Flex>
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
            style={{
                background: color,
                color: 'white',
                border: 'none',
                padding: '8px 24px',
                borderRadius: 20,
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: `0 4px 12px ${color}60`
            }}
        >
            {actionLabel}
        </motion.button>
    </motion.div>
);

// MOCK DATA for Games
const GAMES = [
    { id: 'coin', title: 'Moon Flip', watchers: '1.2k', image: 'https://images.unsplash.com/photo-1639803938107-5f7415b24dd9?w=200', action: 'Play Now', color: '#00f3ff' },
    { id: 'sports', title: 'Sports Betting', watchers: '4.4k', image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=200', action: 'Bet Live', color: '#7000ff' },
    { id: 'plinko', title: 'Plinko Degen', watchers: '9.3k', image: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=200', action: 'Unreleased', color: '#ff0055' }
];

export const Dashboard = ({ setMode }: { setMode: (m: string) => void }) => {
    const [activeTab, setActiveTab] = useState('Home');
    const [matches, setMatches] = useState<any[]>([]);

    useEffect(() => {
        const loadMatches = async () => {
            const data = await import('../services/sportsService').then(m => m.SportsDataService.getMatches());
            setMatches(data);
        };
        loadMatches();
        const interval = setInterval(loadMatches, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    // Use the first LIVE match for the Hero, or the first available
    const featuredMatch = matches.find(m => m.status === 'LIVE') || matches[0] || {
        id: 'loading', team1: 'Loading...', team2: '...', score1: 0, score2: 0, time: '00:00', league: 'Sports', status: 'LOADING'
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'My Bets':
                return <MyBets />;
            case 'Team Chat':
                return <ReferralDashboard />;
            case 'Terminal':
                return <MarketTerminal />;
            case 'Leaderboard':
                return <Leaderboard />;
            default: // Home
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* HERO BANNER - CAROUSEL STYLE */}
                        <motion.div
                            key={featuredMatch.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            style={{
                                width: '100%',
                                height: 320,
                                borderRadius: 32,
                                background: 'linear-gradient(90deg, #09090b 0%, rgba(9,9,11,0.5) 100%), url("https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000")',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                marginBottom: 40,
                                position: 'relative',
                                padding: 40,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                border: '1px solid #ffffff10',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                            }}
                        >
                            <Box style={{ position: 'relative', zIndex: 2 }}>
                                <Flex gap="3" align="center" style={{ marginBottom: 16 }}>
                                    <span style={{ padding: '4px 12px', background: '#e11d48', borderRadius: 4, fontSize: 12, fontWeight: 'bold' }}>LIVE</span>
                                    <Text size="3" style={{ color: '#aaa' }}>{featuredMatch.league}</Text>
                                </Flex>

                                <Text size="9" weight="bold" style={{ fontFamily: 'Orbitron', lineHeight: 1.1, marginBottom: 8 }}>
                                    {featuredMatch.team1} <span style={{ color: '#00f3ff' }}>{featuredMatch.score1}</span>
                                </Text>
                                <Text size="9" weight="bold" style={{ fontFamily: 'Orbitron', lineHeight: 1.1, marginBottom: 24 }}>
                                    {featuredMatch.team2} <span style={{ color: '#00f3ff' }}>{featuredMatch.score2}</span>
                                </Text>

                                <Text size="5" style={{ color: '#00f3ff', marginBottom: 32, fontFamily: 'monospace' }}>
                                    ⏱ {featuredMatch.time}
                                </Text>

                                <Flex gap="3">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setMode('sports')}
                                        style={{ padding: '14px 40px', borderRadius: 30, border: 'none', background: '#00f3ff', color: 'black', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}
                                    >
                                        BET NOW
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{ padding: '14px 40px', borderRadius: 30, border: '2px solid white', background: 'transparent', color: 'white', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}
                                    >
                                        WATCH STREAM
                                    </motion.button>
                                </Flex>
                            </Box>
                        </motion.div>

                        {/* GAME LIST */}
                        <Text size="5" weight="bold" style={{ marginBottom: 20 }}>Live Games</Text>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                            {GAMES.map(game => (
                                <GameCard
                                    key={game.id}
                                    {...game}
                                    active={game.id === 'sports'}
                                    color={game.color}
                                    actionLabel={game.action}
                                    onPlay={() => setMode(game.id)}
                                />
                            ))}
                        </div>

                        {/* RECOMMENDED STREAMERS */}
                        <Text size="5" weight="bold" style={{ marginTop: 40, marginBottom: 20 }}>Top Degens</Text>
                        <Flex gap="4">
                            {[1, 2, 3, 4].map(i => (
                                <motion.img
                                    key={i}
                                    whileHover={{ scale: 1.1, borderColor: '#00f3ff' }}
                                    style={{
                                        width: 60, height: 60, borderRadius: '50%',
                                        border: '2px solid #555',
                                        cursor: 'pointer'
                                    }}
                                    src={`/avatars/avatar${i}.png`}
                                />
                            ))}
                        </Flex>
                    </motion.div>
                );
        }
    };

    return (
        <Flex style={{ height: '100vh', width: '100vw', background: '#09090b', color: 'white', overflow: 'hidden' }}>
            {/* SIDEBAR */}
            <Flex direction="column" style={{ width: 280, padding: 32, borderRight: '1px solid #ffffff10', background: '#0c0c0e' }}>
                <motion.div
                    whileHover={{ scale: 1.05, textShadow: "0 0 20px rgba(0,243,255,0.8)" }}
                    style={{ marginBottom: 40, cursor: "pointer" }}
                    onClick={() => setMode('dashboard')}
                >
                    <Text
                        size="8"
                        weight="bold"
                        style={{
                            fontWeight: 900,
                            fontFamily: 'Orbitron',
                            letterSpacing: '-1px',
                            background: 'linear-gradient(to right, #ffffff, #a5f3fc)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 0 15px rgba(0, 243, 255, 0.3))'
                        }}
                    >
                        DEGEN
                    </Text>
                    <Text
                        size="8"
                        weight="bold"
                        style={{
                            fontWeight: 900,
                            fontFamily: 'Orbitron',
                            color: '#00f3ff',
                            textShadow: '0 0 20px rgba(0, 243, 255, 0.6)',
                            display: 'block',
                            marginTop: -10
                        }}
                    >
                        ARCADE
                    </Text>
                </motion.div>

                <Flex direction="column" gap="2">
                    {['Home', 'My Bets', 'Leaderboard', 'Team Chat', 'Terminal'].map(item => (
                        <motion.div
                            key={item}
                            whileHover={{ x: 5, color: '#white' }}
                            style={{
                                cursor: 'pointer',
                                padding: '10px 16px',
                                borderRadius: 12,
                                background: activeTab === item ? '#ffffff08' : 'transparent',
                                color: activeTab === item ? 'white' : '#888',
                                borderLeft: activeTab === item ? '2px solid #00f3ff' : '2px solid transparent'
                            }}
                            onClick={() => setActiveTab(item)}
                        >
                            <Text size="3" weight="medium">{item}</Text>
                        </motion.div>
                    ))}
                </Flex>

                <Box style={{ flexGrow: 1 }} />

                <Flex direction="column" gap="4">
                    <Text size="2" color="gray">CONNECTED AS</Text>
                    <ConnectButton />
                </Flex>
            </Flex>

            {/* MAIN CONTENT */}
            <Flex direction="column" style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3 }}
                        style={{ width: '100%' }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </Flex>
        </Flex>
    );
}

