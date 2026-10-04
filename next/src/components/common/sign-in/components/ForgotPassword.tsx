import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import Snackbar from '@mui/material/Snackbar';
import UserLogic from '@/lib/common/user/UserLogic';
import {useRouter} from 'next/router';

interface ForgotPasswordProps {
  open: boolean;
  handleClose: () => void;
}

export default function ForgotPassword({ open, handleClose }: ForgotPasswordProps) {
  const userLogic = new UserLogic();
  const router = useRouter();

  const email = typeof router.query.email === 'string' ? router.query.email : null;
  const token = typeof router.query.token === 'string' ? router.query.token : null;
  const isResetting = email !== null && token !== null;

  const [sentEmail, setSentEmail] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');
  const [alertSeverity, setAlertSeverity] = React.useState<'success' | 'error' | 'info'>('info');

  const showAlert = (message: string, severity: 'success' | 'error' | 'info' = 'info') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const close = () => {
    setSentEmail(null);
    handleClose();
    if (isResetting) {
      router.replace('/auth/signin');
    }
  };

  const sendResetEmail = async (email: string) => {
    if (!userLogic.validateEmail(email)) {
      showAlert('Please enter a valid email address.', 'error');
      return;
    }
    try {
      setIsSubmitting(true);
      await userLogic.sendPasswordResetEmail(email);
      setSentEmail(email);
    } catch (err) {
      showAlert((err as Error).message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePassword = async (email: string, password: string, token: string) => {
    if (!userLogic.validateUsernameOrPassword(password)) {
      showAlert('New password invalid. Must be 4-32 ASCII characters.', 'error');
      return;
    }
    try {
      setIsSubmitting(true);
      await userLogic.updateResetPassword(email, password, token);
      close();
      showAlert('Password updated. Sign in with your new password.', 'success');
    } catch (err) {
      showAlert((err as Error).message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (email !== null && token !== null) {
      await updatePassword(email, formData.get('password') as string, token);
    } else {
      await sendResetEmail(formData.get('email') as string);
    }
  };

  return (
    <>
      <Dialog
        open={open || isResetting}
        onClose={close}
        slotProps={{
          paper: {
            component: 'form',
            onSubmit: handleSubmit,
            sx: { backgroundImage: 'none' },
          },
        }}
      >
        <DialogTitle>Reset password</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
        >
          {isResetting ? (
            <>
              <Alert severity="info">
                Set a new password for <strong>{email}</strong>.
              </Alert>
              <OutlinedInput
                key="password"
                autoFocus
                required
                margin="dense"
                id="reset-password"
                name="password"
                label="New password"
                placeholder="New password"
                type="password"
                fullWidth
              />
            </>
          ) : sentEmail === null ? (
            <>
              <DialogContentText>
                Enter your account&apos;s email address, and we&apos;ll send you a link to
                reset your password.
              </DialogContentText>
              <OutlinedInput
                key="email"
                autoFocus
                required
                margin="dense"
                id="reset-email"
                name="email"
                label="Email address"
                placeholder="Email address"
                type="email"
                fullWidth
              />
            </>
          ) : (
            <Alert severity="info">
              A reset link was sent to <strong>{sentEmail}</strong>. Open it to set your new password.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
          {isResetting || sentEmail === null ? (
            <>
              <Button onClick={close} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="contained" type="submit" disabled={isSubmitting}>
                {isResetting ? 'Confirm' : 'Continue'}
              </Button>
            </>
          ) : (
            <Button onClick={close}>
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>
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
