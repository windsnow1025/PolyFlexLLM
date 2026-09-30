import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import {styled} from '@mui/material/styles';
import {useRouter} from 'next/router';
import UserLogic from '@/lib/common/user/UserLogic';
import {wait} from '@/components/common/utils/Wait';
import {EmailVerificationReqDtoPurposeEnum} from '@/client/nest';
import {ResendCooldownSeconds} from '@/lib/common/Constants';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function SignUp() {
  const userLogic = new UserLogic();
  const router = useRouter();

  const email = typeof router.query.email === 'string' ? router.query.email : null;
  const token = typeof router.query.token === 'string' ? router.query.token : null;

  const [sentEmail, setSentEmail] = React.useState<string | null>(null);
  const [isSending, setIsSending] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const [confirmPasswordError, setConfirmPasswordError] = React.useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = React.useState('');
  const [agreedToPrivacy, setAgreedToPrivacy] = React.useState(false);
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = React.useState(false);

  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');
  const [alertSeverity, setAlertSeverity] = React.useState<'success' | 'error' | 'info' | 'warning'>('info');

  const showAlert = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  React.useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const validateEmail = () => {
    const email = document.getElementById('email') as HTMLInputElement;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      return false;
    }
    setEmailError(false);
    setEmailErrorMessage('');
    return true;
  };

  const validateInputs = () => {
    const password = document.getElementById('password') as HTMLInputElement;
    const name = document.getElementById('name') as HTMLInputElement;
    const confirmPassword = document.getElementById('confirmPassword') as HTMLInputElement;

    let isValid = true;

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (!name.value || name.value.length < 1) {
      setNameError(true);
      setNameErrorMessage('Name is required.');
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    if (password.value !== confirmPassword.value) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage('Passwords do not match.');
      isValid = false;
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleSendVerification = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateEmail()) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;

    try {
      setIsSending(true);
      await userLogic.sendEmailVerification(email, EmailVerificationReqDtoPurposeEnum.SignUp);
      setSentEmail(email);
      setResendCooldown(ResendCooldownSeconds);
    } catch (err) {
      showAlert((err as Error).message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !token || !validateInputs()) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    const username = formData.get('name') as string;
    const password = formData.get('password') as string;

    try {
      setIsSubmitting(true);
      await userLogic.signUp(username, email, password, token);
      showAlert('Sign up success! Redirecting to sign in page...', 'success');
      await wait(1);
      router.push('/auth/signin');
    } catch (err) {
      showAlert((err as Error).message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendButtonLabel = isSending
    ? 'Sending...'
    : resendCooldown > 0
      ? `Resend Available in ${resendCooldown}s`
      : 'Send Verification Email';

  const renderEmailStep = () => (
    <Box
      component="form"
      onSubmit={handleSendVerification}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      {sentEmail !== null && (
        <Alert severity="info">
          Verification email sent to <strong>{sentEmail}</strong>.
        </Alert>
      )}
      <FormControl>
        <FormLabel htmlFor="email">Email</FormLabel>
        <TextField
          required
          fullWidth
          id="email"
          placeholder="your@email.com"
          name="email"
          autoComplete="email"
          variant="outlined"
          error={emailError}
          helperText={emailErrorMessage}
          color={emailError ? 'error' : 'primary'}
        />
      </FormControl>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isSending || resendCooldown > 0}
      >
        {sendButtonLabel}
      </Button>
    </Box>
  );

  const renderSignUpStep = () => (
    <Box
      component="form"
      onSubmit={handleSignUp}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Alert severity="info">
        Verifying <strong>{email}</strong>. Complete the form to create your account.
      </Alert>
      <FormControl>
        <FormLabel htmlFor="name">Username</FormLabel>
        <TextField
          autoComplete="username"
          name="name"
          required
          fullWidth
          id="name"
          placeholder="Enter your username"
          error={nameError}
          helperText={nameErrorMessage}
          color={nameError ? 'error' : 'primary'}
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="password">Password</FormLabel>
        <TextField
          required
          fullWidth
          name="password"
          placeholder="••••••"
          type="password"
          id="password"
          autoComplete="new-password"
          variant="outlined"
          error={passwordError}
          helperText={passwordErrorMessage}
          color={passwordError ? 'error' : 'primary'}
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
        <TextField
          required
          fullWidth
          name="confirmPassword"
          placeholder="••••••"
          type="password"
          id="confirmPassword"
          autoComplete="new-password"
          variant="outlined"
          error={confirmPasswordError}
          helperText={confirmPasswordErrorMessage}
          color={confirmPasswordError ? 'error' : 'primary'}
        />
      </FormControl>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={agreedToPrivacy}
              onChange={(e) => setAgreedToPrivacy(e.target.checked)}
            />
          }
          label={
            <Typography variant="body2">
              I agree to the{' '}
              <Link href="/about/privacy" target="_blank">
                Privacy Policy
              </Link>
            </Typography>
          }
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
          }
          label={
            <Typography variant="body2">
              I agree to the{' '}
              <Link href="/about/terms" target="_blank">
                Terms &amp; Conditions
              </Link>
            </Typography>
          }
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={agreedToPolicy}
              onChange={(e) => setAgreedToPolicy(e.target.checked)}
            />
          }
          label={
            <Typography variant="body2">
              I agree to the{' '}
              <Link href="/about/policy" target="_blank">
                Acceptable Use Policy
              </Link>
            </Typography>
          }
        />
      </FormGroup>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isSubmitting || !agreedToPrivacy || !agreedToTerms || !agreedToPolicy}
      >
        Sign up
      </Button>
    </Box>
  );

  const renderContent = () => {
    if (!router.isReady) {
      return <CircularProgress sx={{ alignSelf: 'center' }} />;
    }
    if (email && token) {
      return renderSignUpStep();
    }
    return renderEmailStep();
  };

  return (
    <>
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign up
          </Typography>
          {renderContent()}
          <Typography sx={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <Link
              href="/auth/signin"
              variant="body2"
              sx={{ alignSelf: 'center' }}
            >
              Sign in
            </Link>
          </Typography>
        </Card>
      </SignUpContainer>
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
      >
        <Alert onClose={() => setAlertOpen(false)} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
