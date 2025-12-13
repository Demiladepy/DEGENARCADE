
// MOCK DATA for Market Terminal
export interface TokenData {
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    volume: string;
    marketCap: string;
    chartData: number[]; // Simple array for sparklines
    balance: number; // User balance
}

const INITIAL_TOKENS: TokenData[] = [
    { symbol: 'SUI', name: 'Sui', price: 1.85, change24h: 5.2, volume: '400M', marketCap: '2.1B', chartData: [], balance: 50 },
    { symbol: 'FUD', name: 'Fud the Pug', price: 0.00000042, change24h: 12.5, volume: '2M', marketCap: '15M', chartData: [], balance: 10000000 },
    { symbol: 'BLUB', name: 'Blub Fish', price: 0.0000012, change24h: -4.3, volume: '800K', marketCap: '8M', chartData: [], balance: 0 },
    { symbol: 'SCUBA', name: 'Scuba Dog', price: 0.032, change24h: 22.1, volume: '500K', marketCap: '2M', chartData: [], balance: 0 },
    { symbol: 'HIPPO', name: 'Sudeng', price: 0.012, change24h: -1.2, volume: '5M', marketCap: '120M', chartData: [], balance: 500 }
];

// Generate fake chart history
INITIAL_TOKENS.forEach(t => {
    let price = t.price;
    for (let i = 0; i < 20; i++) {
        price = price * (1 + (Math.random() - 0.5) * 0.1);
        t.chartData.push(price);
    }
});

export const MarketService = {
    getTokens: async (): Promise<TokenData[]> => {
        return new Promise(resolve => setTimeout(() => resolve(INITIAL_TOKENS), 100));
    },

    // Simulate live updates
    getLiveUpdates: () => {
        return INITIAL_TOKENS.map(t => {
            const change = (Math.random() - 0.5) * 0.02; // Small fluctuation
            t.price = t.price * (1 + change);
            t.chartData.shift();
            t.chartData.push(t.price);
            return { ...t };
        });
    }
};
