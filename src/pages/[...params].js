import Frame from '../layouts/Frame';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import i18next from 'i18next';
import { useEffect } from 'react';

const Fallback = () => {
  let iframe;
  const router = useRouter();
  const [cookies] = useCookies(['token']);

  useEffect(() => {
    if (!cookies.token) {
      router.push('/login');
    }

    const queryString = new URLSearchParams({
      ...router.query,
      jwt: cookies.token,
      lang: i18next.language,
    }).toString();

    const path = router.asPath ? router.asPath : '';
    const parsedQueryString = queryString ? `?${queryString}` : '';
    const generatedPath = `${process.env.NEXT_PUBLIC_LEGACY_APP_URL}${path}${parsedQueryString}`;
    iframe = `<iframe src="${generatedPath}" />`;
  }, []);

  return (
    <Frame>
      {iframe && (
        <div
          css={`
            iframe {
              height: 100vh;
              width: 100%;
              border: 0;
            }
          `}
          dangerouslySetInnerHTML={{ __html: iframe }}
        />
      )}
    </Frame>
  );
};

export default Fallback;
