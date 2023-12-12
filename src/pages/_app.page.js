import '@fortawesome/fontawesome-svg-core/styles.css';

import { UserProvider } from '@auth0/nextjs-auth0/client';
import { config } from '@fortawesome/fontawesome-svg-core';
import Hotjar from '@hotjar/browser';
import NextHead from 'next/head';
import PropTypes from 'prop-types';
import { cloneElement, useEffect } from 'react';
import { Cookies, CookiesProvider } from 'react-cookie';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Hydrate } from 'react-query/hydration';

import { defaultCookieOptions } from '@/hooks/useCookiesWithOptions';
import { createCookieName, FeatureFlags } from '@/hooks/useFeatureFlag';
import i18n from '@/i18n/index';
import Layout from '@/layouts/index';
import { GlobalStyle } from '@/styles/GlobalStyle';
import { ThemeProvider } from '@/ui/ThemeProvider';

import { AnnouncementModalProvider } from '../context/AnnouncementModalContext';

const cookies = new Cookies();

if (typeof window !== 'undefined') {
  window.FeatureFlags = FeatureFlags;

  window.setFeatureFlag = (featureFlagName, value) => {
    cookies.set(createCookieName(featureFlagName), value, defaultCookieOptions);
    window.getCurrentFeatureFlagConfiguration();
  };

  window.getCurrentFeatureFlagConfiguration = () => {
    // eslint-disable-next-line no-console
    console.table(
      Object.entries(FeatureFlags).reduce(
        (acc, [constant, featureFlagName]) => ({
          ...acc,
          [`FeatureFlags.${constant}`]: {
            enabled:
              cookies.get(createCookieName(featureFlagName)) === 'true'
                ? '✅'
                : '🚫',
          },
        }),
        {},
      ),
    );
  };
}

const ContextProvider = ({ providers, children }) => {
  return providers.reverse().reduce((AccumulatedProviders, current) => {
    const [CurrentProvider, currentProps] = Array.isArray(current)
      ? current
      : [current, {}];
    // eslint-disable-next-line react/prop-types
    return (
      <CurrentProvider {...currentProps}>
        {AccumulatedProviders}
      </CurrentProvider>
    );
  }, children);
};

ContextProvider.propTypes = {
  providers: PropTypes.array,
  children: PropTypes.node,
};

config.autoAddCss = false;

const Head = () => {
  const { t } = useTranslation();

  return (
    <NextHead>
      <meta
        key="viewport"
        name="viewport"
        content="initial-scale=1.0, width=device-width"
      />
      <title key="title">UiTdatabank</title>
      <meta name="description" content={t('description')} />
    </NextHead>
  );
};

const queryClient = new QueryClient();

const isServer = () => typeof window === 'undefined';

const App = ({ Component, pageProps, children }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    Hotjar.init(181435, 6);
  }, []);

  return (
    <>
      <Head />
      <UserProvider />
      <ContextProvider
        providers={[
          [I18nextProvider, { i18n }],
          ThemeProvider,
          [
            CookiesProvider,
            {
              cookies: isServer()
                ? new Cookies(pageProps.cookies ?? '')
                : undefined,
            },
          ],
          [QueryClientProvider, { client: queryClient }],
          [Hydrate, { state: pageProps?.dehydratedState ?? {} }],
          AnnouncementModalProvider,
        ]}
      >
        <GlobalStyle />
        <ReactQueryDevtools initialIsOpen={false} />
        <Layout>
          {children ? (
            cloneElement(children, { ...children.props, ...pageProps })
          ) : (
            <Component {...pageProps} />
          )}
        </Layout>
      </ContextProvider>
    </>
  );
};

App.propTypes = {
  Component: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  pageProps: PropTypes.object,
  children: PropTypes.node,
};

export default App;
