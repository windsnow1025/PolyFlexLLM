import Head from 'next/head';
import SignIn from '@/components/common/sign-in/SignIn';

export default function SignInPage() {
  return (
    <div className="local-scroll-container">
      <Head>
        <title>Sign In</title>
      </Head>
      <div className="local-scroll-scrollable">
        <SignIn />
      </div>
    </div>
  );
}
