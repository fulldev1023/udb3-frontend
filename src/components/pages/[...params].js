import getConfig from 'next/config';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { memo, useMemo, useState } from 'react';
import { Cookies } from 'react-cookie';
import { generatePath, matchPath } from 'react-router';

import { useCookiesWithOptions } from '@/hooks/useCookiesWithOptions';
import { isFeatureFlagEnabledInCookies } from '@/hooks/useFeatureFlag';
import {
  useHandleWindowMessage,
  WindowMessageTypes,
} from '@/hooks/useHandleWindowMessage';
import { useIsClient } from '@/hooks/useIsClient';
import PageNotFound from '@/pages/404';
import { Box } from '@/ui/Box';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';

import { getRedirects } from '../../redirects';

const prefixWhenNotEmpty = (value, prefix) =>
  value ? `${prefix}${value}` : value;

const getRedirect = (originalPath, environment, cookies) => {
  return getRedirects(environment)
    .map(({ source, destination, permanent, featureFlag }) => {
      // Don't follow redirects that are behind a feature flag
      if (featureFlag && !isFeatureFlagEnabledInCookies(featureFlag, cookies)) {
        return false;
      }

      // Check if the redirect source matches the current path
      const match = matchPath(originalPath, { path: source, exact: true });
      if (match) {
        return {
          destination: generatePath(destination, match.params),
          permanent: featureFlag === undefined && permanent,
        };
      }
      return false;
    })
    .find((match) => !!match);
};

const IFrame = memo(({ url }) => (
  <Box as="iframe" src={url} width="100%" height="100vh" flex={1} />
));

IFrame.propTypes = {
  url: PropTypes.string,
};

const Fallback = () => {
  const router = useRouter();

  const {
    // eslint-disable-next-line no-unused-vars
    query: { params = [], ...queryWithoutParams },
    asPath,
  } = router;

  const { publicRuntimeConfig } = getConfig();

  // Keep track of which paths were not found. Do not store as a single boolean
  // for the current path, because it's possible to navigate from a 404 path to
  // another page that's handled by this same Fallback component and then the
  // boolean notFound state would not update.
  const [notFoundPaths, setNotFoundPaths] = useState([]);
  useHandleWindowMessage({
    [WindowMessageTypes.URL_UNKNOWN]: () =>
      setNotFoundPaths([asPath, ...notFoundPaths]),
  });

  const isClientSide = useIsClient();

  const { cookies } = useCookiesWithOptions(['token', 'udb-language']);

  const legacyPath = useMemo(() => {
    const path = new URL(`http://localhost${asPath}`).pathname;

    const queryString = prefixWhenNotEmpty(
      new URLSearchParams({
        ...queryWithoutParams,
        jwt: cookies.token,
        lang: cookies['udb-language'],
      }),
      '?',
    );

    return `${publicRuntimeConfig.legacyAppUrl}${path}${queryString}`;
  }, [asPath, cookies.token, cookies['udb-language']]);

  if (notFoundPaths.includes(asPath)) {
    return <PageNotFound />;
  }

  // Only render the iframe on the client-side.
  // Otherwise the iframe is already in the DOM before the
  // window.addEventListener() from useHandleWindowMessage gets registered,
  // and then the 404 logic does not get triggered because the listener is too
  // late to get the message from the AngularJS app.
  if (isClientSide) {
    return <IFrame url={legacyPath} />;
  }

  return null;
};

export const getServerSideProps = getApplicationServerSideProps(
  ({ req, query, cookies: rawCookies, queryClient }) => {
    const cookies = new Cookies(rawCookies);
    const { publicRuntimeConfig } = getConfig();
    const path = '/' + query.params.join('/');
    const redirect = getRedirect(
      path,
      publicRuntimeConfig.environment,
      cookies.cookies,
    );

    if (redirect) {
      // Don't include the `params` in the redirect URL's query.
      delete query.params;
      const queryParameters = new URLSearchParams(query);

      // Return the redirect as-is if there are no additional query parameters
      // to append.
      if (queryParameters.toString().length === 0) {
        return { redirect };
      }

      // Append query parameters to the redirect destination.
      const glue = redirect.destination.includes('?') ? '&' : '?';
      const redirectUrl =
        redirect.destination + glue + queryParameters.toString();
      return { redirect: { ...redirect, destination: redirectUrl } };
    }

    return { props: { cookies: rawCookies } };
  },
);

export default Fallback;
