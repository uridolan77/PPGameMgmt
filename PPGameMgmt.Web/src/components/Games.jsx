import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gameService } from '../services';

const Games = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    searchTerm: ''
  });

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        let data;
        
        if (filters.searchTerm) {
          data = await gameService.searchGames(filters.searchTerm);
        } else if (filters.type || filters.category) {
          data = await gameService.getAllGames(
            filters.type || null,
            filters.category || null
          );
        } else {
          data = await gameService.getAllGames();
        }
        
        setGames(data);
        setError(null);
      } catch (err) {
        setError(`Error loading games: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already triggered by the useEffect when filters change
  };

  return (
    <div className="games-container">
      <h1>Games</h1>
      
      <div className="filter-controls">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="type-filter">Game Type:</label>
            <select 
              id="type-filter"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="Slot">Slots</option>
              <option value="Table">Table Games</option>
              <option value="LiveDealer">Live Dealer</option>
              <option value="Poker">Poker</option>
              <option value="Bingo">Bingo</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="category-filter">Category:</label>
            <select 
              id="category-filter"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              <option value="Featured">Featured</option>
              <option value="New">New</option>
              <option value="Popular">Popular</option>
              <option value="ClassicSlots">Classic Slots</option>
              <option value="VideoSlots">Video Slots</option>
              <option value="JackpotGames">Jackpot Games</option>
            </select>
          </div>
        </div>
        
        <div className="search-row">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search games..."
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleFilterChange}
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </div>

      {loading && <div className="loading">Loading games...</div>}
      
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && (
        <div className="games-grid">
          {games.length === 0 ? (
            <p>No games found</p>
          ) : (
            games.map(game => (
              <div key={game.id} className="game-card">
                <div className="game-image-placeholder" style={{ backgroundColor: getRandomColor() }}>
                  {game.name.charAt(0)}
                </div>
                <div className="game-info">
                  <h3>{game.name}</h3>
                  <div className="game-meta">
                    <span className="game-type">{game.type}</span>
                    <span className="game-category">{game.category}</span>
                  </div>
                  <div className="game-provider">{game.provider}</div>
                  <div className="game-actions">
                    <Link to={`/games/${game.id}`}>View Details</Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="action-bar">
        <Link to="/games/new" className="button create-button">Add New Game</Link>
      </div>
    </div>
  );
};

// Helper function to generate a random color for game placeholders
function getRandomColor() {
  const colors = [
    '#3a86ff', '#8338ec', '#ff006e', '#fb5607', '#ffbe0b',
    '#06d6a0', '#118ab2', '#ef476f', '#073b4c', '#540d6e'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default Games;