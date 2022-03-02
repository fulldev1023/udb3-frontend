import type { BoxProps } from '@/ui/Box';
import { Box } from '@/ui/Box';
import { inlineProps } from '@/ui/Inline';
import type { StackProps } from '@/ui/Stack';
import { getStackProps, Stack } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';
import { Title } from '@/ui/Title';

type StepProps = StackProps & { title: string; stepNumber: number };

type StepsConfiguration = Array<{
  Component: any;
  inputKey?: string;
  step?: number;
  title: string;
  shouldShowNextStep?: boolean;
  additionalProps?: { [key: string]: unknown };
}>;

type NumberIndicatorProps = {
  children: number;
} & BoxProps;

const NumberIndicator = ({ children, ...props }: NumberIndicatorProps) => {
  return (
    <Box
      borderRadius="50%"
      width="1.8rem"
      height="1.8rem"
      lineHeight="1.8rem"
      backgroundColor={getValue('stepNumber.backgroundColor')}
      padding={0}
      fontSize="1rem"
      fontWeight="bold"
      color="white"
      textAlign="center"
      {...props}
    >
      {children}
    </Box>
  );
};

const StepWrapper = ({ stepNumber, children, title, ...props }: StepProps) => {
  return (
    <Stack spacing={4} width="100%" {...getStackProps(props)}>
      <Title
        color={getValue('title.color')}
        lineHeight="220%"
        alignItems="center"
        spacing={3}
        css={`
          border-bottom: 1px solid ${getValue('title.borderColor')};
        `}
      >
        <NumberIndicator>{stepNumber}</NumberIndicator>
        <Text>{title}</Text>
      </Title>
      {children}
    </Stack>
  );
};

StepWrapper.defaultProps = {
  title: '',
};

const getValue = getValueFromTheme('moviesCreatePage');

type StepsProps = {
  formState: { errors: any };
  control: any;
  getValues: any;
  register: any;
  mode: 'UPDATE' | 'CREATE';
  fieldLoading: string;
  onChange: (value: string, field: string) => void;
  configuration: StepsConfiguration;
};

const Steps = ({
  mode,
  onChange,
  configuration,
  fieldLoading,
  ...props
}: StepsProps) => {
  const keys = Object.keys(props.getValues());

  return (
    <Stack spacing={5}>
      {configuration.map(
        (
          { Component: Step, inputKey, additionalProps = {}, step, title },
          index: number,
        ) => {
          const shouldShowNextStep =
            configuration[index - 1]?.shouldShowNextStep ?? true;

          if (
            !keys.includes(inputKey) &&
            !shouldShowNextStep &&
            mode !== 'UPDATE'
          ) {
            return null;
          }

          const stepNumber = step ?? index + 1;

          return (
            <StepWrapper
              stepNumber={stepNumber}
              key={`step${stepNumber}`}
              title={title}
            >
              <Step
                onChange={(value) => onChange(inputKey, value)}
                key={index}
                loading={!!(inputKey && fieldLoading === inputKey)}
                {...props}
                {...additionalProps}
              />
            </StepWrapper>
          );
        },
      )}
    </Stack>
  );
};

export { Steps };
export type { StepProps, StepsConfiguration };
