import { useState } from 'react';
import { auth } from '../../firebase.config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // <-- for navigation
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // navigation hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      navigate('/dashboard');

      const enableNotifications = window.confirm(
        'Do you want to enable notifications?'
      );

      if (enableNotifications && 'Notification' in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            alert('Notifications enabled!');
          } else {
            alert('Notifications blocked.');
          }
        });
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <p className="toggle-text">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            className="toggle-button"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
