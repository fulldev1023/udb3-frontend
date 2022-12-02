import { useCallback, useEffect } from 'react';

import { BookingAvailabilityType } from '@/constants/BookingAvailabilityType';
import { OfferStatus } from '@/constants/OfferStatus';
import {
  useChangeCalendarMutation,
  useGetEventByIdQuery,
} from '@/hooks/api/events';
import { Event } from '@/types/Event';
import { Button } from '@/ui/Button';
import { Panel } from '@/ui/Panel';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';

import {
  CalendarMachineProvider,
  createDayId,
  createOpeninghoursId,
  initialCalendarContext,
  useCalendarSelector,
  useIsFixedDays,
  useIsIdle,
  useIsOneOrMoreDays,
  useIsPeriodic,
} from '../machines/calendarMachine';
import { useCalendarHandlers } from '../machines/useCalendarHandlers';
import { FormDataUnion, StepsConfiguration } from '../Steps';
import { CalendarOptionToggle } from './CalendarOptionToggle';
import { FixedDays } from './FixedDays';
import { OneOrMoreDays } from './OneOrMoreDays';

type CalendarStepProps = StackProps & { eventId?: string };

const CalendarStep = ({ eventId, ...props }: CalendarStepProps) => {
  const isOneOrMoreDays = useIsOneOrMoreDays();
  const isFixedDays = useIsFixedDays();
  const isIdle = useIsIdle();

  // @SIMON selectors here or rather in the submit handler
  const isPeriodic = useIsPeriodic();
  const startDate = useCalendarSelector((state) => state.context.startDate);
  const endDate = useCalendarSelector((state) => state.context.endDate);
  const calendarStateType = useCalendarSelector((state) => state.value);
  const days = useCalendarSelector((state) => state.context.days);
  const openingHours = useCalendarSelector(
    (state) => state.context.openingHours,
  );

  const {
    handleLoadInitialContext: loadInitialContext,
    handleAddDay,
    handleDeleteDay,
    handleChangeStartDate,
    handleChangeEndDate,
    handleChangeStartDateOfDay,
    handleChangeEndDateOfDay,
    handleChangeStartTime,
    handleChangeEndTime,
    handleChooseOneOrMoreDays,
    handleChooseFixedDays,
    handleChooseWithStartAndEndDate,
    handleChoosePermanent,
    handleChangeOpeningHours,
  } = useCalendarHandlers();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleLoadInitialContext = useCallback(loadInitialContext, []);

  useEffect(() => {
    if (eventId) return;
    handleLoadInitialContext();
  }, [eventId, handleLoadInitialContext]);

  const getEventByIdQuery = useGetEventByIdQuery({ id: eventId });

  // @ts-expect-error
  const event: Event | undefined = getEventByIdQuery.data;

  useEffect(() => {
    const initialContext = initialCalendarContext;

    if (!event) return;

    const days = (event.subEvent ?? []).map((subEvent) => ({
      id: createDayId(),
      startDate: subEvent.startDate,
      endDate: subEvent.endDate,
    }));

    const openingHours = (event.openingHours ?? []).map((openingHour) => ({
      id: createOpeninghoursId(),
      opens: openingHour.opens,
      closes: openingHour.closes,
      dayOfWeek: openingHour.dayOfWeek,
    }));

    const newContext = {
      ...initialContext,
      ...(days.length > 0 && { days }),
      ...(openingHours.length > 0 && { openingHours }),
      ...(event && { startDate: event.startDate ?? '' }),
      ...(event && { endDate: event.endDate ?? '' }),
    };

    handleLoadInitialContext(newContext, event.calendarType);
  }, [event, handleLoadInitialContext]);

  const changeCalendarMutation = useChangeCalendarMutation({
    onSuccess: () => {
      console.log('calendar mutation success');
    },
  });

  const convertStateToFormData = () => {
    const subEvent = days.map((day) => ({
      startDate: new Date(day.startDate).toISOString(),
      endDate: new Date(day.endDate).toISOString(),
      bookingAvailability: {
        type: BookingAvailabilityType.AVAILABLE,
      }, // Always available or depends on current state?
      status: {
        type: OfferStatus.AVAILABLE,
      },
    }));

    const newOpeningHours = openingHours.map((openingHour) => ({
      opens: openingHour.opens,
      closes: openingHour.closes,
      dayOfWeek: openingHour.dayOfWeek,
    }));

    const newStartDate = new Date(startDate).toISOString();
    const newEndDate = new Date(endDate).toISOString();

    return {
      ...(isOneOrMoreDays && { subEvent }),
      ...(isFixedDays && { openingHours: newOpeningHours }),
      ...(isPeriodic && { startDate: newStartDate, endDate: newEndDate }),
    };
  };

  const handleSubmitCalendarMutation = async () => {
    if (isIdle) return;

    const formData = convertStateToFormData();

    const calendarType =
      calendarStateType === 'string'
        ? calendarStateType
        : Object.keys(calendarStateType)[0];

    await changeCalendarMutation.mutateAsync({
      id: eventId,
      calendarType,
      ...formData,
    });
  };

  return (
    <Stack spacing={4} {...getStackProps(props)}>
      <CalendarOptionToggle
        onChooseOneOrMoreDays={handleChooseOneOrMoreDays}
        onChooseFixedDays={handleChooseFixedDays}
      />
      <Panel backgroundColor="white" padding={5}>
        {isFixedDays && (
          <FixedDays
            onChooseWithStartAndEndDate={handleChooseWithStartAndEndDate}
            onChoosePermanent={handleChoosePermanent}
            onChangeStartDate={handleChangeStartDate}
            onChangeEndDate={handleChangeEndDate}
            onChangeOpeningHours={handleChangeOpeningHours}
          />
        )}
        {isOneOrMoreDays && (
          <OneOrMoreDays
            onDeleteDay={handleDeleteDay}
            onChangeStartDate={handleChangeStartDateOfDay}
            onChangeEndDate={handleChangeEndDateOfDay}
            onChangeStartTime={handleChangeStartTime}
            onChangeEndTime={handleChangeEndTime}
            onAddDay={handleAddDay}
          />
        )}
      </Panel>
      <Button onClick={handleSubmitCalendarMutation}>Submit payload</Button>
    </Stack>
  );
};

const calendarStepConfiguration: StepsConfiguration<FormDataUnion> = {
  // eslint-disable-next-line react/display-name
  Component: (props: any) => (
    <CalendarMachineProvider>
      <CalendarStep {...props} />
    </CalendarMachineProvider>
  ),
  name: 'calendar',
  title: ({ t }) => 'Wanneer vindt dit evenement of deze activiteit plaats?',
  shouldShowStep: ({ watch, eventId, formState }) => {
    return true;
  },
};

export { CalendarStep, calendarStepConfiguration };
