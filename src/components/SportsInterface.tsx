import { useState, useEffect } from 'react';
import { Flex, Text, Button, Badge, ScrollArea, Box } from '@radix-ui/themes';
import { motion } from 'framer-motion';
import { SportsDataService, MatchData } from '../services/sportsService';
import { BetSlip, BetSelection } from './BetSlip';

export const SportsInterface = ({ onBack }: { onBack: () => void }) => {
    const [matches, setMatches] = useState<MatchData[]>([]);
    const [selections, setSelections] = useState<BetSelection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatches = async () => {
            const data = await SportsDataService.getMatches();
            setMatches(data);
            setLoading(false);
        };

        fetchMatches();
        const interval = setInterval(fetchMatches, 5000); // Live updates
        return () => clearInterval(interval);
    }, []);

    const toggleSelection = (match: MatchData, selectionName: string, marketName: string, price: number) => {
        const id = `${match.id}-${selectionName}`;
        setSelections(prev => {
            const exists = prev.find(s => s.id === id);
            if (exists) {
                return prev.filter(s => s.id !== id);
            }
            return [...prev, {
                id,
                matchId: match.id,
                match: `${match.team1} vs ${match.team2}`,
                selection: selectionName,
                market: marketName,
                odds: price
            }];
        });
    };

    const isSelected = (matchId: string, selectionName: string) => {
        return selections.some(s => s.id === `${matchId}-${selectionName}`);
    };

    // Generic Odds Button Component
    const OddsBtn = ({ label, price, match, market, change }: any) => {
        const selected = isSelected(match.id, label);
        return (
            <motion.button
                layout
                whileHover={{ scale: 1.05, backgroundColor: selected ? '#00f3ff' : '#ffffff20' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleSelection(match, label, market, price)}
                style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: 4,
                    background: selected ? '#00f3ff' : change === 'up' ? '#00ff8830' : change === 'down' ? '#ff005530' : '#ffffff08',
                    border: selected ? '1px solid #00f3ff' : '1px solid #ffffff10',
                    color: selected ? 'black' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 50,
                    transition: 'border 0.2s',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Flash Effect on Change */}
                {change && change !== 'none' && (
                    <motion.div
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 0 }}
                        style={{
                            position: 'absolute', inset: 0,
                            background: change === 'up' ? '#00ff88' : '#ff0055'
                        }}
                    />
                )}

                <Text size="1" color={selected ? undefined : "gray"} style={{ fontSize: 10 }}>{label}</Text>
                <Text weight="bold" size="2" style={{ color: selected ? 'black' : change === 'up' ? '#00ff88' : change === 'down' ? '#ff0055' : '#00f3ff' }}>
                    {price.toFixed(2)}
                </Text>
            </motion.button>
        );
    };

    return (
        <Flex style={{ height: '100vh', background: '#09090b', color: 'white', overflow: 'hidden' }}>

            {/* LEFT: MARKET TERMINAL */}
            <Flex direction="column" style={{ flex: 1, overflow: 'hidden' }}>
                {/* HEADER */}
                <Flex justify="between" align="center" style={{ padding: '16px 24px', borderBottom: '1px solid #ffffff10' }}>
                    <Flex align="center" gap="4">
                        <Button variant="ghost" onClick={onBack} style={{ cursor: 'pointer' }}>← EXIT</Button>
                        <Text size="5" weight="bold" style={{ fontFamily: 'Orbitron' }}>MARKET TERMINAL</Text>
                        <Badge color="green" variant="soft">LIVE FEED ACTIVE</Badge>
                    </Flex>
                    <Flex gap="2">
                        <Button size="1" variant="soft" color="gray">Soccer</Button>
                        <Button size="1" variant="outline" color="gray">Basketball</Button>
                        <Button size="1" variant="outline" color="gray">Tennis</Button>
                    </Flex>
                </Flex>

                {/* TABLE HEADER */}
                <Flex style={{ background: '#111113', padding: '8px 24px', borderBottom: '1px solid #ffffff10' }}>
                    <Box style={{ width: 60 }}><Text size="1" color="gray">TIME</Text></Box>
                    <Box style={{ flex: 2 }}><Text size="1" color="gray">MATCH</Text></Box>
                    <Flex style={{ flex: 2, gap: 4 }} justify="center"><Text size="1" color="gray">1x2 (WINNER)</Text></Flex>
                    <Flex style={{ flex: 1.5, gap: 4 }} justify="center"><Text size="1" color="gray">OVER / UNDER</Text></Flex>
                    <Flex style={{ flex: 1.5, gap: 4 }} justify="center"><Text size="1" color="gray">BTTS</Text></Flex>
                </Flex>

                {/* SCROLLABLE ODDS LIST */}
                <ScrollArea scrollbars="vertical" style={{ height: '100%' }}>
                    <Flex direction="column">
                        {matches.map((match, i) => (
                            <motion.div
                                key={match.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                style={{
                                    padding: '12px 24px',
                                    borderBottom: '1px solid #ffffff08',
                                    background: i % 2 === 0 ? 'transparent' : '#ffffff03',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {/* TIME */}
                                <Box style={{ width: 60 }}>
                                    <Text size="1" color={match.status === 'LIVE' ? 'crimson' : 'gray'} weight={match.status === 'LIVE' ? 'bold' : 'regular'}>
                                        {match.time}
                                    </Text>
                                </Box>

                                {/* TEAMS */}
                                <Box style={{ flex: 2, paddingRight: 16 }}>
                                    <Flex direction="column">
                                        <Flex justify="between">
                                            <Text weight="bold" size="2">{match.team1}</Text>
                                            <Text size="2" color="cyan">{match.score1}</Text>
                                        </Flex>
                                        <Flex justify="between">
                                            <Text weight="bold" size="2">{match.team2}</Text>
                                            <Text size="2" color="cyan">{match.score2}</Text>
                                        </Flex>
                                        <Text size="1" color="gray" style={{ fontSize: 10, marginTop: 4 }}>{match.league}</Text>
                                    </Flex>
                                </Box>

                                {/* ODDS: 1x2 */}
                                <Flex style={{ flex: 2, gap: 8 }}>
                                    {match.markets.h2h.map((odd) => (
                                        <OddsBtn key={odd.label} {...odd} match={match} market="Match Winner" />
                                    ))}
                                </Flex>

                                {/* ODDS: O/U */}
                                <Flex style={{ flex: 1.5, gap: 8, paddingLeft: 16 }}>
                                    {match.markets.overUnder25?.map((odd) => (
                                        <OddsBtn key={odd.label} {...odd} match={match} market="Over/Under 2.5" />
                                    ))}
                                </Flex>

                                {/* ODDS: BTTS */}
                                <Flex style={{ flex: 1.5, gap: 8, paddingLeft: 16 }}>
                                    {match.markets.btts?.map((odd) => (
                                        <OddsBtn key={odd.label} {...odd} match={match} market="Both Teams To Score" />
                                    ))}
                                </Flex>

                            </motion.div>
                        ))}

                        {loading && (
                            <Flex justify="center" style={{ padding: 40 }}>
                                <Text color="gray">Loading markets...</Text>
                            </Flex>
                        )}
                    </Flex>
                </ScrollArea>
            </Flex>

            {/* RIGHT: BET SLIP SIDEBAR */}
            <Box style={{ width: 320, height: '100%', flexShrink: 0 }}>
                <BetSlip
                    selections={selections}
                    onRemove={(id) => setSelections(prev => prev.filter(s => s.id !== id))}
                    onPlaceBet={(amt) => {
                        console.log(`Placing bet of ${amt} SUI on`, selections);
                        setSelections([]); // Clear after bet
                    }}
                />
            </Box>

        </Flex>
    );
};

