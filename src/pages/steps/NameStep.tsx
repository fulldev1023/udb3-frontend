import { FormEvent } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { parseSpacing } from '@/ui/Box';
import { FormElement } from '@/ui/FormElement';
import { Input } from '@/ui/Input';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';
import { Text, TextVariants } from '@/ui/Text';

import { StepProps } from './Steps';

type NameStepProps = StackProps & StepProps;

const NameStep = ({
  formState: { errors },
  control,
  onChange,
  mainLanguage,
  ...props
}: NameStepProps) => {
  const { t, i18n } = useTranslation();

  const scope = useWatch({ control, name: 'scope' });

  return (
    <Stack {...getStackProps(props)}>
      <Controller
        name={'nameAndAgeRange'}
        control={control}
        render={({ field }) => {
          return (
            <Stack spacing={2}>
              <FormElement
                label={t(`create.name_and_age.name.title_${scope}`)}
                flex={2}
                id="event-name"
                Component={
                  <Input
                    value={field.value?.name?.[mainLanguage]}
                    onChange={(event) => {
                      field.onChange({
                        ...field.value,
                        name: {
                          [mainLanguage]: (event.target as HTMLInputElement)
                            .value,
                        },
                      });
                    }}
                    onBlur={(event: FormEvent<HTMLInputElement>) => {
                      field.onChange({
                        ...field.value,
                        name: {
                          [mainLanguage]: (event.target as HTMLInputElement)
                            .value,
                        },
                      });
                      onChange({
                        ...field.value,
                        name: {
                          [mainLanguage]: (event.target as HTMLInputElement)
                            .value,
                        },
                      });
                    }}
                  />
                }
                error={
                  errors.nameAndAgeRange?.name &&
                  t('create.name_and_age.validation_messages.name.required')
                }
              />
              <Text
                variant={TextVariants.MUTED}
                maxWidth={parseSpacing(9)}
                dangerouslySetInnerHTML={{
                  __html: t(`create.name_and_age.name.tip_${scope}`),
                }}
                css={`
                  strong {
                    font-weight: bold;
                  }
                `}
              />
            </Stack>
          );
        }}
      />
    </Stack>
  );
};

export { NameStep };
