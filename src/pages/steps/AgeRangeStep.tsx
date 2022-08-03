import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { css } from 'styled-components';

import { Button, ButtonVariants } from '@/ui/Button';
import { Inline } from '@/ui/Inline';
import { Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';

const getValue = getValueFromTheme('ageRange');

const AgeRanges = {
  ALL: {},
  TODDLERS: { min: 0, max: 2 },
  PRESCHOOLERS: { min: 3, max: 5 },
  KIDS: { min: 6, max: 11 },
  TEENAGERS: { min: 12, max: 15 },
  YOUNGSTERS: { min: 16, max: 26 },
  ADULTS: { min: 18 },
  SENIORS: { min: 65 },
  CUSTOM: {},
} as const;

const AgeRangeStep = ({
  field,
  control,
  onChange,
}: {
  field: any;
  control: any;
  onChange: any;
}) => {
  const { t } = useTranslation();

  const getAgeRangeLabel = (key: string): string => {
    if (
      typeof AgeRanges[key].min === 'number' &&
      typeof AgeRanges[key].max === 'number'
    ) {
      return `${AgeRanges[key].min}-${AgeRanges[key].max}`;
    }
    if (typeof AgeRanges[key].min === 'number') {
      return `${AgeRanges[key].min}+`;
    }
    return '';
  };

  const ageRangeLabelToApiFormat = (label: string) => {
    if (!label) return '-';
    return label.replace('+', '-');
  };

  const isSelectedAgeRange = (key: string, ageRangeLabel: string): boolean => {
    if (key === 'CUSTOM') return false;
    return (
      field.value?.typicalAgeRange === ageRangeLabelToApiFormat(ageRangeLabel)
    );
  };

  return (
    //TODO: Handle custom ranges
    <Controller
      name="nameAndAge"
      control={control}
      render={({ field }) => {
        return (
          <Stack spacing={2}>
            <Text fontWeight="bold">{t(`create.step4.age.title`)}</Text>
            <Inline spacing={3} flexWrap="wrap" maxWidth="40rem">
              {Object.keys(AgeRanges).map((key) => {
                const ageRangeLabel = getAgeRangeLabel(key);
                return (
                  <Button
                    width="auto"
                    marginBottom={3}
                    display="inline-flex"
                    key={key}
                    variant={
                      isSelectedAgeRange(key, ageRangeLabel)
                        ? ButtonVariants.SUCCESS
                        : ButtonVariants.SECONDARY
                    }
                    onClick={() => {
                      field.onChange({
                        ...field.value,
                        typicalAgeRange: ageRangeLabelToApiFormat(
                          ageRangeLabel,
                        ),
                      });
                      onChange({
                        ...field.value,
                        typicalAgeRange: ageRangeLabelToApiFormat(
                          ageRangeLabel,
                        ),
                      });
                    }}
                  >
                    {t(`create.step4.age.${key.toLowerCase()}`)}
                    <span
                      css={css`
                        color: ${getValue('rangeTextColor')};
                        font-size: 0.9rem;
                      `}
                    >
                      &nbsp;{ageRangeLabel}
                    </span>
                  </Button>
                );
              })}
            </Inline>
          </Stack>
        );
      }}
    />
  );
};

export { AgeRangeStep };
