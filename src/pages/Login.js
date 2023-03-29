import React, { useState, useEffect } from 'react';
import { Spinner } from 'reactstrap';
import { useHistory, useLocation } from 'react-router-dom';
import AuthService from '../services/auth.service';
import TenantService from '../services/tenant.service';
import { useAppContext } from '../contexts/appContext';
import stringConstants from '../utils/stringConstants.json';
import { PublicLayout } from '../layouts/PublicLayout';
import { useProfileContext } from '../contexts/profileContext';
import { useTenantContext } from '../contexts/TenantContext';
import { searchParams, parseJwt } from '../utils/Utils';
import PageTitle from '../components/commons/PageTitle';
import InlineAlert from '../components/commons/InlineAlert';

const msgTimeout = 4000;
const constants = stringConstants.login;
const Login = () => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { userHasAuthenticated } = useAppContext();
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [code, setCode] = useState('');
  const [isCommonLogin, setIsCommonLogin] = useState(false);
  const [commonLoginResp, setCommonLoginResp] = useState(false);
  const [isOTPEnabled, setIsOTPEnabled] = useState(false);
  const { search } = history.location;
  const { setProfileInfo } = useProfileContext();
  const { tenant } = useTenantContext();
  const [id, setId] = useState();
  const [accessToken, setAccessToken] = useState();
  const [expires, setExpires] = useState();
  const [refreshToken, setRefreshToken] = useState();
  const [idfToken, setidfToken] = useState();
  const query = useQuery();

  useEffect(() => {
    setidfToken(localStorage.getItem('idftoken'));
    const token = query.get('access_token') || null;
    if (token) {
      const tokenParse = parseJwt(token);
      setAccessToken(token);
      setExpires(tokenParse.exp * 1000); // multiplying with thousand to make it miliseconds
      setRefreshToken(query.get('refresh_token'));
      setId(tokenParse.id);
    }
  }, []);

  useEffect(() => {
    /**
     * this sucks but each one has its use case
     *
     * 1. login.example.com - is for a common tenant login. User will be looked
     * up and redirected to their appropriate themed login.
     * 2. clientportal is for guest users. Rather than boot up a separate
     * project, we hardcode domain and redirect to appropriate component.
     */
    const host = window.location.host.split('.');

    // forgive me for this :'(
    const isClientPortal =
      host.length >= 2 &&
      host[host.length - 2].toLowerCase() === 'iclientportal';
    if (isClientPortal) {
      history.push('/clientportal/login');
    }

    const isLogin = host[0] === 'login' && host.length === 3;

    setIsCommonLogin(isLogin);
  }, []);

  useEffect(() => {
    async function getTenantInfo() {
      setIsLoading(true);
      const tokenParse = parseJwt(commonLoginResp.access_token);
      TenantService.getSingleTenant(tokenParse?.tenant_id)
        .then((resp) => {
          if (resp?.domain) {
            window.open(
              `https://${resp.domain}/login?id=${tokenParse.id}&access_token=${commonLoginResp.access_token}&expires=${commonLoginResp.expires}&refresh_token=${commonLoginResp.refresh_token}`,
              '_self'
            );
          }
        })
        .catch((error) => {
          if (code) {
            setError(constants.invalidCodeMessage);
          } else {
            setError(error?.response?.data?.errors?.[0]?.message);
          }
          setTimeout(() => {
            setError('');
          }, msgTimeout);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    if (commonLoginResp && isCommonLogin) {
      getTenantInfo();
    }
  }, [commonLoginResp]);
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await AuthService.login(
        isCommonLogin ? '' : tenant.id,
        email,
        password,
        code
      );

      if (response.access_token === 'otp_enabled') {
        setIsOTPEnabled(true);
      } else {
        if (isCommonLogin) {
          setCommonLoginResp(response);
        } else {
          userHasAuthenticated(true);
          setProfileInfo({});
          const redirect_uri = searchParams(search, 'redirect_uri');
          if (redirect_uri) {
            history.push(redirect_uri);
          } else {
            history.push('/');
          }
        }
      }
    } catch (error) {
      if (code) {
        setError(constants.invalidCodeMessage);
      } else {
        setError(
          `Please check your email address and password. If you still can't log in, contact your ${tenant.name} administrator.`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    await AuthService.login(tenant.id, email, password);
    setCode('');
    setInfo('New code sent');
  };

  const renderLogin = () => (
    <form className="js-validate px-3" onSubmit={handleSubmit}>
      <InlineAlert msg={error} setMsg={setError} variant="danger" />
      <div className="js-form-message form-group">
        <label className="input-label" htmlFor="signinSrEmail">
          Your Email
        </label>

        <input
          type="email"
          className="form-control form-control-lg"
          name="email"
          id="signinSrEmail"
          tabIndex="0"
          placeholder="email@address.com"
          aria-label="email@address.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isOTPEnabled}
        />
      </div>

      <div className="js-form-message form-group">
        <label className="input-label">
          <span className="d-flex justify-content-between align-items-center">
            Password
          </span>
        </label>

        <div className="input-group input-group-merge">
          <input
            type="password"
            className="js-toggle-password form-control form-control-lg"
            name="password"
            id="signupSrPassword"
            tabIndex="0"
            aria-label="8+ characters required"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div id="changePassTarget" className="input-group-append">
            <a className="input-group-text">
              <i id="changePassIcon" className="tio-visible-outlined"></i>
            </a>
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="btn btn-lg btn-block btn-primary"
          disabled={isLoading}
        >
          {isLoading ? <Spinner /> : 'Log In'}
        </button>
      </div>
      <div className="w-100 mt-4">
        <span
          className="input-label-secondary cursor-pointer"
          onClick={() => history.push('/request-password')}
        >
          Forgot Password?
        </span>
      </div>
    </form>
  );

  const renderOTP = () => (
    <form className="js-validate" onSubmit={handleSubmit}>
      <div className="text-center">
        <div className="mb-5">
          <h1 className="display-4">Two-step Verification</h1>

          <p className="mb-0">
            We sent a verification code to your email.
            <br />
            Enter the code from the email in the field below.
          </p>
        </div>
      </div>
      <InlineAlert
        msg={error}
        setMsg={setError}
        variant="danger"
        autoClose={true}
      />
      <InlineAlert
        msg={info}
        setMsg={setInfo}
        variant="info"
        autoClose={true}
      />
      <div className="js-form-message form-group">
        <label className="input-label">
          <span className="d-flex justify-content-between align-items-center">
            Enter Code
          </span>
        </label>

        <div className="input-group input-group-merge">
          <input
            type="text"
            className="js-toggle-password form-control form-control-lg"
            placeholder="000000"
            name="otp_code"
            id="otp_code"
            maxLength="6"
            tabIndex="1"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[a-zA-Z ]/g, ''))}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-lg btn-block btn-primary"
        disabled={isLoading}
      >
        {isLoading ? <Spinner /> : 'Verify'}
      </button>
      <div className="text-center mt-3">
        <p>
          {`Haven't received it? `}
          <a href="#!" onClick={resendCode}>
            Resend a new code.
          </a>
        </p>
      </div>
    </form>
  );

  if (id) {
    function impersonateFunction() {
      window.localStorage.setItem(
        'idftoken',
        JSON.stringify({
          id,
          access_token: accessToken,
          expires,
          refresh_token: refreshToken,
        })
      );
      userHasAuthenticated(true);
      setProfileInfo({});
    }
    impersonateFunction();
    history.push('/');
  } else {
    return (
      <>
        <PageTitle page={'Login'} pageModule="" />
        {!idfToken ? (
          <PublicLayout>
            <div className="row justify-content-center">
              <div className="col-md-7 col-lg-5">
                <div className="card card-lg mb-5">
                  <div className="card-body">
                    {!isOTPEnabled ? renderLogin() : renderOTP()}
                  </div>
                </div>
              </div>
            </div>
          </PublicLayout>
        ) : (
          ''
        )}
      </>
    );
  }
};

export default Login;

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}
