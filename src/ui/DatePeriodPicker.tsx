import { useTranslation } from 'react-i18next';

import { DatePicker } from './DatePicker';
import type { InlineProps } from './Inline';
import { getInlineProps, Inline } from './Inline';
import { Label, LabelVariants } from './Label';
import { Stack } from './Stack';

type Props = InlineProps & {
  id: string;
  dateStart: Date;
  dateEnd: Date;
  setDateStart: (date: Date) => void;
  setDateEnd: (date: Date) => void;
};

const DatePeriodPicker = ({
  id,
  dateStart,
  dateEnd,
  setDateStart,
  setDateEnd,
  ...props
}: Props) => {
  const { t } = useTranslation();

  const idPrefix = `${id}date-period-picker`;

  return (
    <Inline spacing={5} {...getInlineProps(props)}>
      <Stack>
        <Label variant={LabelVariants.BOLD} htmlFor={`${idPrefix}-start`}>
          {t('time_table.start')}
        </Label>
        <DatePicker
          id={`${idPrefix}-start`}
          selected={dateStart}
          onChange={(newDateStart) => {
            setDateStart(newDateStart);
            if (dateEnd.getTime() < newDateStart.getTime()) {
              setDateEnd(newDateStart);
            }
          }}
        />
      </Stack>
      <Stack>
        <Label variant={LabelVariants.BOLD} htmlFor={`${idPrefix}-end`}>
          {t('time_table.end')}
        </Label>
        <DatePicker
          id={`${idPrefix}-end`}
          selected={dateEnd}
          onChange={(newDateEnd) => {
            setDateEnd(newDateEnd);
            if (dateStart.getTime() > newDateEnd.getTime()) {
              setDateStart(newDateEnd);
            }
          }}
          minDate={dateStart}
        />
      </Stack>
    </Inline>
  );
};

export { DatePeriodPicker };
