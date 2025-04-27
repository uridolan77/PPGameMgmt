import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bonusService } from '../services';

const Bonuses = () => {
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    segment: '',
    gameId: ''
  });

  useEffect(() => {
    const fetchBonuses = async () => {
      try {
        setLoading(true);
        const data = await bonusService.getAllBonuses(
          filters.type || null,
          filters.segment || null,
          filters.gameId || null
        );
        
        setBonuses(data);
        setError(null);
      } catch (err) {
        setError(`Error loading bonuses: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBonuses();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bonuses-container">
      <h1>Bonuses</h1>
      
      <div className="filter-controls">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="type-filter">Bonus Type:</label>
            <select 
              id="type-filter"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="Welcome">Welcome</option>
              <option value="Deposit">Deposit</option>
              <option value="NoDeposit">No Deposit</option>
              <option value="Cashback">Cashback</option>
              <option value="Reload">Reload</option>
              <option value="FreeSpins">Free Spins</option>
              <option value="Loyalty">Loyalty</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="segment-filter">Player Segment:</label>
            <select 
              id="segment-filter"
              name="segment"
              value={filters.segment}
              onChange={handleFilterChange}
            >
              <option value="">All Segments</option>
              <option value="HighRoller">High Rollers</option>
              <option value="Casual">Casual Players</option>
              <option value="New">New Players</option>
              <option value="Churn">At Risk / Churn</option>
              <option value="Loyal">Loyal Players</option>
            </select>
          </div>
        </div>
      </div>

      {loading && <div className="loading">Loading bonuses...</div>}
      
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && (
        <div className="bonuses-list">
          {bonuses.length === 0 ? (
            <p>No bonuses found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Player Segment</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bonuses.map(bonus => (
                  <tr key={bonus.id} className={isExpired(bonus) ? 'expired' : isActive(bonus) ? 'active' : ''}>
                    <td>{bonus.name}</td>
                    <td>{bonus.type}</td>
                    <td>${bonus.amount}</td>
                    <td>{bonus.targetPlayerSegment}</td>
                    <td>{formatDate(bonus.startDate)}</td>
                    <td>{formatDate(bonus.endDate)}</td>
                    <td>
                      <span className={`status-badge ${getBonusStatusClass(bonus)}`}>
                        {getBonusStatus(bonus)}
                      </span>
                    </td>
                    <td>
                      <Link to={`/bonuses/${bonus.id}`}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          <div className="action-bar">
            <Link to="/bonuses/new" className="button create-button">Create New Bonus</Link>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
}

function isExpired(bonus) {
  if (!bonus.endDate) return false;
  return new Date(bonus.endDate) < new Date();
}

function isActive(bonus) {
  const now = new Date();
  const startDate = bonus.startDate ? new Date(bonus.startDate) : null;
  const endDate = bonus.endDate ? new Date(bonus.endDate) : null;
  
  return (!startDate || startDate <= now) && (!endDate || endDate >= now);
}

function getBonusStatus(bonus) {
  if (isExpired(bonus)) return 'Expired';
  if (isActive(bonus)) return 'Active';
  return 'Scheduled';
}

function getBonusStatusClass(bonus) {
  if (isExpired(bonus)) return 'expired';
  if (isActive(bonus)) return 'active';
  return 'scheduled';
}

export default Bonuses;