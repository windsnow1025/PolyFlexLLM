import Head from 'next/head';
import SignUp from '@/components/common/sign-up/SignUp';

export default function SignUpPage() {
  return (
    <div className="local-scroll-container">
      <Head>
        <title>Sign Up</title>
      </Head>
      <div className="local-scroll-scrollable">
        <SignUp />
      </div>
    </div>
  );
}
