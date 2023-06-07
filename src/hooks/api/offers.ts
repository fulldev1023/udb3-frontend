import type { UseQueryOptions } from 'react-query';

import { OfferTypes } from '@/constants/OfferType';
import { useGetEventByIdQuery } from '@/hooks/api/events';
import { useGetPlaceByIdQuery } from '@/hooks/api/places';
import { Offer } from '@/types/Offer';
import { createEmbededCalendarSummaries } from '@/utils/createEmbededCalendarSummaries';
import { createSortingArgument } from '@/utils/createSortingArgument';
import { fetchFromApi, isErrorObject } from '@/utils/fetchFromApi';

import {
  AuthenticatedQueryOptions,
  CalendarSummaryFormats,
  PaginationOptions,
  SortOptions,
  useAuthenticatedMutation,
  useAuthenticatedQuery,
} from './authenticated-query';
import type { User } from './user';

const getOffersByCreator = async ({ headers, ...queryData }) => {
  const res = await fetchFromApi({
    path: '/offers/',
    searchParams: {
      ...queryData,
    },
    options: {
      headers,
    },
  });
  if (isErrorObject(res)) {
    // eslint-disable-next-line no-console
    return console.error(res);
  }
  return await res.json();
};

const useGetOffersByCreatorQuery = (
  {
    req,
    queryClient,
    advancedQuery,
    creator,
    paginationOptions = { start: 0, limit: 50 },
    sortOptions = { field: 'modified', order: 'desc' },
    calendarSummaryFormats = ['lg-text', 'sm-text'],
  }: AuthenticatedQueryOptions<
    PaginationOptions &
      SortOptions &
      CalendarSummaryFormats & {
        creator: User;
        advancedQuery?: string;
      }
  >,
  {
    queryArguments,
    ...configuration
  }: UseQueryOptions & { queryArguments?: any } = {},
) => {
  const defaultQuery = `creator:(${creator?.sub} OR ${
    creator['https://publiq.be/uitidv1id']
      ? `${creator['https://publiq.be/uitidv1id']} OR`
      : ''
  } ${creator?.email})`;

  const query = advancedQuery
    ? defaultQuery.concat(' AND ', advancedQuery)
    : defaultQuery;
  return useAuthenticatedQuery<Offer[]>({
    req,
    queryClient,
    queryKey: ['events'],
    queryFn: getOffersByCreator,
    queryArguments: {
      q: query,
      disableDefaultFilters: true,
      embed: true,
      limit: paginationOptions.limit,
      start: paginationOptions.start,
      workflowStatus: 'DRAFT,READY_FOR_VALIDATION,APPROVED,REJECTED',
      ...createSortingArgument(sortOptions),
      ...(calendarSummaryFormats &&
        createEmbededCalendarSummaries(calendarSummaryFormats)),
      ...(queryArguments ?? {}),
    },
    enabled: !!(creator?.sub && creator?.email),
    ...configuration,
  });
};

const useGetOfferByIdQuery = ({ scope, id }, configuration = {}) => {
  const query =
    scope === OfferTypes.EVENTS ? useGetEventByIdQuery : useGetPlaceByIdQuery;

  return query({ id, scope }, configuration);
};

const changeOfferName = async ({ headers, id, lang, name, scope }) => {
  return fetchFromApi({
    path: `/${scope}/${id.toString()}/name/${lang}`,
    options: {
      method: 'PUT',
      body: JSON.stringify({ name }),
      headers,
    },
  });
};

const useChangeOfferNameMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeOfferName,
    mutationKey: 'offers-change-name',
    ...configuration,
  });

const changeOfferTypicalAgeRange = async ({
  headers,
  eventId,
  typicalAgeRange,
  scope,
}) =>
  fetchFromApi({
    path: `/${scope}/${eventId}/typicalAgeRange`,
    options: {
      method: 'PUT',
      headers,
      body: JSON.stringify({ typicalAgeRange }),
    },
  });

const useChangeOfferTypicalAgeRangeMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeOfferTypicalAgeRange,
    mutationKey: 'offers-change-typical-age-range',
    ...configuration,
  });

const changeOfferCalendar = async ({
  headers,
  id,
  calendarType,
  timeSpans,
  subEvent,
  start,
  end,
  startDate,
  endDate,
  openingHours,
  dayOfWeek,
  opens,
  closes,
  scope,
}) => {
  return fetchFromApi({
    path: `/${scope}/${id.toString()}/calendar`,
    options: {
      method: 'PUT',
      body: JSON.stringify({
        calendarType,
        timeSpans,
        subEvent,
        start,
        end,
        startDate,
        endDate,
        openingHours,
        dayOfWeek,
        opens,
        closes,
      }),
      headers,
    },
  });
};

const useChangeOfferCalendarMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeOfferCalendar,
    mutationKey: 'offers-change-calendar',
    ...configuration,
  });

const addOfferLabel = async ({ headers, id, label, scope }) =>
  fetchFromApi({
    path: `/${scope}/${id}/labels/${label}`,
    options: {
      method: 'PUT',
      headers,
    },
  });

const removeOfferLabel = async ({ headers, id, label, scope }) =>
  fetchFromApi({
    path: `/${scope}/${id}/labels/${label}`,
    options: {
      method: 'DELETE',
      headers,
    },
  });

const useAddOfferLabelMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: addOfferLabel,
    mutationKey: 'offers-add-label',
    ...configuration,
  });

const useRemoveOfferLabelMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: removeOfferLabel,
    mutationKey: 'offers-remove-label',
    ...configuration,
  });

const changeOfferTheme = async ({ headers, id, themeId, scope }) => {
  if (!themeId) {
    return fetchFromApi({
      path: `/${scope}/${id.toString()}/theme`,
      options: {
        method: 'DELETE',
        headers,
      },
    });
  }

  return fetchFromApi({
    path: `/${scope}/${id.toString()}/theme/${themeId}`,
    options: {
      method: 'PUT',
      headers,
    },
  });
};

const useChangeOfferThemeMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeOfferTheme,
    mutationKey: 'offers-change-theme',
    ...configuration,
  });

const changeOfferType = async ({ headers, id, typeId, scope }) =>
  fetchFromApi({
    path: `/${scope}/${id.toString()}/type/${typeId}`,
    options: {
      method: 'PUT',
      headers,
    },
  });

const useChangeOfferTypeMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeOfferType,
    mutationKey: 'offers-change-type',
    ...configuration,
  });

const addOfferPriceInfo = async ({ headers, id, priceInfo, scope }) =>
  fetchFromApi({
    path: `/${scope}/${id}/priceInfo`,
    options: {
      method: 'PUT',
      headers,
      body: JSON.stringify(priceInfo),
    },
  });

const useAddOfferPriceInfoMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: addOfferPriceInfo,
    mutationKey: 'offers-add-price-info',
    ...configuration,
  });

const changeOfferDescription = async ({
  headers,
  eventId,
  language,
  description,
  scope,
}) =>
  fetchFromApi({
    path: `/${scope}/${eventId}/description/${language}`,
    options: {
      method: 'PUT',
      headers,
      body: JSON.stringify({ description }),
    },
  });

const useChangeOfferDescriptionMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: changeOfferDescription,
    mutationKey: 'offers-change-description',
    ...configuration,
  });

const addOfferImage = async ({ headers, eventId, imageId, scope }) =>
  fetchFromApi({
    path: `/${scope}/${eventId.toString()}/images`,
    options: {
      method: 'POST',
      headers,
      body: JSON.stringify({ mediaObjectId: imageId }),
    },
  });

const useAddOfferImageMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: addOfferImage,
    mutationKey: 'offers-add-image',
    ...configuration,
  });

const addOfferMainImage = async ({ headers, eventId, imageId, scope }) =>
  fetchFromApi({
    path: `/${scope}/${eventId.toString()}/images/main`,
    options: {
      method: 'POST',
      headers,
      body: JSON.stringify({ mediaObjectId: imageId }),
    },
  });

const useAddOfferMainImageMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: addOfferMainImage,
    mutationKey: 'offers-add-main-image',
    ...configuration,
  });

const addOfferVideo = async ({ headers, eventId, url, language, scope }) =>
  fetchFromApi({
    path: `/${scope}/${eventId}/videos`,
    options: {
      method: 'POST',
      headers,
      body: JSON.stringify({
        url,
        language,
      }),
    },
  });

const useAddOfferVideoMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: addOfferVideo,
    mutationKey: 'offers-add-video',
    ...configuration,
  });

const deleteOfferVideo = async ({ headers, eventId, videoId, scope }) =>
  fetchFromApi({
    path: `/${scope}/${eventId}/videos/${videoId}`,
    options: {
      method: 'DELETE',
      headers,
    },
  });

const useDeleteOfferVideoMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: deleteOfferVideo,
    mutationKey: 'offers-delete-video',
    ...configuration,
  });

const updateOfferImage = async ({
  headers,
  eventId,
  imageId,
  description,
  copyrightHolder,
  scope,
}) =>
  fetchFromApi({
    path: `/${scope}/${eventId.toString()}/images/${imageId.toString()}`,
    options: {
      method: 'PUT',
      headers,
      body: JSON.stringify({ description, copyrightHolder }),
    },
  });

const useUpdateOfferImageMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: updateOfferImage,
    mutationKey: 'offers-update-image',
    ...configuration,
  });

const deleteOfferImage = async ({ headers, eventId, imageId, scope }) =>
  fetchFromApi({
    path: `/${scope}/${eventId.toString()}/images/${imageId.toString()}`,
    options: {
      method: 'DELETE',
      headers,
    },
  });

const useDeleteOfferImageMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: deleteOfferImage,
    mutationKey: 'offers-delete-image',
    ...configuration,
  });

const addOfferContactPoint = async ({
  headers,
  eventId,
  contactPoint,
  scope,
}) =>
  fetchFromApi({
    path: `/${scope}/${eventId}/contactPoint`,
    options: {
      method: 'PUT',
      headers,
      body: JSON.stringify({ contactPoint }),
    },
  });

const useAddOfferContactPointMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: addOfferContactPoint,
    mutationKey: 'offers-add-contact-point',
    ...configuration,
  });

const addOfferBookingInfo = async ({
  headers,
  eventId,
  bookingInfo,
  scope,
}) => {
  fetchFromApi({
    path: `/${scope}/${eventId}/bookingInfo`,
    options: {
      method: 'PUT',
      headers,
      body: JSON.stringify({ bookingInfo }),
    },
  });
};

const useAddOfferBookingInfoMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: addOfferBookingInfo,
    mutationKey: 'offers-add-booking-info',
    ...configuration,
  });

const addOfferOrganizer = async ({ headers, id, organizerId, scope }) =>
  fetchFromApi({
    path: `/${scope}/${id}/organizer/${organizerId}`,
    options: {
      method: 'PUT',
      headers,
    },
  });

const useAddOfferOrganizerMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: addOfferOrganizer,
    mutationKey: 'offers-add-organizer',
    ...configuration,
  });

const deleteOfferOrganizer = async ({ headers, id, organizerId, scope }) =>
  fetchFromApi({
    path: `/${scope}/${id}/organizer/${organizerId}`,
    options: {
      method: 'DELETE',
      headers,
    },
  });

const useDeleteOfferOrganizerMutation = (configuration = {}) =>
  useAuthenticatedMutation({
    mutationFn: deleteOfferOrganizer,
    mutationKey: 'offers-delete-organizer',
    ...configuration,
  });

export {
  useAddOfferBookingInfoMutation,
  useAddOfferContactPointMutation,
  useAddOfferImageMutation,
  useAddOfferLabelMutation,
  useAddOfferMainImageMutation,
  useAddOfferOrganizerMutation,
  useAddOfferPriceInfoMutation,
  useAddOfferVideoMutation,
  useChangeOfferCalendarMutation,
  useChangeOfferDescriptionMutation,
  useChangeOfferNameMutation,
  useChangeOfferThemeMutation,
  useChangeOfferTypeMutation,
  useChangeOfferTypicalAgeRangeMutation,
  useDeleteOfferImageMutation,
  useDeleteOfferOrganizerMutation,
  useDeleteOfferVideoMutation,
  useGetOfferByIdQuery,
  useGetOffersByCreatorQuery,
  useRemoveOfferLabelMutation,
  useUpdateOfferImageMutation,
};
