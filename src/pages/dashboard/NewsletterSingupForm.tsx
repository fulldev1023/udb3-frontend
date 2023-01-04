import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { QueryStatus } from '@/hooks/api/authenticated-query';
import { useAddNewsletterSubscriberMutation } from '@/hooks/api/newsletter';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Button } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Image } from '@/ui/Image';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { LabelPositions } from '@/ui/Label';
import type { PanelProps } from '@/ui/Panel';
import { Panel } from '@/ui/Panel';
import { Paragraph } from '@/ui/Paragraph';
import { Stack } from '@/ui/Stack';
import { Title } from '@/ui/Title';

const isEmail = (value: string) =>
  yup.string().required().email().isValidSync(value);

type Props = PanelProps;

const NewsletterSignupForm = (props: Props) => {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);

  const { t } = useTranslation();

  const addNewsletterSubscriberMutation = useAddNewsletterSubscriberMutation();

  const handleSubmit = () => {
    const isEmailValid = isEmail(email);
    setIsValid(isEmailValid);

    if (isEmailValid) {
      addNewsletterSubscriberMutation.mutate({ email });
    }
  };

  return (
    <Panel
      backgroundColor="white"
      padding={5}
      spacing={4}
      maxWidth="64rem"
      {...props}
    >
      <Inline as="div" spacing={4} flexWrap="wrap">
        {addNewsletterSubscriberMutation.status === QueryStatus.SUCCESS ? (
          <Stack spacing={4}>
            <Title>{t('dashboard.newsletter.success.title')}</Title>
            <Paragraph>{t('dashboard.newsletter.success.content')}</Paragraph>
          </Stack>
        ) : (
          <Stack spacing={4}>
            <Title>{t('dashboard.newsletter.title')}</Title>
            <Paragraph>{t('dashboard.newsletter.content')}</Paragraph>
            <Inline
              as="form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              alignItems="center"
              spacing={4}
            >
              <FormElement
                id="newletter-email"
                label="Email"
                labelPosition={LabelPositions.LEFT}
                Component={
                  <Input
                    type="email"
                    placeholder="email@domain.be"
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    value={email}
                    flex={1}
                    minWidth="20rem"
                    maxWidth="30rem"
                  />
                }
              />

              <Button>{t('dashboard.newsletter.subscribe')}</Button>
            </Inline>
            {!isValid && (
              <Alert variant={AlertVariants.DANGER}>
                {t('dashboard.newsletter.invalid')}
              </Alert>
            )}
          </Stack>
        )}

        <Image
          src={`/assets/${t('dashboard.newsletter.logo')}`}
          alt={t('dashboard.newsletter.logo_alt')}
          width={200}
          paddingLeft={5}
        />
      </Inline>
    </Panel>
  );
};

export { NewsletterSignupForm };
