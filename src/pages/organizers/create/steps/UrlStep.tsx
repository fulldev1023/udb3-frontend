import { FormEvent, useEffect, useMemo } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import { useGetOrganizersByWebsiteQuery } from '@/hooks/api/organizers';
import { SupportedLanguage } from '@/i18n/index';
import { StepProps } from '@/pages/steps/Steps';
import { Organizer } from '@/types/Organizer';
import { Alert, AlertVariants } from '@/ui/Alert';
import { FormElement } from '@/ui/FormElement';
import { Input } from '@/ui/Input';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';
import { getLanguageObjectOrFallback } from '@/utils/getLanguageObjectOrFallback';
import { prefixUrlWithHttps } from '@/utils/url';

type UrlStepProps = StackProps & StepProps;

const UrlStep = ({
  formState: { errors, isDirty },
  control,
  watch,
  onChange,
  mainLanguage,
  setError,
  clearErrors,
  name,
  ...props
}: UrlStepProps) => {
  const { t, i18n } = useTranslation();

  const [watchedUrl] = useWatch({
    control,
    name: ['nameAndUrl.url'],
  });

  const getOrganizersByWebsiteQuery = useGetOrganizersByWebsiteQuery(
    {
      website: watchedUrl,
    },
    { enabled: !!watchedUrl },
  );

  const existingOrganization: Organizer | undefined =
    //@ts-expect-error
    getOrganizersByWebsiteQuery.data?.member?.[0];

  const isUrlAlreadyTaken = errors.nameAndUrl?.url?.type === 'not_unique';

  console.log({ existingOrganization });

  useEffect(() => {
    if (existingOrganization) {
      console.log('should set error');
      setError('nameAndUrl.url', { type: 'not_unique' });
      return;
    }
    clearErrors('nameAndUrl.url');
  }, [
    existingOrganization,
    // @ts-expect-error
    getOrganizersByWebsiteQuery.data,
    setError,
    clearErrors,
  ]);

  return (
    <Stack {...getStackProps(props)}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          return (
            <Stack spacing={2}>
              <FormElement
                label={t('organizers.create.step1.url')}
                id="organizer-url"
                flex={2}
                Component={
                  <Input
                    value={field.value?.url}
                    onChange={(event) => {
                      field.onChange({
                        ...field.value,
                        url: (event.target as HTMLInputElement).value,
                      });
                    }}
                    onBlur={(event: FormEvent<HTMLInputElement>) => {
                      const newValue = (event.target as HTMLInputElement).value;
                      field.onChange({
                        ...field.value,
                        url: prefixUrlWithHttps(newValue),
                      });
                    }}
                  />
                }
                info={
                  isDirty && isUrlAlreadyTaken && existingOrganization ? (
                    <Alert variant={AlertVariants.WARNING}>
                      <Trans
                        i18nKey={`organizers.create.step1.errors.url_not_unique`}
                        values={{
                          organizerName: getLanguageObjectOrFallback(
                            existingOrganization?.name,
                            i18n.language as SupportedLanguage,
                            existingOrganization.mainLanguage as SupportedLanguage,
                          ),
                        }}
                      />
                    </Alert>
                  ) : (
                    <Alert variant={AlertVariants.PRIMARY}>
                      {t('organizers.create.step1.url_requirements')}
                    </Alert>
                  )
                }
                error={
                  errors.nameAndUrl &&
                  errors.nameAndUrl?.url?.type !== 'not_unique' &&
                  t(
                    `organizers.create.step1.errors.url_${errors.nameAndUrl?.url.type}`,
                  )
                }
              />
            </Stack>
          );
        }}
      />
    </Stack>
  );
};

export { UrlStep };
