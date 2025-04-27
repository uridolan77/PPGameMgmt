import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { bonusService, gameService } from '../services';

const BonusForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [bonus, setBonus] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState({ isSubmitting: false, error: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch games for the dropdown
        const gamesData = await gameService.getAllGames();
        setGames(gamesData);
        
        // If in edit mode, fetch the bonus details
        if (isEditMode) {
          const bonusData = await bonusService.getBonus(id);
          setBonus(bonusData);
        }
        
        setError(null);
      } catch (err) {
        setError(`Error loading data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const initialValues = {
    name: bonus?.name || '',
    description: bonus?.description || '',
    type: bonus?.type || '',
    amount: bonus?.amount || '',
    targetPlayerSegment: bonus?.targetPlayerSegment || '',
    gameId: bonus?.gameId || '',
    startDate: bonus?.startDate ? new Date(bonus.startDate).toISOString().split('T')[0] : '',
    endDate: bonus?.endDate ? new Date(bonus.endDate).toISOString().split('T')[0] : '',
    requirements: bonus?.requirements || '',
    wageringRequirements: bonus?.wageringRequirements || '',
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Bonus name is required')
      .max(100, 'Bonus name must not exceed 100 characters'),
    type: Yup.string()
      .required('Bonus type is required'),
    amount: Yup.number()
      .required('Bonus amount is required')
      .typeError('Amount must be a number')
      .min(0, 'Amount cannot be negative'),
    targetPlayerSegment: Yup.string()
      .required('Player segment is required'),
    startDate: Yup.date()
      .typeError('Please enter a valid date'),
    endDate: Yup.date()
      .typeError('Please enter a valid date')
      .min(
        Yup.ref('startDate'),
        'End date cannot be before start date'
      ),
    wageringRequirements: Yup.number()
      .typeError('Wagering requirement must be a number')
      .min(0, 'Wagering requirement cannot be negative'),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitStatus({ isSubmitting: true, error: null });
    try {
      if (isEditMode) {
        await bonusService.updateBonus(id, values);
        navigate(`/bonuses/${id}`);
      } else {
        const newBonus = await bonusService.createBonus(values);
        resetForm();
        navigate(`/bonuses/${newBonus.id}`);
      }
    } catch (err) {
      setSubmitStatus({ isSubmitting: false, error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading data...</div>;
  
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="bonus-form-container">
      <h1>{isEditMode ? 'Edit Bonus' : 'Create New Bonus'}</h1>
      
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
                <label htmlFor="name">Bonus Name *</label>
                <Field type="text" id="name" name="name" className={touched.name && errors.name ? 'error' : ''} />
                <ErrorMessage name="name" component="div" className="error-text" />
              </div>
              
              <div className="form-group">
                <label htmlFor="type">Bonus Type *</label>
                <Field as="select" id="type" name="type">
                  <option value="">Select Type</option>
                  <option value="Welcome">Welcome</option>
                  <option value="Deposit">Deposit</option>
                  <option value="NoDeposit">No Deposit</option>
                  <option value="Cashback">Cashback</option>
                  <option value="Reload">Reload</option>
                  <option value="FreeSpins">Free Spins</option>
                  <option value="Loyalty">Loyalty</option>
                </Field>
                <ErrorMessage name="type" component="div" className="error-text" />
              </div>
              
              <div className="form-group">
                <label htmlFor="amount">Amount ($) *</label>
                <Field type="number" id="amount" name="amount" step="0.01" min="0" />
                <ErrorMessage name="amount" component="div" className="error-text" />
              </div>
              
              <div className="form-group">
                <label htmlFor="targetPlayerSegment">Player Segment *</label>
                <Field as="select" id="targetPlayerSegment" name="targetPlayerSegment">
                  <option value="">Select Segment</option>
                  <option value="HighRoller">High Rollers</option>
                  <option value="Casual">Casual Players</option>
                  <option value="New">New Players</option>
                  <option value="Churn">At Risk / Churn</option>
                  <option value="Loyal">Loyal Players</option>
                  <option value="All">All Players</option>
                </Field>
                <ErrorMessage name="targetPlayerSegment" component="div" className="error-text" />
              </div>
              
              <div className="form-group">
                <label htmlFor="gameId">Specific Game (Optional)</label>
                <Field as="select" id="gameId" name="gameId">
                  <option value="">All Games</option>
                  {games.map(game => (
                    <option key={game.id} value={game.id}>
                      {game.name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="gameId" component="div" className="error-text" />
              </div>
              
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <Field type="date" id="startDate" name="startDate" />
                <ErrorMessage name="startDate" component="div" className="error-text" />
              </div>
              
              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <Field type="date" id="endDate" name="endDate" />
                <ErrorMessage name="endDate" component="div" className="error-text" />
              </div>
              
              <div className="form-group">
                <label htmlFor="wageringRequirements">Wagering Requirement (x)</label>
                <Field type="number" id="wageringRequirements" name="wageringRequirements" min="0" />
                <ErrorMessage name="wageringRequirements" component="div" className="error-text" />
              </div>
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="requirements">Bonus Requirements</label>
              <Field as="textarea" id="requirements" name="requirements" rows="2" />
              <ErrorMessage name="requirements" component="div" className="error-text" />
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
                onClick={() => navigate('/bonuses')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="button submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update Bonus' : 'Create Bonus'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default BonusForm;