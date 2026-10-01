import * as React from 'react';
import Script from 'next/script';
import {useRouter} from 'next/router';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import {useColorScheme} from '@mui/material/styles';
import UserLogic from '@/lib/common/user/UserLogic';

export default function GoogleSignInButton() {
  const userLogic = new UserLogic();
  const router = useRouter();

  const { mode, systemMode } = useColorScheme();
  const resolvedMode = systemMode || mode;

  const buttonRef = React.useRef<HTMLDivElement>(null);

  const [initialized, setInitialized] = React.useState(false);

  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');
  const [alertSeverity, setAlertSeverity] = React.useState<'success' | 'error' | 'info'>('info');

  const showAlert = (message: string, severity: 'success' | 'error' | 'info' = 'info') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleCredentialResponse = async (response: google.accounts.id.CredentialResponse) => {
    try {
      await userLogic.signInByGoogle(response.credential);

      let redirectUrl = router.query.redirect as string;
      if (!redirectUrl || !redirectUrl.startsWith('/')) {
        redirectUrl = '/';
      }
      router.push(redirectUrl);
    } catch (err) {
      showAlert((err as Error).message, 'error');
    }
  };

  const handleScriptReady = async () => {
    try {
      const clientId = await userLogic.fetchGoogleClientId();
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });
      setInitialized(true);
      google.accounts.id.prompt();
    } catch (err) {
      showAlert((err as Error).message, 'error');
    }
  };

  React.useEffect(() => {
    if (!initialized) {
      return;
    }
    google.accounts.id.renderButton(buttonRef.current!, {
      type: 'standard',
      theme: resolvedMode === 'dark' ? 'filled_black' : 'outline',
      text: 'continue_with',
      width: buttonRef.current!.clientWidth,
    });
  }, [initialized, resolvedMode]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        onReady={() => {
          handleScriptReady();
        }}
      />
      <Box ref={buttonRef} sx={{ display: 'flex', justifyContent: 'center', colorScheme: 'light' }} />
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
