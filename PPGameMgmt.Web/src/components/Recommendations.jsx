import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recommendationService, playerService } from '../services';

const Recommendations = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [gameRecommendations, setGameRecommendations] = useState([]);
  const [bonusRecommendation, setBonusRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load players for selection
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const data = await playerService.getAllPlayers();
        setPlayers(data);
        setError(null);
      } catch (err) {
        setError(`Error loading players: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  // Load recommendations when a player is selected
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!selectedPlayer) return;
      
      try {
        setRecommendationsLoading(true);
        
        // Get both game and bonus recommendations in parallel
        const [gamesData, bonusData] = await Promise.all([
          recommendationService.getGameRecommendations(selectedPlayer),
          recommendationService.getBonusRecommendation(selectedPlayer).catch(err => {
            // Return null if no bonus recommendation is found
            if (err.message.includes('404')) return null;
            throw err;
          })
        ]);
        
        setGameRecommendations(gamesData);
        setBonusRecommendation(bonusData);
        setError(null);
      } catch (err) {
        setError(`Error loading recommendations: ${err.message}`);
      } finally {
        setRecommendationsLoading(false);
      }
    };

    if (selectedPlayer) {
      fetchRecommendations();
    } else {
      // Clear recommendations when no player is selected
      setGameRecommendations([]);
      setBonusRecommendation(null);
    }
  }, [selectedPlayer]);

  const handlePlayerChange = (e) => {
    setSelectedPlayer(e.target.value);
  };

  const handleRecordClick = async (recommendationId) => {
    try {
      await recommendationService.recordClick(recommendationId);
      // In a real app, you might want to update some UI state to reflect the click
    } catch (err) {
      console.error('Error recording recommendation click:', err);
      // Consider showing a toast notification for errors
    }
  };

  const handleRecordAcceptance = async (recommendationId) => {
    try {
      await recommendationService.recordAcceptance(recommendationId);
      // In a real app, you might want to update some UI state to reflect the acceptance
    } catch (err) {
      console.error('Error recording recommendation acceptance:', err);
      // Consider showing a toast notification for errors
    }
  };

  return (
    <div className="recommendations-container">
      <h1>Personalized Recommendations</h1>
      
      {loading ? (
        <div className="loading">Loading players...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="recommendations-content">
          <div className="player-selection">
            <label htmlFor="player-select">Select a Player:</label>
            <select 
              id="player-select"
              value={selectedPlayer}
              onChange={handlePlayerChange}
            >
              <option value="">-- Select Player --</option>
              {players.map(player => (
                <option key={player.id} value={player.id}>
                  {player.username} ({player.segment})
                </option>
              ))}
            </select>
          </div>

          {selectedPlayer && (
            <div className="recommendations-panel">
              {recommendationsLoading ? (
                <div className="loading">Loading recommendations...</div>
              ) : (
                <>
                  <div className="game-recommendations">
                    <h2>Recommended Games</h2>
                    {gameRecommendations.length > 0 ? (
                      <div className="rec-cards">
                        {gameRecommendations.map(rec => (
                          <div key={rec.id} className="recommendation-card">
                            <div className="rec-game-name">{rec.gameName}</div>
                            <div className="rec-score">Match Score: {(rec.score * 100).toFixed(0)}%</div>
                            <div className="rec-reason">{rec.recommendationReason}</div>
                            <div className="rec-actions">
                              <Link 
                                to={`/games/${rec.gameId}`}
                                onClick={() => handleRecordClick(rec.id)}
                                className="view-game-link"
                              >
                                View Game
                              </Link>
                              <button 
                                onClick={() => handleRecordAcceptance(rec.id)}
                                className="accept-rec-button"
                              >
                                Accept
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No game recommendations found for this player</p>
                    )}
                  </div>

                  <div className="bonus-recommendation">
                    <h2>Recommended Bonus</h2>
                    {bonusRecommendation ? (
                      <div className="bonus-rec-card">
                        <div className="bonus-rec-header">
                          <h3>{bonusRecommendation.bonusName}</h3>
                          <span className="bonus-amount">${bonusRecommendation.bonusAmount}</span>
                        </div>
                        <div className="bonus-rec-type">Type: {bonusRecommendation.bonusType}</div>
                        <div className="bonus-rec-reason">{bonusRecommendation.recommendationReason}</div>
                        <div className="bonus-rec-score">Match Score: {(bonusRecommendation.score * 100).toFixed(0)}%</div>
                        <div className="bonus-rec-actions">
                          <Link 
                            to={`/bonuses/${bonusRecommendation.bonusId}`}
                            onClick={() => handleRecordClick(bonusRecommendation.id)}
                            className="view-bonus-link"
                          >
                            View Details
                          </Link>
                          <button 
                            onClick={() => handleRecordAcceptance(bonusRecommendation.id)}
                            className="accept-rec-button"
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p>No bonus recommendations found for this player</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {!selectedPlayer && (
            <div className="no-selection-message">
              <p>Select a player to view personalized recommendations</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Recommendations;