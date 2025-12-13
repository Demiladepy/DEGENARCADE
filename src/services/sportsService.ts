// INTERFACES
export interface MarketOption {
    label: string;
    price: number;
    change?: 'up' | 'down' | 'none'; // For UI flashing
}

export interface MatchData {
    id: string;
    sport: string;
    team1: string;
    team2: string;
    score1: number | string; // String for tennis (e.g. "6-4, 2-1")
    score2: number | string;
    time: string;
    status: 'LIVE' | 'UPCOMING' | 'FINISHED' | 'HALFTIME';
    league: string;
    leagueLogo?: string;
    isHot?: boolean; // Featured match
    markets: {
        h2h: MarketOption[]; // Changed from tuple to array to support 2-way markets
        doubleChance?: MarketOption[];
        overUnder25?: MarketOption[];
        btts?: MarketOption[];
    };
}

// REALISTIC MOCK DATA GENERATOR
const LEAGUES_DATA: Record<string, any[]> = {
    'Soccer': [
        { name: 'Premier League', country: 'England', teams: ['Arsenal', 'Aston Villa', 'Liverpool', 'Man City', 'Man Utd', 'Chelsea', 'Spurs', 'Newcastle'] },
        { name: 'La Liga', country: 'Spain', teams: ['Real Madrid', 'Barcelona', 'Atletico', 'Sevilla', 'Valencia', 'Betis'] },
        { name: 'Serie A', country: 'Italy', teams: ['Inter', 'Milan', 'Juventus', 'Napoli', 'Roma', 'Lazio'] },
        { name: 'Champions League', country: 'Europe', teams: ['Bayern', 'PSG', 'Real Madrid', 'Man City', 'Inter', 'Arsenal'] }
    ],
    'Basketball': [
        { name: 'NBA', country: 'USA', teams: ['Lakers', 'Warriors', 'Celtics', 'Heat', 'Bulls', 'Nets', 'Suns', 'Bucks'] },
        { name: 'EuroLeague', country: 'Europe', teams: ['Real Madrid', 'Barcelona', 'Olympiacos', 'Panathinaikos', 'Efes', 'Fenerbahce'] }
    ],
    'Tennis': [
        { name: 'ATP Tour', country: 'Global', teams: ['Djokovic', 'Alcaraz', 'Sinner', 'Medvedev', 'Zverev', 'Nadal', 'Murray'] },
        { name: 'WTA Tour', country: 'Global', teams: ['Swiatek', 'Sabalenka', 'Gauff', 'Rybakina', 'Pegula', 'Jabeur'] }
    ]
};

// Helper to generate realistic odds
const getOdds = (prob: number) => {
    const raw = (1 / prob) * 0.95; // 5% vig
    return Number(Math.max(1.01, raw).toFixed(2));
};

// Cache per sport
let CACHED_MATCHES: Record<string, MatchData[]> = {};

const generateRichMockMatches = (sport: string): MatchData[] => {
    const cache = CACHED_MATCHES[sport];

    // Update existing live matches
    if (cache && cache.length > 0) {
        return cache.map(match => {
            // 20% chance to update odds or scores
            if (Math.random() > 0.8 && match.status === 'LIVE') {
                const fluctuate = (price: number) => {
                    const change = (Math.random() - 0.5) * 0.1;
                    const newPrice = Number(Math.max(1.01, price + change).toFixed(2));
                    return { val: newPrice, dir: change > 0 ? 'up' : 'down' };
                };

                // Shallow update h2h prices
                const newMarkets = { ...match.markets };
                newMarkets.h2h = newMarkets.h2h.map(m => {
                    const fluc = fluctuate(m.price);
                    return { ...m, price: fluc.val, change: fluc.dir as any };
                });

                // Randomly update score occasionally
                let s1: any = match.score1;
                let s2: any = match.score2;
                if (Math.random() > 0.95) {
                    if (sport === 'Soccer') {
                        if (Math.random() > 0.5) s1 = (s1 as number) + 1; else s2 = (s2 as number) + 1;
                    } else if (sport === 'Basketball') {
                        if (Math.random() > 0.5) s1 = (s1 as number) + 2; else s2 = (s2 as number) + 3;
                    }
                    // Tennis score updates are too complex to mock simply, skipping for now
                }

                return {
                    ...match,
                    score1: s1,
                    score2: s2,
                    markets: newMarkets
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
    const leagues = LEAGUES_DATA[sport] || LEAGUES_DATA['Soccer'];

    // Generate 10 matches
    for (let i = 0; i < 10; i++) {
        const league = leagues[Math.floor(Math.random() * leagues.length)];
        const t1 = league.teams[Math.floor(Math.random() * league.teams.length)];
        let t2 = league.teams[Math.floor(Math.random() * league.teams.length)];
        while (t1 === t2) t2 = league.teams[Math.floor(Math.random() * league.teams.length)];

        const isLive = i < 4; // First 4 are live
        const baseProb = 0.3 + Math.random() * 0.4; // Home win prob

        // SCORE LOGIC
        let score1: number | string = 0;
        let score2: number | string = 0;

        if (sport === 'Soccer') {
            score1 = isLive ? Math.floor(Math.random() * 3) : 0;
            score2 = isLive ? Math.floor(Math.random() * 2) : 0;
        } else if (sport === 'Basketball') {
            score1 = isLive ? 80 + Math.floor(Math.random() * 30) : 0;
            score2 = isLive ? 80 + Math.floor(Math.random() * 30) : 0;
        } else if (sport === 'Tennis') {
            score1 = isLive ? "1" : "0";
            score2 = isLive ? "0" : "0";
        }

        // MARKET LOGIC
        const h2h = [];
        if (sport === 'Soccer') {
            h2h.push({ label: '1', price: getOdds(baseProb) });
            h2h.push({ label: 'X', price: getOdds(0.25) });
            h2h.push({ label: '2', price: getOdds(1 - baseProb - 0.25) });
        } else {
            // 2-way for others
            h2h.push({ label: t1.substring(0, 3).toUpperCase(), price: getOdds(baseProb) });
            h2h.push({ label: t2.substring(0, 3).toUpperCase(), price: getOdds(1 - baseProb) });
        }

        matches.push({
            id: `match-${sport}-${i}-${Date.now()}`,
            sport,
            team1: t1,
            team2: t2,
            league: league.name,
            score1,
            score2,
            time: isLive ? (sport === 'Soccer' ? `${Math.floor(Math.random() * 90)}'` : sport === 'Basketball' ? 'Q3 04:20' : 'Set 2') : '20:00',
            status: isLive ? 'LIVE' : 'UPCOMING',
            isHot: i === 0,
            markets: {
                h2h,
                // Only Soccer gets these for now
                overUnder25: sport === 'Soccer' ? [
                    { label: 'Over', price: 1.85 },
                    { label: 'Under', price: 1.95 }
                ] : [],
                btts: sport === 'Soccer' ? [
                    { label: 'Yes', price: 1.70 },
                    { label: 'No', price: 2.15 }
                ] : []
            }
        });
    }

    CACHED_MATCHES[sport] = matches;
    return matches;
};

export const SportsDataService = {
    async getMatches(sport: string = 'Soccer'): Promise<MatchData[]> {
        // Return rich mock data immediately for instant UX
        return new Promise((resolve) => {
            setTimeout(() => resolve(generateRichMockMatches(sport)), 200);
        });
    }
};

