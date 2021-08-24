import { useRouter } from 'next/dist/client/router';
import { useEffect } from 'react';
import { useMeQuery } from '../generated/graphql';

export const useIsAuth = () => {
  const [{ data, fetching }] = useMeQuery();
  const router = useRouter();

  useEffect(() => {
    if (!fetching && !data?.me) {
      // after you are logged in is redirecting to the page that you wanted
      router.replace(`/login?next=${router.pathname}`);
    }
  }, [data, fetching, router]);
};
