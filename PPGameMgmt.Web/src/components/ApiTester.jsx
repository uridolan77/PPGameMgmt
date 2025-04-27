import { useState } from 'react';
import { playerService, gameService, bonusService, recommendationService } from '../services';

const ApiTester = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [selectedTest, setSelectedTest] = useState('players');
  const [playerId, setPlayerId] = useState('');
  const [gameId, setGameId] = useState('');
  const [bonusId, setBonusId] = useState('');

  const handleRunTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      let data;
      
      switch (selectedTest) {
        case 'players':
          data = await playerService.getAllPlayers();
          break;
        case 'player':
          if (!playerId) throw new Error('Player ID is required');
          data = await playerService.getPlayer(playerId);
          break;
        case 'games':
          data = await gameService.getAllGames();
          break;
        case 'popularGames':
          data = await gameService.getPopularGames();
          break;
        case 'bonuses':
          data = await bonusService.getAllBonuses();
          break;
        case 'playerBonuses':
          if (!playerId) throw new Error('Player ID is required');
          data = await bonusService.getPlayerBonuses(playerId);
          break;
        case 'gameRecommendations':
          if (!playerId) throw new Error('Player ID is required');
          data = await recommendationService.getGameRecommendations(playerId);
          break;
        default:
          throw new Error('Invalid test selected');
      }
      
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="api-tester">
      <h1>API Tester</h1>
      
      <div className="form-group">
        <label>Select API to Test:</label>
        <select 
          value={selectedTest} 
          onChange={(e) => setSelectedTest(e.target.value)}
        >
          <option value="players">Get All Players</option>
          <option value="player">Get Player by ID</option>
          <option value="games">Get All Games</option>
          <option value="popularGames">Get Popular Games</option>
          <option value="bonuses">Get All Bonuses</option>
          <option value="playerBonuses">Get Player's Bonuses</option>
          <option value="gameRecommendations">Get Game Recommendations</option>
        </select>
      </div>
      
      {(selectedTest === 'player' || selectedTest === 'playerBonuses' || selectedTest === 'gameRecommendations') && (
        <div className="form-group">
          <label>Player ID:</label>
          <input 
            type="text" 
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            placeholder="Enter player ID"
          />
        </div>
      )}
      
      <button 
        onClick={handleRunTest}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Run Test'}
      </button>
      
      {error && (
        <div className="error-panel">
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="result-panel">
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ApiTester;