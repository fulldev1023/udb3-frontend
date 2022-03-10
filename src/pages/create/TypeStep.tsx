import { Controller } from 'react-hook-form';

import type { FormDataIntersection, StepProps } from '@/pages/Steps';
import { Text } from '@/ui/Text';

const TypeStep = <TFormData extends FormDataIntersection>({
  control,
  field,
}: StepProps<TFormData>) => {
  return (
    <Controller<TFormData>
      control={control}
      name={field}
      render={({ field }) => {
        return <Text>{field.name}</Text>;
      }}
    />
  );
};

export { TypeStep };