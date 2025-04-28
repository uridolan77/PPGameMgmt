import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bonusService, playerService } from '../services';
import { formatDate, isExpired, isActive, getBonusStatus, getBonusStatusClass } from '../utils/bonusUtils';

const BonusDetail = () => {
  const { id } = useParams();
  const [bonus, setBonus] = useState(null);
  const [playerClaims, setPlayerClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    claimCount: 0,
    completedCount: 0,
    totalValue: 0
  });

  useEffect(() => {
    const fetchBonusData = async () => {
      try {
        setLoading(true);
        const bonusData = await bonusService.getBonus(id);
        setBonus(bonusData);
        
        // In a real app, you would have an endpoint to get claims for a bonus
        // Here we're simulating it with mock data
        const claimsData = []; // This would come from an API call
        setPlayerClaims(claimsData);
        
        // Calculate basic statistics
        if (claimsData.length) {
          const completedClaims = claimsData.filter(claim => claim.status === 'Completed');
          setStats({
            claimCount: claimsData.length,
            completedCount: completedClaims.length,
            totalValue: completedClaims.reduce((total, claim) => total + claim.bonusValue, 0)
          });
        }
        
        setError(null);
      } catch (err) {
        setError(`Error loading bonus: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBonusData();
    }
  }, [id]);

  if (loading) return <div className="loading">Loading bonus details...</div>;
  
  if (error) return <div className="error-message">{error}</div>;
  
  if (!bonus) return <div className="not-found">Bonus not found</div>;

  return (
    <div className="bonus-detail">
      <div className="bonus-header">
        <h1>{bonus.name}</h1>
        <div className="bonus-status">
          <span className={`status-badge ${getBonusStatusClass(bonus)}`}>
            {getBonusStatus(bonus)}
          </span>
          <span className="bonus-type badge">{bonus.type}</span>
          {bonus.targetPlayerSegment && (
            <span className="bonus-segment badge">{bonus.targetPlayerSegment}</span>
          )}
        </div>
      </div>
      
      <div className="bonus-grid">
        <div className="bonus-info">
          <h2>Bonus Information</h2>
          <table>
            <tbody>
              <tr>
                <th>ID</th>
                <td>{bonus.id}</td>
              </tr>
              <tr>
                <th>Value</th>
                <td>${bonus.amount}</td>
              </tr>
              <tr>
                <th>Description</th>
                <td>{bonus.description || "No description available"}</td>
              </tr>
              <tr>
                <th>Start Date</th>
                <td>{bonus.startDate ? formatDate(bonus.startDate) : 'N/A'}</td>
              </tr>
              <tr>
                <th>End Date</th>
                <td>{bonus.endDate ? formatDate(bonus.endDate) : 'N/A'}</td>
              </tr>
              <tr>
                <th>Requirements</th>
                <td>{bonus.requirements || "No specific requirements"}</td>
              </tr>
              <tr>
                <th>Wagering Requirements</th>
                <td>{bonus.wageringRequirements ? `${bonus.wageringRequirements}x` : "None"}</td>
              </tr>
              <tr>
                <th>Target Game</th>
                <td>{bonus.gameId ? <Link to={`/games/${bonus.gameId}`}>{bonus.gameName || 'View Game'}</Link> : "All games"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="bonus-stats">
          <h2>Performance Statistics</h2>
          <div className="stats-card">
            <div className="stat-item">
              <span className="stat-value">{stats.claimCount}</span>
              <span className="stat-label">Total Claims</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.completedCount}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">${stats.totalValue.toFixed(2)}</span>
              <span className="stat-label">Total Value</span>
            </div>
          </div>
          
          {playerClaims.length > 0 ? (
            <div className="claims-table">
              <h3>Recent Claims</h3>
              <table>
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Claimed Date</th>
                    <th>Status</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {playerClaims.slice(0, 5).map(claim => (
                    <tr key={claim.id}>
                      <td>
                        <Link to={`/players/${claim.playerId}`}>
                          {claim.playerUsername}
                        </Link>
                      </td>
                      <td>{formatDate(claim.claimedDate)}</td>
                      <td>{claim.status}</td>
                      <td>${claim.bonusValue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No claims yet for this bonus</p>
          )}
        </div>
      </div>
      
      <div className="action-bar">
        <Link to={`/bonuses/edit/${bonus.id}`} className="button edit-button">Edit Bonus</Link>
      </div>
    </div>
  );
};

export default BonusDetail;