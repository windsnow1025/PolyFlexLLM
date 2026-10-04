import {useEffect} from 'react';
import {useRouter} from 'next/router';

function getContinueUrl() {
  const continueUrl = new URLSearchParams(window.location.search).get('continueUrl');
  if (URL.canParse(continueUrl) && new URL(continueUrl).origin === window.location.origin) {
    return continueUrl;
  }
  return '/';
}

export default function ActionPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getContinueUrl());
  }, [router]);

  return null;
}
