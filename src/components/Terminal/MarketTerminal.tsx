
import { useState, useEffect } from 'react';
import { Flex, Text, Button, Card, Box, TextField, Badge, ScrollArea, Separator, Grid } from "@radix-ui/themes";
import { motion, AnimatePresence } from "framer-motion";
import { MarketService, TokenData } from '../../services/marketService';
import { Settings, ChevronDown } from 'lucide-react';

// ... (Keep existing TokenRow, CandleChart components unchanged) ...

const TokenRow = ({ token, onSelect, active }: { token: TokenData, onSelect: () => void, active: boolean }) => (
    <div
        onClick={onSelect}
        style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            padding: '10px 14px',
            background: active ? '#ffffff10' : 'transparent',
            cursor: 'pointer',
            fontSize: 13,
            borderBottom: '1px solid #ffffff05',
            color: active ? 'white' : '#888',
            transition: 'background 0.2s'
        }}
    >
        <Flex align="center" gap="2">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: active ? '#00f3ff' : 'transparent' }}></div>
            <span style={{ fontWeight: 'bold', color: active ? 'white' : '#aaa' }}>{token.symbol}</span>
        </Flex>
        <Text style={{ textAlign: 'right', fontFamily: 'monospace' }}>${token.price.toFixed(6)}</Text>
        <Text style={{ textAlign: 'right', fontFamily: 'monospace', color: token.change24h >= 0 ? '#00ff88' : '#ff0055' }}>
            {token.change24h > 0 ? '+' : ''}{token.change24h}%
        </Text>
    </div>
);

const CandleChart = ({ color }: { color: string }) => {
    // Advanced Mock Chart
    // const height = 400; // Unused
    // const width = 800; // Unused 

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', background: '#111', overflow: 'hidden' }}>
            {/* Grid Lines */}
            <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateRows: 'repeat(5, 1fr)', gridTemplateColumns: 'repeat(8, 1fr)' }}>
                {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} style={{ borderRight: '1px solid #ffffff05', borderBottom: '1px solid #ffffff05' }} />
                ))}
            </div>

            {/* Price Axis */}
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px 0', fontSize: 10, color: '#666', background: '#00000080', zIndex: 2 }}>
                {[1.05, 1.04, 1.03, 1.02, 1.01].map(p => <span key={p} style={{ textAlign: 'center' }}>{p.toFixed(2)}</span>)}
            </div>

            {/* Candles */}
            <div style={{ position: 'absolute', inset: '20px 60px 40px 20px', display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                {Array.from({ length: 50 }).map((_, i) => {
                    const barHeight = 20 + Math.random() * 250;
                    const isGreen = Math.random() > 0.48; // Slight green bias
                    const barColor = isGreen ? '#00ff88' : '#ff0055';
                    // Wick
                    const wickTop = Math.random() * 20;
                    const wickBottom = Math.random() * 20;

                    return (
                        <div key={i} style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                            <div style={{
                                width: '100%',
                                height: barHeight,
                                background: barColor,
                                opacity: 0.9,
                                position: 'relative',
                                borderRadius: 1
                            }}>
                                {/* Wicks */}
                                <div style={{ position: 'absolute', top: -wickTop, left: '50%', width: 1, height: wickTop, background: barColor }}></div>
                                <div style={{ position: 'absolute', bottom: -wickBottom, left: '50%', width: 1, height: wickBottom, background: barColor }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Volume Bars at Bottom */}
            <div style={{ position: 'absolute', bottom: 0, left: 20, right: 60, height: 60, display: 'flex', alignItems: 'flex-end', gap: 6, opacity: 0.3 }}>
                {Array.from({ length: 50 }).map((_, i) => (
                    <div key={i} style={{ flex: 1, height: Math.random() * 50, background: Math.random() > 0.5 ? '#00ff88' : '#ff0055' }} />
                ))}
            </div>

            {/* Crosshair (Mock) */}
            <div style={{ position: 'absolute', top: '40%', left: 0, right: 0, height: 1, borderTop: '1px dashed #ffffff40', pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '60%', width: 1, borderLeft: '1px dashed #ffffff40', pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', top: '40%', right: 0, background: color, color: 'black', padding: '2px 4px', fontSize: 10, fontWeight: 'bold' }}>
                1.03
            </div>
        </div>
    );
};

export const MarketTerminal = () => {
    const [tokens, setTokens] = useState<TokenData[]>([]);
    const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
    const [mode, setMode] = useState<'TRADE' | 'VAULT'>('TRADE');
    const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
    const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
    const [amount, setAmount] = useState('');
    const [slippage, setSlippage] = useState(1.0);
    const [isPanelOpen, setIsPanelOpen] = useState(true);

    useEffect(() => {
        const init = async () => {
            const data = await MarketService.getTokens();
            setTokens(data);
            setSelectedToken(data[0]);
        };
        init();
        const interval = setInterval(() => setTokens(MarketService.getLiveUpdates()), 2000);
        return () => clearInterval(interval);
    }, []);

    const activeToken = tokens.find(t => t.symbol === selectedToken?.symbol) || tokens[0];
    const color = activeToken?.change24h >= 0 ? '#00ff88' : '#ff0055';

    if (!activeToken) return <div>Loading...</div>;

    // Calculate outputs mock
    const tokenPrice = activeToken.price;
    const inputValue = parseFloat(amount) || 0;
    const estimatedOutput = tradeType === 'BUY' ? inputValue / tokenPrice : inputValue * tokenPrice;

    // Quick Amount Buttons
    const quickAmounts = tradeType === 'BUY'
        ? [0.1, 0.5, 1, 5, 10]
        : [25, 50, 75, 100]; // Percent for sell

    return (
        <Flex style={{ height: 'calc(100vh - 80px)', background: '#0b0b0f', overflow: 'hidden' }}>

            {/* LEFT SIDEBAR: PAIRS */}
            <Flex direction="column" style={{ width: 280, borderRight: '1px solid #333', background: '#0e0e12' }}>
                <Box style={{ padding: 16, borderBottom: '1px solid #333' }}>
                    <TextField.Root placeholder="Search pairs..." size="2" variant="surface">
                        <TextField.Slot>🔍</TextField.Slot>
                    </TextField.Root>
                </Box>
                <Box style={{ padding: '10px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: 11, color: '#666', fontWeight: 'bold' }}>
                    <span>PAIR</span>
                    <span style={{ textAlign: 'right' }}>PRICE</span>
                    <span style={{ textAlign: 'right' }}>24H</span>
                </Box>
                <ScrollArea scrollbars="vertical" style={{ flex: 1 }}>
                    {tokens.map(t => (
                        <TokenRow key={t.symbol} token={t} active={activeToken.symbol === t.symbol} onSelect={() => setSelectedToken(t)} />
                    ))}
                </ScrollArea>
                <Box style={{ padding: 12, borderTop: '1px solid #333', background: '#0a0a0c' }}>
                    <Flex justify="between">
                        <Text size="1" color="gray">TPS: <span style={{ color: '#00f3ff' }}>4,209</span></Text>
                        <Text size="1" color="gray">Gas: <span style={{ color: '#00f3ff' }}>0.001 SUI</span></Text>
                    </Flex>
                </Box>
            </Flex>

            {/* MAIN CHART AREA */}
            <Flex direction="column" style={{ flex: 1 }}>

                {/* HEADER INFO */}
                <Flex align="center" justify="between" style={{ padding: '16px 24px', borderBottom: '1px solid #333', background: '#111' }}>
                    <Flex gap="5" align="center">
                        <Flex gap="3" align="center">
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: `1px solid ${color}` }}>{activeToken.symbol[0]}</div>
                            <Flex direction="column">
                                <Text size="4" weight="bold" style={{ lineHeight: 1 }}>{activeToken.symbol} <span style={{ color: '#666', fontSize: 14 }}>/ SUI</span></Text>
                                <Text size="1" color="gray">{activeToken.name}</Text>
                            </Flex>
                        </Flex>
                        <Separator orientation="vertical" />
                        <Box>
                            <Text size="1" color="gray">PRICE USD</Text>
                            <Text size="3" weight="bold" style={{ color: '#fff', fontFamily: 'monospace' }}>${activeToken.price.toFixed(8)}</Text>
                        </Box>
                        <Box>
                            <Text size="1" color="gray">24H CHANGE</Text>
                            <Text size="3" weight="bold" style={{ color: color, fontFamily: 'monospace' }}>{activeToken.change24h}%</Text>
                        </Box>
                        <Box>
                            <Text size="1" color="gray">LIQUIDITY</Text>
                            <Text size="3" weight="bold" style={{ fontFamily: 'monospace' }}>$1.2M</Text>
                        </Box>
                        <Box>
                            <Text size="1" color="gray">MKT CAP</Text>
                            <Text size="3" weight="bold" style={{ fontFamily: 'monospace' }}>{activeToken.marketCap}</Text>
                        </Box>
                    </Flex>
                    <Flex gap="3" align="center">
                        <Button size="1" variant="outline" color="gray">15m</Button>
                        <Button size="1" variant="solid" style={{ background: '#333' }}>1H</Button>
                        <Button size="1" variant="outline" color="gray">4H</Button>
                        <Separator orientation="vertical" />
                        <Button
                            size="2"
                            variant={isPanelOpen ? "solid" : "outline"}
                            color={isPanelOpen ? "cyan" : "gray"}
                            onClick={() => setIsPanelOpen(!isPanelOpen)}
                            style={{ cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            {isPanelOpen ? 'HIDE PANEL →' : '← TRADE'}
                        </Button>
                    </Flex>
                </Flex>

                {/* CHART CONTAINER */}
                <Box style={{ flex: 1, position: 'relative', background: '#000' }}>
                    <CandleChart color={color} />
                </Box>
            </Flex>

            {/* RIGHT PANEL: TRADE / VAULT */}
            {isPanelOpen && (
                <Flex direction="column" style={{ width: 340, minWidth: 340, borderLeft: '1px solid #333', background: '#0b0b0f', flexShrink: 0 }}>

                    {/* PANEL TABS */}
                    <Flex style={{ borderBottom: '1px solid #333' }}>
                        <Flex
                            align="center" justify="center"
                            style={{ flex: 1, padding: 12, cursor: 'pointer', background: mode === 'TRADE' ? '#1a1a1f' : 'transparent', borderTop: mode === 'TRADE' ? '2px solid #00f3ff' : '2px solid transparent', color: mode === 'TRADE' ? 'white' : '#666' }}
                            onClick={() => setMode('TRADE')}
                        >
                            <Text weight="bold" size="2">TRADE</Text>
                        </Flex>
                        <Flex
                            align="center" justify="center"
                            style={{ flex: 1, padding: 12, cursor: 'pointer', background: mode === 'VAULT' ? '#1a1a1f' : 'transparent', borderTop: mode === 'VAULT' ? '2px solid #00f3ff' : '2px solid transparent', color: mode === 'VAULT' ? 'white' : '#666' }}
                            onClick={() => setMode('VAULT')}
                        >
                            <Text weight="bold" size="2">VAULT</Text>
                        </Flex>
                    </Flex>

                    <Box style={{ padding: 16, flex: 1, overflowY: 'auto' }}>
                        <AnimatePresence mode="wait">
                            {mode === 'TRADE' ? (
                                <motion.div key="trade" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                                    {/* BUY / SELL SEGMENTED CONTROL */}
                                    <Flex style={{ background: '#1a1a1f', borderRadius: 8, padding: 4, marginBottom: 16 }}>
                                        <Button
                                            variant={tradeType === 'BUY' ? 'solid' : 'ghost'}
                                            style={{ flex: 1, cursor: 'pointer', fontWeight: 'bold', background: tradeType === 'BUY' ? '#00ff88' : 'transparent', color: tradeType === 'BUY' ? 'black' : '#888' }}
                                            onClick={() => setTradeType('BUY')}
                                        >
                                            BUY
                                        </Button>
                                        <Button
                                            variant={tradeType === 'SELL' ? 'solid' : 'ghost'}
                                            style={{ flex: 1, cursor: 'pointer', fontWeight: 'bold', background: tradeType === 'SELL' ? '#ff0055' : 'transparent', color: tradeType === 'SELL' ? 'white' : '#888' }}
                                            onClick={() => setTradeType('SELL')}
                                        >
                                            SELL
                                        </Button>
                                    </Flex>

                                    {/* ORDER TYPE & SLIPPAGE */}
                                    <Flex justify="between" align="center" style={{ marginBottom: 12 }}>
                                        <Flex gap="2">
                                            <Badge variant={orderType === 'MARKET' ? 'solid' : 'outline'} color="gray" style={{ cursor: 'pointer' }} onClick={() => setOrderType('MARKET')}>Market</Badge>
                                            <Badge variant={orderType === 'LIMIT' ? 'solid' : 'outline'} color="gray" style={{ cursor: 'pointer' }} onClick={() => setOrderType('LIMIT')}>Limit</Badge>
                                        </Flex>
                                        <Flex gap="1" align="center" style={{ fontSize: 11, color: '#888', cursor: 'pointer' }} onClick={() => setSlippage(slippage === 1 ? 0.5 : 1)}>
                                            <Settings size={12} />
                                            <span>{slippage}%</span>
                                        </Flex>
                                    </Flex>

                                    {/* INPUT AREA */}
                                    <Flex direction="column" gap="4">
                                        <Box style={{ background: '#1a1a1f', padding: 12, borderRadius: 8, border: '1px solid #333' }}>
                                            <Flex justify="between" align="center" mb="2">
                                                <Text size="1" color="gray" weight="bold">PAYING</Text>
                                                <Text size="1" color="gray">Bal: {tradeType === 'BUY' ? '50.00' : '0.00'}</Text>
                                            </Flex>
                                            <Flex justify="between" align="center">
                                                <input
                                                    style={{ background: 'transparent', border: 'none', color: 'white', fontSize: 24, width: '100%', outline: 'none', fontFamily: 'monospace', fontWeight: 'bold' }}
                                                    placeholder="0.00"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                />
                                                <Badge size="2" color="gray" variant="surface">{tradeType === 'BUY' ? 'SUI' : activeToken.symbol}</Badge>
                                            </Flex>
                                        </Box>

                                        {/* QUICK ACTION BUTTONS */}
                                        <Grid columns="4" gap="2">
                                            {quickAmounts.map(val => (
                                                <Button
                                                    key={val}
                                                    size="1"
                                                    variant="soft"
                                                    color="gray"
                                                    style={{ cursor: 'pointer', fontSize: 11, background: '#222', color: '#aaa' }}
                                                    onClick={() => setAmount(String(tradeType === 'BUY' ? val : (parseFloat(amount) || 0) * (val / 100)))} // Simplified logic for mock
                                                >
                                                    {tradeType === 'BUY' ? `${val} ◎` : `${val}%`}
                                                </Button>
                                            ))}
                                        </Grid>

                                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0' }}>
                                            <div style={{ background: '#333', borderRadius: '50%', padding: 4 }}>
                                                <ChevronDown size={14} color="#888" />
                                            </div>
                                        </Box>

                                        <Box style={{ background: '#1a1a1f', padding: 12, borderRadius: 8, border: '1px solid #333' }}>
                                            <Flex justify="between" align="center" mb="2">
                                                <Text size="1" color="gray" weight="bold">RECEIVING</Text>
                                            </Flex>
                                            <Flex justify="between" align="center">
                                                <input
                                                    readOnly
                                                    style={{ background: 'transparent', border: 'none', color: '#888', fontSize: 24, width: '100%', outline: 'none', fontFamily: 'monospace', fontWeight: 'bold' }}
                                                    value={estimatedOutput ? estimatedOutput.toFixed(4) : '0.00'}
                                                />
                                                <Badge size="2" color="gray" variant="surface">{tradeType === 'BUY' ? activeToken.symbol : 'SUI'}</Badge>
                                            </Flex>
                                        </Box>

                                        {/* ACTION BUTTON */}
                                        <Button size="4" style={{
                                            width: '100%',
                                            marginTop: 8,
                                            background: tradeType === 'BUY' ? '#00ff88' : '#ff0055',
                                            color: 'black',
                                            fontWeight: '900',
                                            cursor: 'pointer',
                                            height: 54,
                                            fontSize: 18,
                                            boxShadow: tradeType === 'BUY' ? '0 0 20px rgba(0,255,136,0.3)' : '0 0 20px rgba(255,0,85,0.3)'
                                        }}>
                                            {tradeType === 'BUY' ? `BUY ${activeToken.symbol}` : `SELL ${activeToken.symbol}`}
                                        </Button>

                                        {/* SLIPPAGE & ROUTE INFO */}
                                        <Flex direction="column" gap="2" style={{ marginTop: 8, padding: '12px', background: '#ffffff05', borderRadius: 6 }}>
                                            <Flex justify="between">
                                                <Text size="1" color="gray">Price Impact</Text>
                                                <Text size="1" color="green">~0.05%</Text>
                                            </Flex>
                                            <Flex justify="between">
                                                <Text size="1" color="gray">Min Received</Text>
                                                <Text size="1" style={{ fontFamily: 'monospace' }}>
                                                    {estimatedOutput ? (estimatedOutput * (1 - slippage / 100)).toFixed(4) : '0.00'} {tradeType === 'BUY' ? activeToken.symbol : 'SUI'}
                                                </Text>
                                            </Flex>
                                            <Flex justify="between">
                                                <Text size="1" color="gray">Network Fee</Text>
                                                <Text size="1" style={{ fontFamily: 'monospace' }}>0.004 SUI</Text>
                                            </Flex>
                                        </Flex>
                                    </Flex>
                                </motion.div>
                            ) : (
                                <motion.div key="vault" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <Flex direction="column" gap="4" align="center" style={{ textAlign: 'center', marginTop: 40 }}>
                                        <div style={{ fontSize: 60, marginBottom: 20 }}>🛡️</div>
                                        <Text weight="bold" size="5">Degen Safe</Text>
                                        <Text size="2" color="gray" style={{ lineHeight: 1.5 }}>
                                            Profits moved here are simulated as "banked" and cannot be used for betting until withdrawn.
                                        </Text>

                                        <Card style={{ width: '100%', padding: 24, background: '#ffffff05', marginTop: 24, border: '1px solid #00f3ff40' }}>
                                            <Text size="2" color="gray">SAFE BALANCE</Text>
                                            <Text size="8" weight="bold" style={{ color: '#00f3ff', fontFamily: 'monospace', margin: '16px 0', display: 'block' }}>$5,000</Text>
                                            <Badge color="cyan" variant="solid" size="2">SECURED</Badge>
                                        </Card>

                                        <Button size="3" style={{ width: '100%', background: '#00f3ff', color: 'black', cursor: 'pointer', fontWeight: 'bold' }}>
                                            DEPOSIT PROFITS
                                        </Button>
                                        <Button size="3" variant="soft" color="ruby" style={{ width: '100%', cursor: 'pointer' }}>
                                            UNLOCK FUNDS
                                        </Button>
                                    </Flex>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>
                </Flex>
            )}
        </Flex>
    );
};
