
import { useState, useEffect } from 'react';

export interface MatchData {
    id: string;
    team1: string;
    team2: string;
    score1: number;
    score2: number;
    time: string; // e.g. "45:00"
    status: 'LIVE' | 'UPCOMING' | 'FINISHED';
    league: string;
}

const INITIAL_MATCHES: MatchData[] = [
    {
        id: 'liv-bha',
        team1: 'Liverpool',
        team2: 'Brighton',
        score1: 1,
        score2: 0,
        time: '23:15',
        status: 'LIVE',
        league: 'Premier League'
    },
    {
        id: 'dota-finals',
        team1: 'Team Spirit',
        team2: 'Gaimin Gladiators',
        score1: 2,
        score2: 1,
        time: 'Game 4',
        status: 'LIVE',
        league: 'DOTA 2 International'
    },
    {
        id: 'nba-laker',
        team1: 'Lakers',
        team2: 'Warriors',
        score1: 88,
        score2: 86,
        time: 'Q3 04:20',
        status: 'LIVE',
        league: 'NBA'
    }
];

export const useLiveSportsData = () => {
    const [matches, setMatches] = useState<MatchData[]>(INITIAL_MATCHES);

    useEffect(() => {
        const interval = setInterval(() => {
            setMatches(prev => prev.map(match => {
                if (match.status !== 'LIVE') return match;

                // Simulate Football Time/Score
                if (match.league === 'Premier League') {
                    const [min, sec] = match.time.split(':').map(Number);
                    let newSec = sec + 1;
                    let newMin = min;
                    if (newSec >= 60) {
                        newSec = 0;
                        newMin += 1;
                    }

                    // Random goal chance
                    let s1 = match.score1;
                    let s2 = match.score2;
                    if (Math.random() > 0.99) s1++; // rare update
                    else if (Math.random() > 0.99) s2++;

                    return {
                        ...match,
                        score1: s1,
                        score2: s2,
                        time: `${newMin.toString().padStart(2, '0')}:${newSec.toString().padStart(2, '0')}`
                    };
                }

                return match;
            }));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return matches;
};
