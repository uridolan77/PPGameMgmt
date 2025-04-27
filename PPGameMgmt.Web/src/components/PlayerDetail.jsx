import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { playerService, bonusService, recommendationService } from '../services';

const PlayerDetail = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [playerValue, setPlayerValue] = useState(null);
  const [isActive, setIsActive] = useState(null);
  const [bonuses, setBonuses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        const [playerData, valueData, activeData, bonusesData, gameRecs] = await Promise.all([
          playerService.getPlayer(id),
          playerService.getPlayerValue(id),
          playerService.isPlayerActive(id),
          bonusService.getPlayerBonuses(id),
          recommendationService.getGameRecommendations(id)
        ]);
        
        setPlayer(playerData);
        setPlayerValue(valueData.value);
        setIsActive(activeData.isActive);
        setBonuses(bonusesData);
        setRecommendations(gameRecs);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlayerData();
    }
  }, [id]);

  if (loading) return <div className="loading">Loading player data...</div>;
  
  if (error) return <div className="error-message">Error: {error}</div>;
  
  if (!player) return <div className="not-found">Player not found</div>;

  return (
    <div className="player-detail">
      <h1>{player.username}</h1>
      <div className="player-status">
        <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
        <span className="segment-badge">{player.segment}</span>
      </div>
      
      <div className="player-grid">
        <div className="player-info">
          <h2>Player Information</h2>
          <table>
            <tbody>
              <tr>
                <th>ID</th>
                <td>{player.id}</td>
              </tr>
              <tr>
                <th>Email</th>
                <td>{player.email}</td>
              </tr>
              <tr>
                <th>Country</th>
                <td>{player.country}</td>
              </tr>
              <tr>
                <th>Registration Date</th>
                <td>{new Date(player.registrationDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <th>Last Login</th>
                <td>{new Date(player.lastLoginDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <th>Player Value</th>
                <td>${playerValue ? playerValue.toFixed(2) : '0.00'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="player-recommendations">
          <h2>Game Recommendations</h2>
          {recommendations.length > 0 ? (
            <ul className="rec-list">
              {recommendations.map(rec => (
                <li key={rec.gameId} className="rec-item">
                  <div className="rec-name">{rec.gameName}</div>
                  <div className="rec-score">Score: {(rec.score * 100).toFixed(0)}%</div>
                  <div className="rec-reason">{rec.recommendationReason}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recommendations available</p>
          )}
        </div>
        
        <div className="player-bonuses">
          <h2>Bonuses</h2>
          {bonuses.length > 0 ? (
            <table className="bonus-table">
              <thead>
                <tr>
                  <th>Bonus</th>
                  <th>Claimed Date</th>
                  <th>Status</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {bonuses.map(bonus => (
                  <tr key={bonus.id}>
                    <td>{bonus.bonusType}</td>
                    <td>{new Date(bonus.claimedDate).toLocaleDateString()}</td>
                    <td>{bonus.status}</td>
                    <td>${bonus.bonusValue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No bonuses claimed</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerDetail;