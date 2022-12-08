import { Controller, Path } from 'react-hook-form';
import * as yup from 'yup';

import {
  useChangeNameMutation,
  useChangeTypicalAgeRangeMutation,
} from '@/hooks/api/events';
import { parseSpacing } from '@/ui/Box';
import { Stack } from '@/ui/Stack';

import { AgeRangeStep } from './AgeRangeStep';
import { NameStep } from './NameStep';
import {
  FormDataUnion,
  getStepProps,
  StepProps,
  StepsConfiguration,
} from './Steps';

const useEditNameAndAgeRange = <TFormData extends FormDataUnion>({
  scope,
  onSuccess,
  offerId,
}) => {
  const changeNameMutation = useChangeNameMutation({
    onSuccess: () => onSuccess('basic_info'),
  });

  const changeTypicalAgeRangeMutation = useChangeTypicalAgeRangeMutation({
    onSuccess: () => onSuccess('basic_info'),
  });

  return async ({ nameAndAgeRange }: TFormData) => {
    const { name, typicalAgeRange } = nameAndAgeRange;

    if (typicalAgeRange) {
      await changeTypicalAgeRangeMutation.mutateAsync({
        eventId: offerId,
        typicalAgeRange,
      });
    }

    await changeNameMutation.mutateAsync({
      id: offerId,
      lang: 'nl',
      name: name.nl,
    });
  };
};

const NameAndAgeRangeStep = <TFormData extends FormDataUnion>({
  control,
  name,
  ...props
}: StepProps<TFormData>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={() => {
        return (
          <Stack spacing={4} maxWidth={parseSpacing(11)}>
            <NameStep {...getStepProps(props)} name={name} control={control} />
            <AgeRangeStep
              {...getStepProps(props)}
              name={name}
              control={control}
            />
          </Stack>
        );
      }}
    />
  );
};

const nameAndAgeRangeStepConfiguration: StepsConfiguration<FormDataUnion> = {
  Component: NameAndAgeRangeStep,
  name: 'nameAndAgeRange',
  title: ({ t }) => t('create.name_and_age.title'),
  validation: yup.object().shape({
    name: yup.object().shape({}).required(),
    typicalAgeRange: yup.string().required(),
  }),
  shouldShowStep: ({ watch }) => {
    const location = watch('location');
    return (
      !!location?.place || location?.isOnline || !!location?.streetAndNumber
    );
  },
};

export { nameAndAgeRangeStepConfiguration, useEditNameAndAgeRange };
