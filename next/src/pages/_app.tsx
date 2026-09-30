import '../global.css';

import * as React from 'react';
import Head from 'next/head';

import AppTheme from "@/components/common/shared-theme/AppTheme";

import {useRouter} from "next/router";
import {usePathname} from "next/navigation";
import UserLogic from "@/lib/common/user/UserLogic";
import {StorageKeys} from "@/lib/common/Constants";
import {type Session, SessionProvider} from "@/session/SessionContext";
import Dashboard from "@/components/common/dashboard/Dashboard";

export default function App({Component}: { Component: React.ElementType }) {
  const [session, setSession] = React.useState<Session | null>(null);

  const router = useRouter();

  React.useEffect(() => {
    const fetchUser = async () => {
      const userLogic = new UserLogic();
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
      </AppTheme>
    </>
  );
}
