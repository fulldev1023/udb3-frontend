import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

import { CalendarType } from '@/constants/CalendarType';
import { EventTypes } from '@/constants/EventTypes';
import { OfferType } from '@/constants/OfferType';
import { getTerms } from '@/pages/create/OfferForm';
import {
  additionalInformationStepConfiguration,
  AdditionalInformationStepVariant,
} from '@/pages/steps/AdditionalInformationStep';
import { typeAndThemeStepConfiguration } from '@/pages/steps/EventTypeAndThemeStep';
import { placeStepConfiguration } from '@/pages/steps/PlaceStep';
import { productionStepConfiguration } from '@/pages/steps/ProductionStep';
import { StepsForm } from '@/pages/steps/StepsForm';
import {
  convertTimeTableToSubEvents,
  timeTableStepConfiguration,
} from '@/pages/steps/TimeTableStep';
import type { Event } from '@/types/Event';
import type { SubEvent } from '@/types/Offer';
import type { Place } from '@/types/Place';
import type { Production } from '@/types/Production';
import { WorkflowStatusMap } from '@/types/WorkflowStatus';
import { parseOfferId } from '@/utils/parseOfferId';

type FormData = {
  typeAndTheme: {
    type: { id: string; label: string };
    theme: { id: string; label: string };
  };
  timeTable: any;
  place: Place;
  production: Production & { customOption?: boolean };
};

const convertSubEventsToTimeTable = (subEvents: SubEvent[] = []) => {
  const dateStart = format(new Date(subEvents[0].startDate), 'dd/MM/yyyy');
  const dateEnd = format(
    new Date(subEvents[subEvents.length - 1].endDate),
    'dd/MM/yyyy',
  );

  const data = subEvents.reduce((acc, subEvent) => {
    const date = new Date(subEvent.startDate);

    const formattedDate = format(date, 'dd/MM/yyyy');
    const formattedTime = format(date, "HH'h'mm'm'");

    const prevData = acc?.[formattedDate] ?? {};
    const insertKey = Math.max(0, Object.keys(prevData).length);

    const values = { ...prevData, [insertKey]: formattedTime };
    return { ...acc, [formattedDate]: values };
  }, {});

  return {
    dateStart,
    dateEnd,
    data,
  };
};

const MovieForm = (props) => {
  const { query, pathname } = useRouter();
  const parts = pathname.split('/');
  const { t } = useTranslation();

  const offerId = query.offerId || query.eventId || query.placeId;

  const convertOfferToFormData = (event: Event) => {
    return {
      scope: OfferType.EVENTS,
      typeAndTheme: {
        theme: event.terms.find((term) => term.domain === 'theme'),
        type: event.terms.find((term) => term.domain === 'eventtype'),
      },
      place: event.location,
      timeTable: convertSubEventsToTimeTable(event.subEvent),
      production: {
        production_id: event.production?.id,
        name: event.production?.title,
        events: event.production?.otherEvents,
      },
    };
  };

  const convertFormDataToOffer = ({
    production,
    typeAndTheme,
    place,
    timeTable,
  }: FormData) => {
    const subEvent = convertTimeTableToSubEvents(timeTable);
    return {
      mainLanguage: 'nl',
      name: production.name,
      calendarType:
        subEvent.length > 1 ? CalendarType.MULTIPLE : CalendarType.SINGLE,
      subEvent,
      location: {
        id: parseOfferId(place['@id']),
      },
      workflowStatus: WorkflowStatusMap.DRAFT,
      audienceType: 'everyone',
      ...getTerms(typeAndTheme),
    };
  };

  return (
    <StepsForm
      {...props}
      key={parts[parts.length - 1]} // needed to re-render the form between create and edit.
      label="udb-filminvoer"
      convertFormDataToOffer={convertFormDataToOffer}
      convertOfferToFormData={convertOfferToFormData}
      title={t(`movies.create.title`)}
      toastConfiguration={{
        messages: {
          calendar: t('movies.create.toast.success.calendar'),
          image: t('movies.create.toast.success.image'),
          description: t('movies.create.toast.success.description'),
          video: t('movies.create.toast.success.video'),
          typeAndTheme: t('movies.create.toast.success.theme'),
          location: t('movies.create.toast.success.location'),
          name: t('movies.create.toast.success.name'),
        },
        title: t('movies.create.toast.success.title'),
      }}
      configurations={[
        { name: 'scope', defaultValue: OfferType.EVENTS },
        {
          ...typeAndThemeStepConfiguration,
          title: () => t('movies.create.step1.title'),
          defaultValue: { type: { id: EventTypes.Film, label: 'Film' } },
          stepProps: {
            shouldHideType: true,
          },
        },
        timeTableStepConfiguration,
        {
          ...placeStepConfiguration,
          stepProps: {
            terms: [EventTypes.Bioscoop],
            chooseLabel: () => t('movies.create.actions.choose_cinema'),
            placeholderLabel: (t) => t('movies.create.cinema.placeholder'),
          },
        },
        productionStepConfiguration,
        {
          ...additionalInformationStepConfiguration,
          variant: AdditionalInformationStepVariant.MOVIE,
          title: () => t(`movies.create.step5.title`),
          stepProps: {
            offerId,
          },
        },
      ]}
    />
  );
};

export { MovieForm };
export type { FormData };
