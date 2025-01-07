import React from 'react';

interface LeaderboardProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ darkMode, toggleDarkMode }) => {
    return (
        <div className={darkMode ? 'dark-leaderboard' : 'light-leaderboard'}>
            <button onClick={toggleDarkMode}>Toggle Dark Mode</button>
            <h1>Leaderboard</h1>
        </div>
    );
};

export default Leaderboard;
