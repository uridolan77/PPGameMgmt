import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { playerService, gameService, bonusService, recommendationService } from '../services';

const Home = () => {
  const [stats, setStats] = useState({
    playerCount: 0,
    gameCount: 0,
    activeBonus: 0,
    recommendationEngagementRate: 0
  });
  const [popularGames, setPopularGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch summary statistics (in a real app, you might have a dedicated endpoint for this)
        const [players, games, bonuses, popularGamesData] = await Promise.all([
          playerService.getAllPlayers(),
          gameService.getAllGames(),
          bonusService.getAllBonuses(),
          gameService.getPopularGames(5)
        ]);
        
        // Calculate current active bonuses (those that haven't expired)
        const now = new Date();
        const activeBonusCount = bonuses.filter(bonus => {
          const endDate = bonus.endDate ? new Date(bonus.endDate) : null;
          return !endDate || endDate >= now;
        }).length;
        
        // Set dashboard statistics
        setStats({
          playerCount: players.length,
          gameCount: games.length,
          activeBonus: activeBonusCount,
          recommendationEngagementRate: 0.65 // Simulated data - in production this would be a real calculation
        });
        
        setPopularGames(popularGamesData);
        setError(null);
      } catch (err) {
        setError(`Error loading dashboard data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="loading">Loading dashboard data...</div>;
  
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard">
      <h1>Game Management Dashboard</h1>
      
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <span className="stat-value">{stats.playerCount}</span>
            <span className="stat-label">Total Players</span>
          </div>
          <Link to="/players" className="stat-link">View All</Link>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎮</div>
          <div className="stat-content">
            <span className="stat-value">{stats.gameCount}</span>
            <span className="stat-label">Games</span>
          </div>
          <Link to="/games" className="stat-link">View All</Link>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎁</div>
          <div className="stat-content">
            <span className="stat-value">{stats.activeBonus}</span>
            <span className="stat-label">Active Bonuses</span>
          </div>
          <Link to="/bonuses" className="stat-link">View All</Link>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <span className="stat-value">{(stats.recommendationEngagementRate * 100).toFixed(1)}%</span>
            <span className="stat-label">Recommendation Rate</span>
          </div>
          <Link to="/recommendations" className="stat-link">Details</Link>
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Popular Games</h2>
            <Link to="/games" className="view-all">View All</Link>
          </div>
          
          {popularGames.length > 0 ? (
            <div className="popular-games">
              {popularGames.map(game => (
                <Link key={game.id} to={`/games/${game.id}`} className="popular-game-item">
                  <div className="game-name">{game.name}</div>
                  <div className="game-details">
                    <span className="game-type">{game.type}</span>
                    <span className="game-plays">{game.playCount || 'N/A'} plays</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p>No game data available</p>
          )}
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          
          <div className="quick-actions">
            <Link to="/games/new" className="quick-action-button">
              <span className="action-icon">➕</span>
              <span className="action-text">Add New Game</span>
            </Link>
            
            <Link to="/bonuses/new" className="quick-action-button">
              <span className="action-icon">🎁</span>
              <span className="action-text">Create Bonus</span>
            </Link>
            
            <Link to="/recommendations" className="quick-action-button">
              <span className="action-icon">🎯</span>
              <span className="action-text">Manage Recommendations</span>
            </Link>
            
            <Link to="/api-tester" className="quick-action-button">
              <span className="action-icon">🔧</span>
              <span className="action-text">API Tester</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;