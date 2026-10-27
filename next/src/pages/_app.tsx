import '../global.css';

import * as React from 'react';
import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import AppTheme from "@/components/common/shared-theme/AppTheme";

import {useRouter} from "next/router";
import {usePathname} from "next/navigation";
import UserLogic from "@/lib/common/user/UserLogic";
import {StorageKeys} from "@/lib/common/Constants";
import {type Session, SessionProvider} from "@/session/SessionContext";
import Dashboard from "@/components/common/dashboard/Dashboard";

export default function App({Component}: { Component: React.ElementType }) {
  const [session, setSession] = React.useState<Session | null>(null);

  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');
  const [alertSeverity, setAlertSeverity] = React.useState<'success' | 'error' | 'info'>('info');

  const router = useRouter();

  React.useEffect(() => {
    const fetchUser = async () => {
      const userLogic = new UserLogic();
      try {
        const user = await userLogic.fetchUser();
        if (!user) {
          return;
        }
        setSession({
          user: {
            name: user.username,
            email: user.email,
            image: user.avatar,
          }
        });
      } catch (err) {
        setAlertMessage((err as Error).message);
        setAlertSeverity('error');
        setAlertOpen(true);
      }
    };
    fetchUser();
  }, [router]);

  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  const authentication = React.useMemo(() => {
    return {
      signIn: () => {
        router.push(`/auth/signin?redirect=${encodeURIComponent(pathname!)}`);
      },
      signOut: () => {
        setSession(null);
        localStorage.removeItem(StorageKeys.Token);
        router.push(`/auth/signin?redirect=${encodeURIComponent(pathname!)}`);
      },
    };
  }, [pathname, router]);

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width"/>
      </Head>
      <AppTheme>
        <CssBaseline enableColorScheme />
        <SessionProvider session={session} authentication={authentication}>
          <div className="local-scroll-root">
            {isAuthPage ? (
              <Component/>
            ) : (
              <Dashboard>
                <Component/>
              </Dashboard>
            )}
          </div>
        </SessionProvider>

        <Snackbar
          open={alertOpen}
          autoHideDuration={6000}
          onClose={() => setAlertOpen(false)}
        >
          <Alert onClose={() => setAlertOpen(false)} severity={alertSeverity} sx={{ width: '100%' }}>
            {alertMessage}
          </Alert>
        </Snackbar>
      </AppTheme>
    </>
  );
}
