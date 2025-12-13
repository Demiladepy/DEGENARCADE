
// INTERFACES
export interface MarketOption {
    label: string;
    price: number;
    change?: 'up' | 'down' | 'none'; // For UI flashing
}

export interface MatchData {
    id: string;
    team1: string;
    team2: string;
    score1: number;
    score2: number;
    time: string;
    status: 'LIVE' | 'UPCOMING' | 'FINISHED' | 'HALFTIME';
    league: string;
    leagueLogo?: string;
    isHot?: boolean; // Featured match
    markets: {
        h2h: [MarketOption, MarketOption, MarketOption]; // Home, Draw, Away
        doubleChance?: [MarketOption, MarketOption, MarketOption]; // 1X, 12, 2X
        overUnder25?: [MarketOption, MarketOption]; // Over, Under
        btts?: [MarketOption, MarketOption]; // Yes, No
    };
}

// REALISTIC MOCK DATA GENERATOR
const LEAGUES = [
    { name: 'Premier League', country: 'England', teams: ['Arsenal', 'Aston Villa', 'Liverpool', 'Man City', 'Man Utd', 'Chelsea', 'Spurs', 'Newcastle'] },
    { name: 'La Liga', country: 'Spain', teams: ['Real Madrid', 'Barcelona', 'Atletico', 'Sevilla', 'Valencia', 'Betis'] },
    { name: 'Serie A', country: 'Italy', teams: ['Inter', 'Milan', 'Juventus', 'Napoli', 'Roma', 'Lazio'] },
    { name: 'Champions League', country: 'Europe', teams: ['Bayern', 'PSG', 'Real Madrid', 'Man City', 'Inter', 'Arsenal'] }
];

// Helper to generate realistic odds
const getOdds = (prob: number) => {
    const raw = (1 / prob) * 0.95; // 5% vig
    return Number(raw.toFixed(2));
};

let CACHED_MATCHES: MatchData[] = [];

const generateRichMockMatches = (): MatchData[] => {
    // If we already have matches, just update their odds slightly to simulate live feed
    if (CACHED_MATCHES.length > 0) {
        return CACHED_MATCHES.map(match => {
            // 20% chance to update odds
            if (Math.random() > 0.8 && match.status === 'LIVE') {
                const fluctuate = (price: number) => {
                    const change = (Math.random() - 0.5) * 0.1;
                    const newPrice = Number(Math.max(1.01, price + change).toFixed(2));
                    return { val: newPrice, dir: change > 0 ? 'up' : 'down' };
                };

                // Update H2H
                const newHome = fluctuate(match.markets.h2h[0].price);
                const newAway = fluctuate(match.markets.h2h[2].price);

                return {
                    ...match,
                    markets: {
                        ...match.markets,
                        h2h: [
                            { label: '1', price: newHome.val, change: newHome.dir as any },
                            { label: 'X', price: match.markets.h2h[1].price, change: 'none' },
                            { label: '2', price: newAway.val, change: newAway.dir as any }
                        ]
                    }
                };
            }
            // Clear change flags
            return {
                ...match,
                markets: {
                    ...match.markets,
                    h2h: match.markets.h2h.map(m => ({ ...m, change: 'none' })) as any
                }
            };
        });
    }

    const matches: MatchData[] = [];

    // Generate 15 matches
    for (let i = 0; i < 15; i++) {
        const league = LEAGUES[Math.floor(Math.random() * LEAGUES.length)];
        const t1 = league.teams[Math.floor(Math.random() * league.teams.length)];
        let t2 = league.teams[Math.floor(Math.random() * league.teams.length)];
        while (t1 === t2) t2 = league.teams[Math.floor(Math.random() * league.teams.length)];

        const isLive = i < 5; // First 5 are live
        const baseProb = 0.3 + Math.random() * 0.4; // Random strength

        matches.push({
            id: `match-${i}-${Date.now()}`,
            team1: t1,
            team2: t2,
            league: league.name,
            score1: isLive ? Math.floor(Math.random() * 3) : 0,
            score2: isLive ? Math.floor(Math.random() * 2) : 0,
            time: isLive ? `${Math.floor(Math.random() * 90)}'` : '20:00',
            status: isLive ? 'LIVE' : 'UPCOMING',
            isHot: i === 0 || i === 6,
            markets: {
                h2h: [
                    { label: '1', price: getOdds(baseProb) },
                    { label: 'X', price: getOdds(0.25) },
                    { label: '2', price: getOdds(1 - baseProb - 0.25) }
                ],
                overUnder25: [
                    { label: 'Over', price: 1.85 },
                    { label: 'Under', price: 1.95 }
                ],
                btts: [
                    { label: 'Yes', price: 1.70 },
                    { label: 'No', price: 2.15 }
                ]
            }
        });
    }

    CACHED_MATCHES = matches;
    return matches;
};

export const SportsDataService = {
    async getMatches(): Promise<MatchData[]> {
        // Return rich mock data immediately for instant UX
        // In production, this would toggle to Real API
        return new Promise((resolve) => {
            setTimeout(() => resolve(generateRichMockMatches()), 200); // Tiny latency for realism
        });
    }
};

