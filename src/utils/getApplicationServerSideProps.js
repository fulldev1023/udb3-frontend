import { Cookies } from 'react-cookie';
import { QueryClient } from 'react-query';
import jwtDecode from 'jwt-decode';

const getApplicationServerSideProps = (callbackFn) => async ({
  req,
  query,
}) => {
  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
  }

  const { cookies } = new Cookies(req?.headers?.cookie);
  const isUnAuthorized = !cookies.token && !query?.jwt;

  if (isUnAuthorized) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const { exp } = jwtDecode(query?.jwt ?? cookies.token);

  if (!exp || Date.now() >= exp * 1000) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const queryClient = new QueryClient();

  if (!callbackFn) return { props: { cookies } };
  return await callbackFn({ req, query, queryClient, cookies });
};

export { getApplicationServerSideProps };
