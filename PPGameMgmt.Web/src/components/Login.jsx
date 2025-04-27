import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authError, setAuthError] = useState(null);
  const [forgotPassword, setForgotPassword] = useState(false);
  
  // Get the redirect path or default to home page
  const from = location.state?.from?.pathname || '/';
  
  const initialValues = {
    username: '',
    password: ''
  };
  
  const validationSchema = Yup.object({
    username: Yup.string()
      .required('Username is required'),
    password: Yup.string()
      .required('Password is required')
  });
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setAuthError(null);
      await login(values.username, values.password);
      // Redirect to the page user tried to access or to the home page
      navigate(from, { replace: true });
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  const forgotPasswordSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
  });
  
  const handleForgotPassword = async (values, { setSubmitting, resetForm }) => {
    try {
      setAuthError(null);
      // In a real app, this would call the forgotPassword function from the AuthContext
      // await forgotPassword(values.email);
      setSubmitting(false);
      resetForm();
      
      // Show success message (in a production app, you might use a toast notification)
      alert('If an account exists with this email, you will receive password reset instructions.');
      setForgotPassword(false);
    } catch (error) {
      setAuthError(error.message);
      setSubmitting(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Players & Prizes</h1>
          <h2>{forgotPassword ? 'Reset Password' : 'Login'}</h2>
        </div>
        
        {forgotPassword ? (
          <Formik
            initialValues={{ email: '' }}
            validationSchema={forgotPasswordSchema}
            onSubmit={handleForgotPassword}
          >
            {({ isSubmitting }) => (
              <Form className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <Field type="email" name="email" id="email" />
                  <ErrorMessage name="email" component="div" className="error-text" />
                </div>
                
                {authError && (
                  <div className="auth-error">
                    {authError}
                  </div>
                )}
                
                <div className="auth-actions">
                  <button 
                    type="button" 
                    className="button secondary-button"
                    onClick={() => setForgotPassword(false)}
                  >
                    Back to Login
                  </button>
                  <button 
                    type="submit" 
                    className="button primary-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Reset Password'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="auth-form">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <Field type="text" name="username" id="username" />
                  <ErrorMessage name="username" component="div" className="error-text" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <Field type="password" name="password" id="password" />
                  <ErrorMessage name="password" component="div" className="error-text" />
                  <button 
                    type="button" 
                    className="forgot-password-link"
                    onClick={() => setForgotPassword(true)}
                  >
                    Forgot password?
                  </button>
                </div>
                
                {authError && (
                  <div className="auth-error">
                    {authError}
                  </div>
                )}
                
                <div className="auth-actions">
                  <button 
                    type="submit" 
                    className="button primary-button full-width"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}
        
        <div className="auth-footer">
          <p>© 2025 Players & Prizes Game Management</p>
        </div>
      </div>
    </div>
  );
};

export default Login;