import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { eventTypesWithNoThemes } from '@/constants/EventTypes';
import { OfferTypes, ScopeTypes } from '@/constants/OfferType';
import { useGetEntityByIdAndScope } from '@/hooks/api/scope';
import { Scope } from '@/pages/create/OfferForm';
import { Offer } from '@/types/Offer';
import { Organizer } from '@/types/Organizer';
import { Inline } from '@/ui/Inline';
import { Link } from '@/ui/Link';
import { Notification } from '@/ui/Notification';
import { Text } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';

import { Field } from './AdditionalInformationStep';
import dynamic from 'next/dynamic';
import { css } from 'styled-components';
const GaugeComponent = dynamic(() => import('react-gauge-component'), {
  ssr: false,
});

const getValue = getValueFromTheme('colors');

const BarometerIcon = ({ rotationValue }: { rotationValue: number }) => {
  return (
    <div
      css={`
        width: 70px;
      `}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 528 443">
        <g fill="none">
          <g fill="#F19E4A">
            <path d="M127.4 380.15a156.19 156.19 0 0 1-40.74-108.99l-10.1-21.54-62.37 3.6-10.7 17.94A239.13 239.13 0 0 0 68.1 438.55a7.86 7.86 0 0 0 11.28.14l47.72-47.72a7.84 7.84 0 0 0 .28-10.82Z" />
            <path d="m134.7 160.72.5.52a156.28 156.28 0 0 0-48.54 109.92H3.5v-.47c1.08-65.96 28.95-125.4 73.06-168.12l.23.23 57.92 57.92Z" />
          </g>
          <path
            fill="#F9DE58"
            d="M160.48 49.36C98.6 72.1 51.61 117.99 25.77 173.67l75.77 33.76a156.22 156.22 0 0 1 86.43-79.56c.76-.3 1.55-.58 2.32-.86l-.01-.03 6-28.25-18.3-47.67-17.5-1.7Z"
          />
          <path
            fill="#C2DF6B"
            d="M411.16 103.19s-21.09-5.07-21.61-4.87c-.53.2-40.58 43.92-40.58 43.92l3.53 19.62a156.2 156.2 0 0 1 47.6 109.31l6.13 9.75h70.11l6.94-9.77a239.12 239.12 0 0 0-72.12-167.96Z"
          />
          <circle cx="241.52" cy="271.17" r="105.89" fill="#EFEDEE" />
          <path
            fill="#F9DE58"
            d="M304.65 42.55C240.9 25.7 176.1 36.32 122.99 67.12l-6.73 23.37 28.48 48.22 20.96-.47a156.22 156.22 0 0 1 116.43-15.61l2.4.63v-.03l21.12-19.7L318.01 54l-13.36-11.44Z"
          />
          <path
            fill="#90CC4F"
            d="m483.28 271.15.03 3.54c0 63.32-24.52 120.9-64.58 163.77a7.89 7.89 0 0 1-11.35.23l-47.72-47.72a7.84 7.84 0 0 1-.3-10.8 156.2 156.2 0 0 0 40.75-109l83.17-.02Z"
          />
          <path
            fill="#90CC4F"
            d="M467.03 187.17a195 195 0 0 1 1.28 3.25c22.42 58.42 19.92 120.33-2.3 174.24a7.95 7.95 0 0 1-10.5 4.28L394.04 342a7.68 7.68 0 0 1-4.1-9.86 153.36 153.36 0 0 0-.56-115.16l77.64-29.82Z"
          />
          <path
            fill="#C2DF6B"
            d="m411.16 103.19-.15.16-58.51 58.51a156.23 156.23 0 0 0-105.63-43.9V34.78a239.12 239.12 0 0 1 164.3 68.41Z"
          />
          <path
            css={`
              transform: rotate(${rotationValue}deg);
              transform-origin: 47% 61%;
              transition: transform 1s ease-in-out;
            `}
            fill="#B3ADB5"
            d="m121.3 385.95 102.98-64.2a53.9 53.9 0 0 0 56.94-87.33 53.88 53.88 0 0 0-92.4 48.25L115.01 379c-3.24 4.21 1.8 9.76 6.3 6.95Z"
          />
        </g>
      </svg>
    </div>
  );
};

type Weights = { [key: string]: { weight: number; mandatory: boolean } };

const scoreWeightMapping: Weights = {
  type: {
    weight: 12,
    mandatory: true,
  },
  theme: {
    weight: 5,
    mandatory: false,
  },
  calendar: {
    weight: 12,
    mandatory: true,
  },
  location: {
    weight: 12,
    mandatory: true,
  },
  name: {
    weight: 12,
    mandatory: true,
  },
  typicalAgeRange: {
    weight: 12,
    mandatory: true,
  },
  media: {
    weight: 8,
    mandatory: false,
  },
  description: {
    weight: 9,
    mandatory: false,
  },
  price_info: {
    weight: 7,
    mandatory: false,
  },
  contact_info: {
    weight: 3,
    mandatory: false,
  },
  booking_info: {
    weight: 3,
    mandatory: false,
  },
  organizer: {
    weight: 3,
    mandatory: false,
  },
  video: {
    weight: 2,
    mandatory: false,
  },
};

const organizerScoreWeightMapping: Weights = {
  name: {
    weight: 20,
    mandatory: true,
  },
  url: {
    weight: 20,
    mandatory: true,
  },
  contact_info: {
    weight: 20,
    mandatory: false,
  },
  description: {
    weight: 15,
    mandatory: false,
  },
  media: {
    weight: 15,
    mandatory: false,
  },
  location: {
    weight: 10,
    mandatory: false,
  },
};

type Props = {
  offerId: string;
  scope: Scope;
  completedFields: Record<Field, boolean>;
};

type EntityWithMedia =
  | (Offer & { images: undefined })
  | (Organizer & {
      terms: undefined;
      mediaObject: undefined;
      videos: undefined;
    });

const getScopeWeights = (scope: Scope): Weights =>
  scope === ScopeTypes.ORGANIZERS
    ? organizerScoreWeightMapping
    : scoreWeightMapping;

const getMinimumScore = (weights: Weights): number => {
  let minimumScore = 0;

  Object.values(weights).forEach((scoreWeight) => {
    if (scoreWeight.mandatory) minimumScore += scoreWeight.weight;
  });

  return minimumScore;
};

const DynamicBarometerIcon = ({ minimumScore, score, size = 70 }) => (
  <div
    style={{
      width: size,
      height: size,
      position: 'relative',
    }}
  >
    <div
      style={{
        position: 'absolute',
        zIndex: -2,
        left: size * 0.32,
        top: size * 0.4,
        backgroundColor: '#EFEDEE',
        width: size * 0.35,
        height: size * 0.35,
        borderRadius: '100%',
      }}
    />
    <GaugeComponent
      style={{ width: '100%', height: '100%' }}
      marginInPercent={0.032}
      type="radial"
      minValue={minimumScore}
      value={score}
      arc={{
        padding: 0,
        cornerRadius: 0,
        width: 0.4,
        subArcs: [
          { limit: 75, color: '#F19E49' },
          { limit: 90, color: '#F9DE58' },
          { limit: 95, color: '#C2DF6B' },
          { limit: 100, color: '#90CC4F' },
        ],
      }}
      labels={{
        valueLabel: { hide: true },
        tickLabels: { hideMinMax: true },
      }}
      pointer={{
        color: '#B3ADB5',
        width: 40,
        length: 0.8,
      }}
    />
  </div>
);

const FormScore = ({ completedFields, offerId, scope }: Props) => {
  const { t } = useTranslation();

  const router = useRouter();

  const getEntityByIdQuery = useGetEntityByIdAndScope({ id: offerId, scope });
  const weights = getScopeWeights(scope);
  const minimumScore = useMemo(() => getMinimumScore(weights), [weights]);

  // @ts-expect-error
  const entity: EntityWithMedia | undefined = getEntityByIdQuery.data;

  const hasNoPossibleTheme = entity?.terms?.some(
    (term) =>
      term.domain === 'eventtype' && eventTypesWithNoThemes.includes(term.id),
  );

  const hasTheme: boolean =
    entity?.terms?.some((term) => term.domain === 'theme') ||
    hasNoPossibleTheme ||
    scope === OfferTypes.PLACES;

  const hasMediaObject: boolean =
    (entity?.mediaObject ?? entity?.images ?? []).length > 0;

  const hasVideo: boolean = (entity?.videos ?? []).length > 0;

  const fullCompletedFields = useMemo(() => {
    return {
      ...completedFields,
      media: hasMediaObject,
      video: hasVideo,
      theme: hasTheme,
    };
  }, [completedFields, hasMediaObject, hasVideo, hasTheme]);

  const score = useMemo(() => {
    let completeScore = 0;
    Object.keys(fullCompletedFields).forEach((field) => {
      if (fullCompletedFields[field] && weights[field]) {
        completeScore += weights[field].weight;
      }
    });

    return completeScore + minimumScore;
  }, [fullCompletedFields, weights, minimumScore]);

  const scorePercentage = useMemo(() => {
    return (score - minimumScore) / (100 - minimumScore);
  }, [score, minimumScore]);

  const rotationValue = useMemo(() => {
    const maxRotation = 247;
    const minRotation = 15;

    return maxRotation * scorePercentage + minRotation;
  }, [score, scorePercentage, minimumScore]);

  const tipField = useMemo(() => {
    if (score === 100) return;

    // find uncompleted fields with the highest weight to give a tip to the user
    const unCompletedFieldKeys = Object.keys(fullCompletedFields).filter(
      (key) => !fullCompletedFields[key],
    );

    let highestUncompletedValue = {
      weight: 0,
      fieldName: '',
    };

    unCompletedFieldKeys.forEach((fieldKey: string) => {
      if (
        weights[fieldKey] &&
        weights[fieldKey].weight > highestUncompletedValue.weight
      ) {
        highestUncompletedValue = {
          weight: weights[fieldKey].weight,
          fieldName: fieldKey,
        };
      }
    });

    const { fieldName } = highestUncompletedValue;

    return fieldName;
  }, [fullCompletedFields, score, weights]);

  const TipLink = ({ field }: { field: string }) => {
    const hash = field === 'video' ? 'media' : field;
    return (
      <Link
        color={getValue('link')}
        href={`#${hash}`}
        onClick={(e) => {
          e.preventDefault();
          router.push({ hash }, undefined, {
            shallow: true,
          });
        }}
      >
        {t(`create.additionalInformation.event_score.tip.${field}.link`)}
      </Link>
    );
  };

  return (
    <Notification
      header={
        <Inline id="offer-score" alignItems="center" spacing={2}>
          <Text
            display="inline-flex"
            alignItems="flex-end"
            fontSize="1.5rem"
            lineHeight="initial"
            fontWeight="bold"
          >
            <span id="current-score">{score}</span>
            <Text fontSize="1.2rem" fontWeight="bold">
              /100
            </Text>
          </Text>
        </Inline>
      }
      body={
        <Text>
          {score === 100 &&
            t(
              `create.additionalInformation.event_score.tip.completed.${
                scope === ScopeTypes.ORGANIZERS ? scope : 'offers'
              }`,
            )}
          {score !== 100 && (
            <Trans
              i18nKey={`create.additionalInformation.event_score.tip.${tipField}.text`}
            >
              Tip: <TipLink field={tipField} />
            </Trans>
          )}
        </Text>
      }
      icon={<DynamicBarometerIcon minimumScore={minimumScore} score={score} />}
    />
  );
};

export { FormScore };
