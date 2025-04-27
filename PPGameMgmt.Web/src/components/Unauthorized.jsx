import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <h1>Access Denied</h1>
        <div className="unauthorized-icon">🔒</div>
        <p>Sorry, you don't have permission to access this resource.</p>
        <p>Please contact your administrator if you believe this is an error.</p>
        <div className="action-buttons">
          <Link to="/" className="button">Go to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;