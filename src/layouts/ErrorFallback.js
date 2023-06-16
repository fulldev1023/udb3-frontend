import * as Sentry from '@sentry/nextjs';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Icon, Icons } from '@/ui/Icon';
import { Link } from '@/ui/Link';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';
import { Title } from '@/ui/Title';

const getValue = getValueFromTheme('pageError');

const MailToSupportLink = () => {
  const { t } = useTranslation();
  return (
    <Link href={`mailto:${t('error.email')}`} css="display: inline">
      {t('error.email')}
    </Link>
  );
};

const ErrorFallback = ({ error }) => {
  const { t } = useTranslation();
  useEffect(() => {
    if (error) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <Stack
      textAlign="center"
      alignItems="center"
      marginY={6}
      spacing={3}
      flex={1}
      height="100vh"
    >
      <Icon
        name={Icons.EXCLAMATION_TRIANGLE}
        width="10rem"
        height="auto"
        color={getValue('iconColor')}
      />
      <Title size={1}>{t('error.title')}</Title>
      <Text maxWidth={550}>
        <Trans i18nKey="error.description">
          Er ging iets mis. Herlaad de pagina om opnieuw te proberen. Neem
          contact op met <MailToSupportLink /> als dit probleem zich blijft
          voordoen
        </Trans>
      </Text>
    </Stack>
  );
};

ErrorFallback.propTypes = {
  error: PropTypes.object,
};

export { ErrorFallback };
