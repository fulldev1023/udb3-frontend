import { ChangeEvent, useMemo } from 'react';

import { Button, ButtonVariants } from '@/ui/Button';
import { DatePeriodPicker } from '@/ui/DatePeriodPicker';
import { FormElement } from '@/ui/FormElement';
import { RadioButtonGroup } from '@/ui/RadioButtonGroup';
import { Stack } from '@/ui/Stack';

import {
  useCalendarSelector,
  useIsPermanent,
} from './machines/calendarMachine';

const FixedDayOptions = {
  PERMANENT: 'permanent',
  PERIODIC: 'periodic',
} as const;

const options = [
  {
    label: 'Met start-en einddatum',
    value: FixedDayOptions.PERIODIC,
  },
  {
    label: 'Permanent',
    value: FixedDayOptions.PERMANENT,
  },
];

type FixedDaysProps = {
  onChooseWithStartAndEndDate: () => void;
  onChoosePermanent: () => void;
  onChangeStartDate: (date: Date | null) => void;
  onChangeEndDate: (date: Date | null) => void;
  onChangeOpeningHours: () => void;
};

export const FixedDays = ({
  onChooseWithStartAndEndDate,
  onChoosePermanent,
  onChangeStartDate,
  onChangeEndDate,
  onChangeOpeningHours,
}: FixedDaysProps) => {
  const isPermanent = useIsPermanent();

  const startDate = useCalendarSelector((state) => state.context.startDate);
  const endDate = useCalendarSelector((state) => state.context.endDate);

  const handleChangeOption = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === FixedDayOptions.PERIODIC) {
      onChooseWithStartAndEndDate();
    }
    if (value === FixedDayOptions.PERMANENT) {
      onChoosePermanent();
    }
  };

  const selectedOption = useMemo(() => {
    if (isPermanent) {
      return FixedDayOptions.PERMANENT;
    }
    return FixedDayOptions.PERIODIC;
  }, [isPermanent]);

  return (
    <Stack spacing={5} alignItems="flex-start">
      <FormElement
        Component={
          <RadioButtonGroup
            name="fixed-days-options"
            items={options}
            selected={selectedOption}
            onChange={handleChangeOption}
          />
        }
        id="fixed-days-options"
      />
      <DatePeriodPicker
        spacing={3}
        id={`calendar-step-fixed`}
        dateStart={new Date(startDate)}
        dateEnd={new Date(endDate)}
        onDateStartChange={onChangeStartDate}
        onDateEndChange={onChangeEndDate}
      />
      <Button
        variant={ButtonVariants.SECONDARY}
        onClick={() => console.log('open modal')}
      >
        Openingsuren toevoegen
      </Button>
    </Stack>
  );
};
