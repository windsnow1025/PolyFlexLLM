import {useEffect} from 'react';
import {useRouter} from 'next/router';

function getContinuePath() {
  const continueUrl = new URLSearchParams(window.location.search).get('continueUrl');
  if (URL.canParse(continueUrl)) {
    const url = new URL(continueUrl);
    if (url.origin === window.location.origin) {
      return url.pathname + url.search + url.hash;
    }
  }
  return '/';
}

export default function ActionPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getContinuePath());
  }, [router]);

  return null;
}
