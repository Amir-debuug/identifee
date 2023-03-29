import React, { useState } from 'react';
import { Spinner } from 'reactstrap';
import { useHistory } from 'react-router-dom';
import AuthService from '../services/auth.service';
import { PublicLayout } from '../layouts/PublicLayout';
import PageTitle from '../components/commons/PageTitle';
import InlineAlert from '../components/commons/InlineAlert';

export default function Reset() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsLoading(true);
      await AuthService.requestPassword(email);
      setIsLoading(false);
      setSuccess(
        "We've sent you an email with a link to finish resetting your password. Can't find the email? Try checking your spam folder."
      );
      setTimeout(() => {
        history.push('/login');
      }, 3000);
    } catch (e) {
      setIsLoading(false);
      setError(
        "We can't find a user that matches what you entered. Verify that your email address is correct."
      );
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  }

  return (
    <PublicLayout>
      <PageTitle page={'Forgot your password?'} pageModule="" />
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="card card-lg mb-5">
            <div className="card-body">
              <form className="js-validate" onSubmit={handleSubmit}>
                <div className="text-center">
                  <div className="mb-5">
                    <span className="forget-label">Forgot your password?</span>
                    <p>{`To reset your password, enter your email address.`}</p>
                  </div>
                </div>

                <InlineAlert msg={error} setMsg={setError} variant="danger" />
                <InlineAlert
                  msg={success}
                  setMsg={setSuccess}
                  variant="success"
                />

                <div className="js-form-message form-group">
                  <label
                    className="input-label"
                    htmlFor="resetPasswordSrEmail"
                    tabIndex="0"
                  >
                    Your Email
                  </label>

                  <input
                    type="email"
                    className="form-control form-control-lg"
                    name="email"
                    id="resetPasswordSrEmail"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    tabIndex="1"
                    placeholder="Enter your email address"
                    aria-label="Enter your email address"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-lg btn-block btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner /> : 'Reset Password'}
                </button>

                <div className="text-center mt-2">
                  <a
                    className="btn btn-link"
                    onClick={() => history.push('/login')}
                  >
                    <i className="tio-chevron-left"></i> Back to Login
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
