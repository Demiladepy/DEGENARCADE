
import axios from 'axios';

// INTERFACES
export interface SportParams {
    sportKey?: string; // e.g. 'upcoming', 'soccer_epl'
    regions?: string;  // 'us', 'uk', 'eu', 'au'
    markets?: string;  // 'h2h', 'spreads', 'totals'
}

export interface MatchData {
    id: string;
    team1: string;
    team2: string;
    score1: number;
    score2: number;
    time: string;
    status: 'LIVE' | 'UPCOMING' | 'FINISHED';
    league: string;
    odds?: {
        home: number;
        away: number;
        draw?: number;
    };
    startTime?: string;
}

// CONFIG
const API_KEY = import.meta.env.VITE_ODDS_API_KEY || ''; // User must set this in .env
const BASE_URL = 'https://api.the-odds-api.com/v4/sports';

// MOCK DATA GENERATOR (Fallback)
const generateMockMatches = (): MatchData[] => {
    return [
        {
            id: 'liv-bha-live',
            team1: 'Liverpool',
            team2: 'Brighton',
            score1: Math.floor(Math.random() * 3), // Dynamic-ish
            score2: Math.floor(Math.random() * 2),
            time: '74:30',
            status: 'LIVE',
            league: 'Premier League',
            odds: { home: 1.45, away: 6.50, draw: 4.20 }
        },
        {
            id: 'nba-lakers',
            team1: 'Lakers',
            team2: 'Warriors',
            score1: 112,
            score2: 108,
            time: 'Q4 02:15',
            status: 'LIVE',
            league: 'NBA',
            odds: { home: 1.80, away: 2.05 }
        },
        {
            id: 'nfl-chiefs',
            team1: 'Chiefs',
            team2: 'Bills',
            score1: 0,
            score2: 0,
            time: 'Upcoming',
            status: 'UPCOMING',
            league: 'NFL',
            startTime: new Date(Date.now() + 86400000).toISOString(),
            odds: { home: 1.60, away: 2.40 }
        }
    ];
};

export const SportsDataService = {
    /**
     * Fetch Live/Upcoming odds from The Odds API
     */
    async getMatches(params: SportParams = {}): Promise<MatchData[]> {
        if (!API_KEY) {
            console.warn("SportsDataService: No API Key found. Using Mock Data.");
            return generateMockMatches();
        }

        try {
            const sportKey = params.sportKey || 'upcoming';
            const regions = params.regions || 'us';
            const markets = params.markets || 'h2h';

            const response = await axios.get(`${BASE_URL}/${sportKey}/odds`, {
                params: {
                    apiKey: API_KEY,
                    regions,
                    markets,
                    oddsFormat: 'decimal'
                }
            });

            // TRANSFORM API RESPONSE TO APP FORMAT
            return response.data.map((item: any) => {
                const bookmaker = item.bookmakers[0];
                const market = bookmaker?.markets[0]; // h2h usually
                const outcomeHome = market?.outcomes?.find((o: any) => o.name === item.home_team);
                const outcomeAway = market?.outcomes?.find((o: any) => o.name === item.away_team);
                const outcomeDraw = market?.outcomes?.find((o: any) => o.name === 'Draw');

                return {
                    id: item.id,
                    team1: item.home_team,
                    team2: item.away_team,
                    score1: 0, // API doesn't always strictly give scores in free tier odds endpoint, usually need separate 'scores' endpoint
                    score2: 0,
                    time: new Date(item.commence_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: new Date(item.commence_time) < new Date() ? 'LIVE' : 'UPCOMING',
                    league: item.sport_title,
                    odds: {
                        home: outcomeHome?.price || 1.0,
                        away: outcomeAway?.price || 1.0,
                        draw: outcomeDraw?.price
                    },
                    startTime: item.commence_time
                };
            }).slice(0, 10); // Limit to 10 for demo

        } catch (error) {
            console.error("SportsDataService Error:", error);
            return generateMockMatches();
        }
    }
};
