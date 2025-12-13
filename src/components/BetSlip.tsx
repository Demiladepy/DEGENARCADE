
import { Box, Flex, Text, Button, TextField, Badge } from "@radix-ui/themes";
import { motion, AnimatePresence } from "framer-motion";
import { useState, ChangeEvent } from "react";



export interface BetSelection {
    id: string;
    matchId: string;
    match: string;
    selection: string;
    market: string;
    odds: number;
}

interface BetSlipProps {
    selections: BetSelection[];
    onRemove: (id: string) => void;
    onPlaceBet: (amount: number) => void;
}

export const BetSlip = ({ selections, onRemove, onPlaceBet }: BetSlipProps) => {
    const [stake, setStake] = useState<string>("10");
    const [isSuccess, setIsSuccess] = useState(false);

    const totalOdds = selections.reduce((acc, curr) => acc * curr.odds, 1);
    const potentialWin = (parseFloat(stake || "0") * totalOdds).toFixed(2);

    const handlePlaceBet = () => {
        setIsSuccess(true);
        setTimeout(() => {
            onPlaceBet(parseFloat(stake || "0"));
            setIsSuccess(false);
            setStake("10");
        }, 2000);
    };

    if (selections.length === 0 && !isSuccess) {
        return (
            <Flex
                direction="column"
                align="center"
                justify="center"
                style={{
                    height: '100%',
                    padding: 40,
                    color: '#666',
                    textAlign: 'center',
                    borderLeft: '1px solid #ffffff10'
                }}
            >
                <div style={{ fontSize: 40, marginBottom: 16 }}>🎫</div>
                <Text>Your slip is empty</Text>
                <Text size="1">Click odds to add selections</Text>
            </Flex>
        );
    }

    return (
        <Flex direction="column" style={{ height: '100%', borderLeft: '1px solid #ffffff10', background: '#09090b', position: 'relative' }}>
            {/* HEADER */}
            <Flex justify="between" align="center" style={{ padding: 16, borderBottom: '1px solid #ffffff10', background: '#09090b' }}>
                <Flex align="center" gap="2">
                    <Text weight="bold" style={{ color: '#00f3ff' }}>BET SLIP</Text>
                    <Badge color="cyan" variant="solid" radius="full">{selections.length}</Badge>
                </Flex>
                <Text size="1" color="gray">SUI NETWORK</Text>
            </Flex>

            {/* SELECTIONS LIST */}
            <Flex direction="column" style={{ flex: 1, overflowY: 'auto', padding: 16, gap: 12 }}>
                <AnimatePresence mode="popLayout">
                    {selections.map((bet) => (
                        <motion.div
                            key={bet.id}
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                            style={{
                                background: 'var(--glass-panel)',
                                borderRadius: 12,
                                border: '1px solid #ffffff10',
                                padding: 12,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div
                                onClick={() => onRemove(bet.id)}
                                style={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    cursor: 'pointer',
                                    padding: 4,
                                    color: '#666'
                                }}
                            >
                                ✕
                            </div>

                            <Text size="1" color="gray" style={{ marginBottom: 4 }}>{bet.match}</Text>
                            <Flex justify="between" align="end">
                                <Box>
                                    <Text weight="bold" size="3" style={{ color: '#00f3ff' }}>{bet.selection}</Text>
                                    <Text size="1" style={{ display: 'block' }}>{bet.market}</Text>
                                </Box>
                                <Badge size="2" color="cyan" variant="outline" style={{ background: 'transparent' }}>
                                    {bet.odds.toFixed(2)}
                                </Badge>
                            </Flex>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </Flex>

            {/* FOOTER - STAKE & PLACE */}
            <Box style={{ padding: 20, background: '#111113', borderTop: '1px solid #ffffff10' }}>
                <Flex justify="between" style={{ marginBottom: 12 }}>
                    <Text size="2" color="gray">Total Odds</Text>
                    <Text weight="bold" color="cyan">{totalOdds.toFixed(2)}</Text>
                </Flex>

                <Box style={{ marginBottom: 16 }}>
                    <Text size="1" color="gray" style={{ marginBottom: 8, display: 'block' }}>STAKE (SUI)</Text>
                    <TextField.Root
                        value={stake}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setStake(e.target.value)}
                        style={{ textAlign: 'right', fontWeight: 'bold' }}
                    >
                        <TextField.Slot>
                            SUI
                        </TextField.Slot>
                    </TextField.Root>
                </Box>

                <Flex justify="between" style={{ marginBottom: 20 }}>
                    <Text size="2" color="gray">Potential Return</Text>
                    <Text weight="bold" size="5" style={{ color: '#00ff88' }}>{potentialWin} SUI</Text>
                </Flex>

                <Button
                    size="4"
                    style={{
                        width: '100%',
                        cursor: 'pointer',
                        background: isSuccess ? '#00ff88' : 'linear-gradient(45deg, #00f3ff, #006fee)',
                        color: isSuccess ? 'black' : 'white',
                        transition: 'all 0.3s'
                    }}
                    onClick={handlePlaceBet}
                    disabled={selections.length === 0}
                >
                    {isSuccess ? 'BET PLACED! 🎟️' : 'PLACE BET'}
                </Button>
            </Box>

            {/* CONFETTI OVERLAY */}
            <AnimatePresence>
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            zIndex: 10
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.5, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            style={{
                                background: 'white',
                                color: 'black',
                                padding: 24,
                                width: '80%',
                                borderRadius: 16,
                                textAlign: 'center',
                                boxShadow: '0 0 40px #00ff88'
                            }}
                        >
                            <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
                            <Text weight="bold" size="5">TICKET PRINTED</Text>
                            <Text size="2" color="gray">ID: #8A7F9P</Text>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Flex>
    );
};
