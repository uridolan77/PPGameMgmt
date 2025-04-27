import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { gameService } from '../services';

const GameForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState({ isSubmitting: false, error: null });

  useEffect(() => {
    const fetchGame = async () => {
      if (!isEditMode) return;
      
      try {
        setLoading(true);
        const gameData = await gameService.getGame(id);
        setGame(gameData);
        setError(null);
      } catch (err) {
        setError(`Error loading game: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id, isEditMode]);

  const initialValues = {
    name: game?.name || '',
    description: game?.description || '',
    type: game?.type || '',
    category: game?.category || '',
    provider: game?.provider || '',
    rtp: game?.rtp || '',
    volatility: game?.volatility || '',
    minBet: game?.minBet || '',
    maxBet: game?.maxBet || '',
    releaseDate: game?.releaseDate ? new Date(game.releaseDate).toISOString().split('T')[0] : '',
    isPopular: game?.isPopular || false,
    isNew: game?.isNew || false
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Game name is required')
      .max(100, 'Game name must not exceed 100 characters'),
    description: Yup.string()
      .max(1000, 'Description must not exceed 1000 characters'),
    type: Yup.string()
      .required('Game type is required'),
    category: Yup.string()
      .required('Game category is required'),
    provider: Yup.string()
      .required('Provider is required'),
    rtp: Yup.number()
      .typeError('RTP must be a number')
      .min(1, 'RTP must be at least 1%')
      .max(100, 'RTP cannot exceed 100%'),
    minBet: Yup.number()
      .typeError('Minimum bet must be a number')
      .min(0, 'Minimum bet cannot be negative'),
    maxBet: Yup.number()
      .typeError('Maximum bet must be a number')
      .min(Yup.ref('minBet'), 'Maximum bet must be greater than minimum bet'),
    releaseDate: Yup.date()
      .typeError('Please enter a valid date')
      .max(new Date(), 'Release date cannot be in the future')
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitStatus({ isSubmitting: true, error: null });
    try {
      if (isEditMode) {
        await gameService.updateGame(id, values);
      } else {
        await gameService.createGame(values);
        resetForm();
      }
      
      navigate(isEditMode ? `/games/${id}` : '/games');
    } catch (err) {
      setSubmitStatus({ isSubmitting: false, error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading game data...</div>;
  
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="game-form-container">
      <h1>{isEditMode ? 'Edit Game' : 'Create New Game'}</h1>
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, touched, errors }) => (
          <Form className="form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Game Name *</label>
                <Field type="text" id="name" name="name" className={touched.name && errors.name ? 'error' : ''} />
                <ErrorMessage name="name" component="div" className="error-text" />
              </div>
              
              <div className="form-group">
                <label htmlFor="provider">Provider *</label>
                <Field type="text" id="provider" name="provider" />
                <ErrorMessage name="provider" component="div" className="error-text" />
              </div>
              
              <div className="form-group">
                <label htmlFor="type">Game Type *</label>
                <Field as="select" id="type" name="type">
                  <option value="">Select Type</option>
                  <option value="Slot">Slots</option>
                  <option value="Table">Table Games</option>
                  <option value="LiveDealer">Live Dealer</option>
                  <option value="Poker">Poker</option>
                  <option value="Bingo">Bingo</option>
                </Field>
                <ErrorMessage name="type" component="div" className="error-text" />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <Field as="select" id="category" name="category">
                  <option value="">Select Category</option>
                  <option value="Featured">Featured</option>
                  <option value="New">New</option>
                  <option value="Popular">Popular</option>
                  <option value="ClassicSlots">Classic Slots</option>
                  <option value="VideoSlots">Video Slots</option>
                  <option value="JackpotGames">Jackpot Games</option>
                </Field>
                <ErrorMessage name="category" component="div" className="error-text" />
              </div>
              
              <div className="form-group">
                <label htmlFor="rtp">RTP (%)</label>
                <Field type="number" id="rtp" name="rtp" step="0.01" min="1" max="100" />
                <ErrorMessage name="rtp" component="div" className="error-text" />
              </div>
              
              <div className="form-group">
                <label htmlFor="volatility">Volatility</label>
                <Field as="select" id="volatility" name="volatility">
                  <option value="">Select Volatility</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Field>
                <ErrorMessage name="volatility" component="div" className="error-text" />
              </div>
              
              <div className="form-group">
                <label htmlFor="minBet">Minimum Bet</label>
                <Field type="number" id="minBet" name="minBet" step="0.01" min="0" />
                <ErrorMessage name="minBet" component="div" className="error-text" />
              </div>
              
              <div className="form-group">
                <label htmlFor="maxBet">Maximum Bet</label>
                <Field type="number" id="maxBet" name="maxBet" step="0.01" min="0" />
                <ErrorMessage name="maxBet" component="div" className="error-text" />
              </div>
              
              <div className="form-group">
                <label htmlFor="releaseDate">Release Date</label>
                <Field type="date" id="releaseDate" name="releaseDate" />
                <ErrorMessage name="releaseDate" component="div" className="error-text" />
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <Field type="checkbox" name="isPopular" />
                  Featured as Popular
                </label>
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <Field type="checkbox" name="isNew" />
                  Mark as New
                </label>
              </div>
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <Field as="textarea" id="description" name="description" rows="4" />
              <ErrorMessage name="description" component="div" className="error-text" />
            </div>
            
            {submitStatus.error && (
              <div className="error-message">Error: {submitStatus.error}</div>
            )}
            
            <div className="form-actions">
              <button 
                type="button" 
                className="button cancel-button" 
                onClick={() => navigate('/games')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="button submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update Game' : 'Create Game'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default GameForm;