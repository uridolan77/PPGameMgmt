import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { playerService } from '../services';

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [segment, setSegment] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const data = await playerService.getAllPlayers(segment);
        setPlayers(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [segment]);

  const handleSegmentChange = (e) => {
    setSegment(e.target.value === '' ? null : e.target.value);
  };

  return (
    <div className="players-container">
      <h1>Players</h1>
      
      <div className="filter-controls">
        <label htmlFor="segment-filter">Filter by Segment:</label>
        <select 
          id="segment-filter"
          value={segment || ''}
          onChange={handleSegmentChange}
        >
          <option value="">All Segments</option>
          <option value="HighRoller">High Rollers</option>
          <option value="Casual">Casual Players</option>
          <option value="New">New Players</option>
          <option value="Churn">At Risk / Churn</option>
          <option value="Loyal">Loyal Players</option>
        </select>
      </div>

      {loading && <div className="loading">Loading players...</div>}
      
      {error && <div className="error-message">Error: {error}</div>}

      {!loading && !error && (
        <div className="players-list">
          {players.length === 0 ? (
            <p>No players found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Segment</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map(player => (
                  <tr key={player.id}>
                    <td>{player.id}</td>
                    <td>{player.username}</td>
                    <td>{player.email}</td>
                    <td>{player.segment}</td>
                    <td>{new Date(player.lastLoginDate).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/players/${player.id}`}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Players;