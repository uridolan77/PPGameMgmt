import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gameService, bonusService } from '../services';

const GameDetail = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [relatedBonuses, setRelatedBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true);
        const [gameData, bonusesData] = await Promise.all([
          gameService.getGame(id),
          bonusService.getAllBonuses(null, null, id) // Fetching bonuses related to this game
        ]);
        
        setGame(gameData);
        setRelatedBonuses(bonusesData);
        setError(null);
      } catch (err) {
        setError(`Error loading game: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGameData();
    }
  }, [id]);

  if (loading) return <div className="loading">Loading game details...</div>;
  
  if (error) return <div className="error-message">{error}</div>;
  
  if (!game) return <div className="not-found">Game not found</div>;

  return (
    <div className="game-detail">
      <div className="game-header">
        <h1>{game.name}</h1>
        <div className="game-badges">
          <span className="badge game-type">{game.type}</span>
          <span className="badge game-category">{game.category}</span>
          {game.isNew && <span className="badge new">New</span>}
          {game.isPopular && <span className="badge popular">Popular</span>}
        </div>
      </div>
      
      <div className="game-content">
        <div className="game-main">
          <div className="game-image-large" style={{ backgroundColor: getRandomColor() }}>
            {game.name.charAt(0)}
          </div>
          
          <div className="game-description">
            <h2>Game Description</h2>
            <p>{game.description || "No description available for this game."}</p>
          </div>
          
          <div className="game-stats">
            <h2>Game Statistics</h2>
            <table>
              <tbody>
                <tr>
                  <th>Provider</th>
                  <td>{game.provider}</td>
                </tr>
                <tr>
                  <th>RTP</th>
                  <td>{game.rtp ? `${game.rtp}%` : 'N/A'}</td>
                </tr>
                <tr>
                  <th>Volatility</th>
                  <td>{game.volatility || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Release Date</th>
                  <td>{game.releaseDate ? new Date(game.releaseDate).toLocaleDateString() : 'N/A'}</td>
                </tr>
                <tr>
                  <th>Min Bet</th>
                  <td>{game.minBet ? `$${game.minBet}` : 'N/A'}</td>
                </tr>
                <tr>
                  <th>Max Bet</th>
                  <td>{game.maxBet ? `$${game.maxBet}` : 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="game-sidebar">
          <div className="game-actions">
            <Link to={`/games/edit/${game.id}`} className="button edit-button">Edit Game</Link>
          </div>
          
          <div className="related-bonuses">
            <h2>Related Bonuses</h2>
            {relatedBonuses.length > 0 ? (
              <ul className="bonus-list">
                {relatedBonuses.map(bonus => (
                  <li key={bonus.id}>
                    <Link to={`/bonuses/${bonus.id}`}>{bonus.name}</Link>
                    <span className="bonus-value">${bonus.amount}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No bonuses available for this game</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for random color generation
function getRandomColor() {
  const colors = [
    '#3a86ff', '#8338ec', '#ff006e', '#fb5607', '#ffbe0b',
    '#06d6a0', '#118ab2', '#ef476f', '#073b4c', '#540d6e'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default GameDetail;