import { format, isAfter, isFuture } from 'date-fns';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import { css } from 'styled-components';

import { CalendarType } from '@/constants/CalendarType';
import { QueryStatus } from '@/hooks/api/authenticated-query';
import {
  useDeleteEventByIdMutation,
  useGetEventsByCreatorQuery,
} from '@/hooks/api/events';
import {
  useDeleteOrganizerByIdMutation,
  useGetOrganizersByCreatorQuery,
} from '@/hooks/api/organizers';
import {
  useDeletePlaceByIdMutation,
  useGetPlacesByCreatorQuery,
} from '@/hooks/api/places';
import {
  useGetUserQuery,
  useGetUserQueryServerSide,
  User,
} from '@/hooks/api/user';
import { FeatureFlags, useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Footer } from '@/pages/Footer';
import type { Event } from '@/types/Event';
import { Offer } from '@/types/Offer';
import type { Organizer } from '@/types/Organizer';
import type { Place } from '@/types/Place';
import { Values } from '@/types/Values';
import { WorkflowStatus } from '@/types/WorkflowStatus';
import { Alert, AlertVariants } from '@/ui/Alert';
import { Box, parseSpacing } from '@/ui/Box';
import { Dropdown, DropDownVariants } from '@/ui/Dropdown';
import type { InlineProps } from '@/ui/Inline';
import { getInlineProps, Inline } from '@/ui/Inline';
import { LabelPositions } from '@/ui/Label';
import { Link, LinkVariants } from '@/ui/Link';
import { List } from '@/ui/List';
import { Modal, ModalVariants } from '@/ui/Modal';
import { Page } from '@/ui/Page';
import { Pagination } from '@/ui/Pagination';
import { Panel } from '@/ui/Panel';
import { SelectWithLabel } from '@/ui/SelectWithLabel';
import { Spinner } from '@/ui/Spinner';
import { Stack } from '@/ui/Stack';
import { Tabs } from '@/ui/Tabs';
import { Text, TextVariants } from '@/ui/Text';
import { getValueFromTheme } from '@/ui/theme';
import { formatAddressInternal } from '@/utils/formatAddress';
import { getApplicationServerSideProps } from '@/utils/getApplicationServerSideProps';
import { parseOfferId } from '@/utils/parseOfferId';
import { parseOfferType } from '@/utils/parseOfferType';

import { NewsletterSignupForm } from './NewsletterSingupForm';

const { publicRuntimeConfig } = getConfig();

type TabOptions = 'events' | 'places' | 'organizers';

type Item = Event | Place | Organizer;

const globalAlertMessages =
  typeof publicRuntimeConfig.globalAlertMessage === 'string'
    ? JSON.parse(publicRuntimeConfig.globalAlertMessage)
    : undefined;

const globalAlertVariant = Object.values(AlertVariants).some(
  (variant) => variant === publicRuntimeConfig.globalAlertVariant,
)
  ? publicRuntimeConfig.globalAlertVariant
  : AlertVariants.PRIMARY;

const getValue = getValueFromTheme('dashboardPage');

const itemsPerPage = 14;

const UseGetItemsByCreatorMap = {
  events: useGetEventsByCreatorQuery,
  places: useGetPlacesByCreatorQuery,
  organizers: useGetOrganizersByCreatorQuery,
} as const;

const UseDeleteItemByIdMap = {
  events: useDeleteEventByIdMutation,
  places: useDeletePlaceByIdMutation,
  organizers: useDeleteOrganizerByIdMutation,
} as const;

const CreateMap = {
  events: '/create?scope=events',
  places: '/create?scope=places',
  organizers: '/organizer',
};

const CreateMapLegacy = {
  events: '/event',
  places: '/event',
  organizers: '/organizer',
};

const RowStatus = {
  APPROVED: 'APPROVED',
  DRAFT: 'DRAFT',
  REJECTED: 'REJECTED',
  PUBLISHED: 'PUBLISHED',
  PLANNED: 'PLANNED',
} as const;

type RowStatus = Values<typeof RowStatus>;

const RowStatusToColor: Record<RowStatus, string> = {
  DRAFT: 'orange',
  REJECTED: 'red',
  APPROVED: 'green',
  PUBLISHED: 'green',
  PLANNED: 'blue',
};

type Status = {
  color?: string;
  label?: string;
  isExternalCreator?: boolean;
};

type StatusIndicatorProps = InlineProps & Status;

const StatusIndicator = ({
  color,
  label,
  isExternalCreator,
  ...props
}: StatusIndicatorProps) => {
  const { t } = useTranslation();
  return (
    <Stack>
      <Inline
        marginBottom={1}
        spacing={3}
        alignItems="center"
        {...getInlineProps(props)}
      >
        {color &&
          label && [
            <Box
              key="status-indicator-box"
              width="0.60rem"
              height="0.60rem"
              backgroundColor={color}
              borderRadius="50%"
              flexShrink={0}
            />,
            <Text key="status-indicator-label" variant={TextVariants.MUTED}>
              {label}
            </Text>,
          ]}
      </Inline>
      {isExternalCreator && (
        <Text variant={TextVariants.MUTED}>
          {t('dashboard.external_creator')}
        </Text>
      )}
    </Stack>
  );
};

type RowProps = {
  title: string;
  description: string;
  actions: ReactNode[];
  url: string;
  finishedAt?: string;
  status?: Status;
};

const Row = ({
  title,
  description,
  actions,
  url,
  finishedAt,
  status,
  ...props
}: RowProps) => {
  return (
    <Inline
      flex={1}
      css={css`
        display: grid;
        gap: ${parseSpacing(4)};
        grid-template-columns: ${status ? '5fr 3fr 1fr' : '8fr 2fr'};
      `}
      {...getInlineProps(props)}
    >
      <Stack spacing={2}>
        <Inline spacing={3}>
          <Link href={url} color={getValue('listItem.color')} fontWeight="bold">
            {title}
          </Link>
        </Inline>
        <Text>{description}</Text>
      </Stack>
      {status && <StatusIndicator {...status} />}
      <Inline justifyContent="flex-end" minWidth="11rem">
        {finishedAt ? (
          <Text color={getValue('listItem.passedEvent.color')}>
            {finishedAt}
          </Text>
        ) : (
          actions.length > 0 && (
            <Dropdown variant={DropDownVariants.SECONDARY} isSplit>
              {actions}
            </Dropdown>
          )
        )}
      </Inline>
    </Inline>
  );
};

Row.defaultProps = {
  actions: [],
};

type ExistingOffer = Omit<Offer, 'workflowStatus'> & {
  workflowStatus: Exclude<WorkflowStatus, 'DELETED'>;
};

type OfferRowProps = InlineProps & {
  item: ExistingOffer;
  onDelete: (item: ExistingOffer) => void;
};

const OfferRow = ({ item: offer, onDelete, ...props }: OfferRowProps) => {
  const { t, i18n } = useTranslation();

  const getUserQuery = useGetUserQuery();
  // @ts-expect-error
  const userId = getUserQuery.data?.sub;
  // @ts-expect-error
  const userIdv1 = getUserQuery.data?.['https://publiq.be/uitidv1id'];
  const isExternalCreator = ![userId, userIdv1].includes(offer.creator);

  const offerType = parseOfferType(offer['@context']);

  const isFinished = isAfter(new Date(), new Date(offer.availableTo));
  const isPublished = ['APPROVED', 'READY_FOR_VALIDATION'].includes(
    offer.workflowStatus,
  );
  const isPlanned = isPublished && isFuture(new Date(offer.availableFrom));

  const editUrl = `/${offerType}/${parseOfferId(offer['@id'])}/edit`;
  const previewUrl = `/${offerType}/${parseOfferId(offer['@id'])}/preview`;
  const duplicateUrl = `/${offerType}/${parseOfferId(offer['@id'])}/duplicate`;

  const typeId = offer.terms.find((term) => term.domain === 'eventtype')?.id;

  // The custom keySeparator was necessary because the ids contain '.' which i18n uses as default keySeparator
  const eventType = typeId
    ? t(`eventTypes*${typeId}`, { keySeparator: '*' })
    : undefined;

  const period =
    offer.calendarSummary[i18n.language]?.text?.[
      offer.calendarType === CalendarType.SINGLE ? 'lg' : 'sm'
    ];

  const rowDescription = [eventType, period].filter(Boolean).join(' - ');

  const rowStatus = useMemo<RowStatus>(() => {
    if (isPlanned) {
      return 'PLANNED';
    }

    if (isPublished) {
      return 'PUBLISHED';
    }

    if (offer.workflowStatus === WorkflowStatus.READY_FOR_VALIDATION) {
      return WorkflowStatus.DRAFT;
    }

    return offer.workflowStatus;
  }, [offer.workflowStatus, isPlanned, isPublished]);

  const statusColor = useMemo(() => {
    return RowStatusToColor[rowStatus];
  }, [rowStatus]);

  const statusLabel = useMemo(() => {
    if (rowStatus === 'REJECTED') {
      return t('dashboard.row_status.rejected');
    }

    if (rowStatus === 'PUBLISHED') {
      return t('dashboard.row_status.published');
    }

    if (rowStatus === 'PLANNED') {
      return t('dashboard.row_status.published_from', {
        date: format(new Date(offer.availableFrom), 'dd/MM/yyyy'),
      });
    }

    return t('dashboard.row_status.draft');
  }, [offer.availableFrom, rowStatus, t]);

  return (
    <Row
      title={offer.name[i18n.language] ?? offer.name[offer.mainLanguage]}
      description={rowDescription}
      url={previewUrl}
      actions={[
        <Link href={editUrl} variant={LinkVariants.BUTTON_SECONDARY} key="edit">
          {t('dashboard.actions.edit')}
        </Link>,
        <Dropdown.Item href={previewUrl} key="preview">
          {t('dashboard.actions.preview')}
        </Dropdown.Item>,
        offerType === 'event' && <Dropdown.Divider key="divider" />,
        offerType === 'event' && (
          <Dropdown.Item href={duplicateUrl} key="duplicate">
            {t('dashboard.actions.duplicate')}
          </Dropdown.Item>
        ),
        <Dropdown.Divider key="divider" />,
        <Dropdown.Item onClick={() => onDelete(offer)} key="delete">
          {t('dashboard.actions.delete')}
        </Dropdown.Item>,
      ]}
      finishedAt={
        isFinished &&
        t('dashboard.passed', { type: t(`dashboard.${offerType}`) })
      }
      status={{
        color: statusColor,
        label: statusLabel,
        isExternalCreator,
      }}
      {...getInlineProps(props)}
    />
  );
};

type OrganizerRowProps = InlineProps & {
  item: Organizer;
  onDelete: (item: Organizer) => void;
};

const OrganizerRow = ({
  item: organizer,
  onDelete,
  ...props
}: OrganizerRowProps) => {
  const { t, i18n } = useTranslation();

  const getUserQuery = useGetUserQuery();
  // @ts-expect-error
  const userId = getUserQuery.data?.sub;
  // @ts-expect-error
  const userIdv1 = getUserQuery.data?.['https://publiq.be/uitidv1id'];
  const isExternalCreator = ![userId, userIdv1].includes(organizer.creator);

  const address =
    organizer?.address?.[i18n.language] ??
    organizer?.address?.[organizer.mainLanguage];
  const formattedAddress = address ? formatAddressInternal(address) : '';
  const editUrl = `/organizer/${parseOfferId(organizer['@id'])}/edit`;
  const previewUrl = `/organizer/${parseOfferId(organizer['@id'])}/preview`;

  return (
    <Row
      title={
        organizer.name[i18n.language] ?? organizer.name[organizer.mainLanguage]
      }
      url={previewUrl}
      description={formattedAddress}
      actions={[
        <Link href={editUrl} variant={LinkVariants.BUTTON_SECONDARY} key="edit">
          {t('dashboard.actions.edit')}
        </Link>,
      ]}
      status={{
        isExternalCreator,
      }}
      {...getInlineProps(props)}
    />
  );
};

const TabContent = ({
  tab,
  items,
  status,
  Row,
  page,
  totalItems,
  onDelete,
  onChangePage,
}) => {
  const { t } = useTranslation();

  const hasMoreThanOnePage = Math.ceil(totalItems / itemsPerPage) > 1;

  if (status === QueryStatus.LOADING) {
    return (
      <Panel
        backgroundColor="white"
        css={`
          border-top: none !important;
          border-top-left-radius: 0;
          border-top-right-radius: 0;
        `}
      >
        <Spinner marginY={4} />
      </Panel>
    );
  }

  if (items.length === 0) {
    return (
      <Panel
        css={`
          border-top: none !important;
          border-top-left-radius: 0;
          border-top-right-radius: 0;
        `}
        backgroundColor="white"
        minHeight="5rem"
        alignItems="center"
        justifyContent="center"
      >
        <Text margin={3} maxWidth="36rem">
          {t(`dashboard.no_items.${tab}`)}
        </Text>
      </Panel>
    );
  }

  return (
    <Panel
      css={`
        border-top: none !important;
        border-top-left-radius: 0;

        & ul li:first-child {
          border-top-left-radius: 0;
        }

        & ul li:last-child {
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }
      `}
    >
      <List>
        {items.map((item, index) => (
          <List.Item
            key={item['@id']}
            paddingLeft={4}
            paddingRight={4}
            paddingBottom={3}
            paddingTop={3}
            backgroundColor={getValue('listItem.backgroundColor')}
            css={
              index !== items.length - 1
                ? css`
                    border-bottom: 1px solid ${getValue('listItem.borderColor')};
                  `
                : css``
            }
          >
            <Row item={item} onDelete={onDelete} />
          </List.Item>
        ))}
      </List>
      {hasMoreThanOnePage && (
        <Panel.Footer>
          <Pagination
            currentPage={page}
            totalItems={totalItems}
            perPage={itemsPerPage}
            prevText={t('pagination.previous')}
            nextText={t('pagination.next')}
            onChangePage={onChangePage}
          />
        </Panel.Footer>
      )}
    </Panel>
  );
};

const SortingField = {
  AVAILABLETO: 'availableTo',
  CREATED: 'created',
} as const;

const SortingOrder = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

const Dashboard = (): any => {
  const { t, i18n } = useTranslation();
  const { pathname, query, asPath, ...router } = useRouter();

  const [isNewCreateEnabled] = useFeatureFlag(FeatureFlags.REACT_CREATE);

  const queryClient = useQueryClient();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [toBeDeletedItem, setToBeDeletedItem] = useState<Item>();

  const tab = (query?.tab as TabOptions) ?? 'events';
  const page = parseInt((query?.page as string) ?? '1');
  const sort = (query?.sort as string) ?? 'created_desc';

  const useGetItemsByCreator = useMemo(
    () => UseGetItemsByCreatorMap[tab ?? 'events'],
    [tab],
  );

  const sortingField = useMemo(() => {
    return sort?.split('_')?.[0] ?? SortingField.CREATED;
  }, [sort]);

  const sortingOrder = useMemo(() => {
    return sort?.split('_')?.[1] ?? SortingOrder.DESC;
  }, [sort]);

  const useDeleteItemById = useMemo(
    () => UseDeleteItemByIdMap[tab ?? 'events'],
    [tab],
  );

  const handleSelectTab = async (tabKey: TabOptions) =>
    router.push(
      {
        pathname: `/dashboard`,
        query: { tab: tabKey, page: 1, ...(tabKey === 'events' && { sort }) },
      },
      undefined,
      { shallow: true },
    );

  const getUserQuery = useGetUserQuery();
  // @ts-expect-error
  const user = getUserQuery.data as User;

  const handleSelectSorting = (event) => {
    const sortValue = event.target.value;
    router.push(
      { pathname: `/dashboard`, query: { tab, page: 1, sort: sortValue } },
      undefined,
      { shallow: true },
    );
  };

  const UseGetItemsByCreatorQuery = useGetItemsByCreator({
    creator: user,
    ...(tab === 'events' && {
      sortOptions: { field: sortingField, order: sortingOrder },
    }),
    paginationOptions: {
      start: (page - 1) * itemsPerPage,
      limit: itemsPerPage,
    },
  });

  const UseDeleteItemByIdMutation = useDeleteItemById({
    onSuccess: async () => {
      await queryClient.invalidateQueries(tab);
    },
  });

  // @ts-expect-error
  const items = UseGetItemsByCreatorQuery.data?.member ?? [];

  const sharedTableContentProps = {
    tab,
    // @ts-expect-error
    status: UseGetItemsByCreatorQuery.status,
    items,
    // @ts-expect-error
    totalItems: UseGetItemsByCreatorQuery.data?.totalItems ?? 0,
    page,
    onChangePage: async (page: number) => {
      await router.push({ pathname, query: { ...query, page } }, undefined, {
        shallow: true,
      });
    },
    onDelete: (item: Item) => {
      setToBeDeletedItem(item);
      setIsModalVisible(true);
    },
  };

  const SORTING_OPTIONS = [
    'created_desc',
    'created_asc',
    'availableTo_desc',
    'availableTo_asc',
  ];

  const createOfferUrl = isNewCreateEnabled
    ? CreateMap[tab]
    : CreateMapLegacy[tab];

  return [
    <Page key="page">
      <Page.Title>
        {user?.['https://publiq.be/first_name']
          ? `${t('dashboard.welcome')}, ${user['https://publiq.be/first_name']}`
          : `${t('dashboard.welcome')},`}
      </Page.Title>
      <Page.Content spacing={5}>
        {globalAlertMessages && (
          <Inline>
            <Alert variant={globalAlertVariant}>
              {globalAlertMessages[i18n.language ?? 'nl']}
            </Alert>
          </Inline>
        )}

        <Inline>
          <Link href={createOfferUrl} variant={LinkVariants.BUTTON_PRIMARY}>
            {t(`dashboard.create.${tab}`)}
          </Link>
        </Inline>

        <Stack position="relative">
          <Inline
            position="absolute"
            height="2.8rem"
            top={0}
            right={0}
            alignItems="center"
            spacing={4}
          >
            <Text as="div" display={{ default: 'block', l: 'none' }}>
              <Trans
                i18nKey={`dashboard.sorting.results.${tab}`}
                count={sharedTableContentProps.totalItems}
              >
                <Text fontWeight="bold" />
              </Trans>
            </Text>
            {tab === 'events' && (
              <SelectWithLabel
                key="select"
                id="sorting"
                label={`${t('dashboard.sorting.label')}:`}
                value={sort}
                onChange={handleSelectSorting}
                width="auto"
                labelPosition={LabelPositions.LEFT}
              >
                {SORTING_OPTIONS.map((sortOption) => (
                  <option key={sortOption} value={sortOption}>
                    {t(`dashboard.sorting.${sortOption}`)}
                  </option>
                ))}
              </SelectWithLabel>
            )}
          </Inline>
          <Tabs<TabOptions>
            activeKey={tab}
            onSelect={handleSelectTab}
            activeBackgroundColor="white"
          >
            <Tabs.Tab eventKey="events" title={t('dashboard.tabs.events')}>
              {tab === 'events' && (
                <TabContent {...sharedTableContentProps} Row={OfferRow} />
              )}
            </Tabs.Tab>
            <Tabs.Tab eventKey="places" title={t('dashboard.tabs.places')}>
              {tab === 'places' && (
                <TabContent {...sharedTableContentProps} Row={OfferRow} />
              )}
            </Tabs.Tab>
            <Tabs.Tab
              eventKey="organizers"
              title={t('dashboard.tabs.organizers')}
            >
              {tab === 'organizers' && (
                <TabContent {...sharedTableContentProps} Row={OrganizerRow} />
              )}
            </Tabs.Tab>
          </Tabs>
        </Stack>
        {i18n.language === 'nl' && <NewsletterSignupForm />}
        <Footer />
      </Page.Content>
    </Page>,
    <Modal
      key="modal"
      variant={ModalVariants.QUESTION}
      visible={isModalVisible}
      onConfirm={async () => {
        UseDeleteItemByIdMutation.mutate({
          id: parseOfferId(toBeDeletedItem['@id']),
        });
        setIsModalVisible(false);
      }}
      onClose={() => setIsModalVisible(false)}
      title={t('dashboard.modal.title', {
        type: t(`dashboard.modal.types.${tab}`),
      })}
      confirmTitle={t('dashboard.actions.delete')}
      cancelTitle={t('dashboard.actions.cancel')}
    >
      {toBeDeletedItem && (
        <Box padding={4}>
          {t('dashboard.modal.question', {
            name:
              toBeDeletedItem.name[i18n.language] ??
              toBeDeletedItem.name[toBeDeletedItem.mainLanguage],
          })}
        </Box>
      )}
    </Modal>,
  ];
};

const getServerSideProps = getApplicationServerSideProps(
  async ({ req, query, cookies: rawCookies, queryClient }) => {
    const user = (await useGetUserQueryServerSide({
      req,
      queryClient,
    })) as User;

    await Promise.all(
      Object.entries(UseGetItemsByCreatorMap).map(([key, hook]) => {
        const page =
          query.tab === key ? (query.page ? parseInt(query.page) : 1) : 1;

        const sortingField = query?.sort?.split('_')[0] ?? SortingField.CREATED;
        const sortingOrder = query?.sort?.split('_')[1] ?? SortingOrder.DESC;

        return hook({
          req,
          queryClient,
          creator: user,
          ...(key === 'events' && {
            sortOptions: {
              field: sortingField,
              order: sortingOrder,
            },
          }),
          paginationOptions: {
            start: (page - 1) * itemsPerPage,
            limit: itemsPerPage,
          },
        });
      }),
    );

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        cookies: rawCookies,
      },
    };
  },
);

const DashboardWrapper = (props) => {
  return <Dashboard {...props} />;
};

export default DashboardWrapper;
export { getServerSideProps };
