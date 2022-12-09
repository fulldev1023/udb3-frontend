import { ChangeEvent, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

import {
  useAddOrganizerToEventMutation,
  useDeleteOrganizerFromEventMutation,
  useGetEventByIdQuery,
} from '@/hooks/api/events';
import { useCreateOrganizerMutation } from '@/hooks/api/organizers';
import {
  CardSystem,
  useAddCardSystemToEventMutation,
  useChangeDistributionKeyMutation,
  useDeleteCardSystemFromEventMutation,
  useGetCardSystemForEventQuery,
  useGetCardSystemsForOrganizerQuery,
} from '@/hooks/api/uitpas';
import { Event } from '@/types/Event';
import { Alert, AlertVariants } from '@/ui/Alert';
import { CheckboxWithLabel } from '@/ui/CheckboxWithLabel';
import { Inline } from '@/ui/Inline';
import { Link } from '@/ui/Link';
import { Select } from '@/ui/Select';
import { getStackProps, Stack, StackProps } from '@/ui/Stack';
import { Text } from '@/ui/Text';
import { parseOfferId } from '@/utils/parseOfferId';

import { OrganizerAddModal, OrganizerData } from '../../OrganizerAddModal';
import { TabContentProps } from './AdditionalInformationStep';
import { OrganizerPicker } from './OrganizerPicker';

type Props = StackProps & TabContentProps;

const OrganizerStep = ({
  offerId,
  onChangeCompleted,
  onSuccessfulChange,
  ...props
}: Props) => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const getEventByIdQuery = useGetEventByIdQuery({ id: offerId });

  // @ts-expect-error
  const getCardSystemForEventQuery = useGetCardSystemForEventQuery({
    eventId: offerId,
  });

  // @ts-expect-error
  const event: Event | undefined = getEventByIdQuery.data;

  const organizer = event?.organizer;
  const hasPriceInfo = (event?.priceInfo ?? []).length > 0;

  // @ts-expect-error
  const getCardSystemsForOrganizerQuery = useGetCardSystemsForOrganizerQuery({
    organizerId: organizer?.['@id']
      ? parseOfferId(organizer['@id'])
      : undefined,
  });

  // @ts-expect-error
  const cardSystemForEvent = getCardSystemForEventQuery.data ?? {};

  const selectedCardSystems: CardSystem[] = Object.values(cardSystemForEvent);

  // @ts-expect-error
  const cardSystems = getCardSystemsForOrganizerQuery.data ?? {};

  const [isOrganizerAddModalVisible, setIsOrganizerAddModalVisible] =
    useState(false);
  const [newOrganizerName, setNewOrganizerName] = useState('');

  useEffect(() => {
    if (!organizer) {
      onChangeCompleted(false);
      return;
    }
    onChangeCompleted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizer]);

  const createOrganizerMutation = useCreateOrganizerMutation();

  const addOrganizerToEventMutation = useAddOrganizerToEventMutation({
    onSuccess: onSuccessfulChange,
  });

  const deleteOrganizerFromEventMutation = useDeleteOrganizerFromEventMutation({
    onSuccess: onSuccessfulChange,
  });

  const addCardSystemToEventMutation = useAddCardSystemToEventMutation({
    onSuccess: (data) => {
      onSuccessfulChange(data);
      queryClient.invalidateQueries('uitpas_events');
    },
  });

  const deleteCardSystemFromEventMutation =
    useDeleteCardSystemFromEventMutation({
      onSuccess: (data) => {
        onSuccessfulChange(data);
        queryClient.invalidateQueries('uitpas_events');
      },
    });

  const handleAddCardSystemToEvent = (cardSystemId: number) => {
    addCardSystemToEventMutation.mutate({ cardSystemId, offerId });
  };

  const handleDeleteCardSystemFromEvent = (cardSystemId: number) => {
    deleteCardSystemFromEventMutation.mutate({ cardSystemId, offerId });
  };

  const handleToggleCardSystem = (
    event: ChangeEvent<HTMLInputElement>,
    cardSystemId: number,
  ) => {
    if (event.target.checked) {
      handleAddCardSystemToEvent(cardSystemId);
      return;
    }

    handleDeleteCardSystemFromEvent(cardSystemId);
  };

  const changeDistributionKey = useChangeDistributionKeyMutation({
    onSuccess: (data) => {
      onSuccessfulChange(data);
      queryClient.invalidateQueries('uitpas_events');
    },
  });

  const handleChangeDistributionKey = ({
    distributionKeyId,
    cardSystemId,
  }: {
    distributionKeyId: number;
    cardSystemId: number;
  }) => {
    changeDistributionKey.mutate({
      offerId,
      cardSystemId,
      distributionKeyId,
    });
  };

  const handleChangeOrganizer = (organizerId: string) => {
    addOrganizerToEventMutation.mutate({ offerId, organizerId });
  };

  const handleAddOrganizer = async ({
    url,
    name,
    address,
    contact,
  }: OrganizerData) => {
    const payload = {
      mainLanguage: i18n.language,
      url,
      name: {
        [i18n.language]: name,
      },
      address: {
        [i18n.language]: {
          addressCountry: address.country,
          addressLocality: address.city.name,
          postalCode: address.city.zip,
          streetAddress: address.streetAndNumber,
        },
      },
      contact,
    };

    const { organizerId } = await createOrganizerMutation.mutateAsync(payload);

    await addOrganizerToEventMutation.mutateAsync({ offerId, organizerId });

    setIsOrganizerAddModalVisible(false);
  };

  const isUitpasOrganizer = Object.values(cardSystems).length > 0;

  return (
    <Stack {...getStackProps(props)} spacing={5}>
      <Stack>
        <OrganizerAddModal
          prefillName={newOrganizerName}
          visible={isOrganizerAddModalVisible}
          onConfirm={handleAddOrganizer}
          onClose={() => setIsOrganizerAddModalVisible(false)}
        />
        <OrganizerPicker
          marginBottom={4}
          onChange={handleChangeOrganizer}
          onAddNewOrganizer={(newOrganizer) => {
            setNewOrganizerName(newOrganizer.label);
            setIsOrganizerAddModalVisible(true);
          }}
          onDeleteOrganizer={(organizerId) =>
            deleteOrganizerFromEventMutation.mutate({
              offerId,
              organizerId,
            })
          }
          organizer={organizer}
        />
        {isUitpasOrganizer && (
          <Alert variant={AlertVariants.PRIMARY}>
            {hasPriceInfo ? (
              t('create.additionalInformation.organizer.uitpas_info')
            ) : (
              <Trans
                i18nKey="create.additionalInformation.organizer.uitpas_info_no_price_alert"
                components={{
                  link1: (
                    <Link
                      as="a"
                      css={`
                        text-decoration: underline;
                      `}
                      href="#price_info"
                    ></Link>
                  ),
                }}
              />
            )}
          </Alert>
        )}
      </Stack>

      {isUitpasOrganizer && (
        <Stack spacing={3}>
          <Text fontWeight="bold">
            {t('create.additionalInformation.organizer.uitpas_cardsystems')}
          </Text>
          {Object.values(cardSystems).map((cardSystem: CardSystem) => (
            <Inline key={cardSystem.id} spacing={5}>
              <CheckboxWithLabel
                className="cardsystem-checkbox"
                id={cardSystem.id}
                name={cardSystem.name}
                checked={selectedCardSystems.some(
                  ({ id }) => cardSystem.id === id,
                )}
                disabled={false}
                onToggle={(e) => handleToggleCardSystem(e, cardSystem.id)}
              >
                {cardSystem.name}
              </CheckboxWithLabel>
              {Object.values(cardSystem.distributionKeys).length > 0 && (
                <Select
                  maxWidth="20%"
                  onChange={(e) =>
                    handleChangeDistributionKey({
                      distributionKeyId: parseInt(e.target.value),
                      cardSystemId: cardSystem.id,
                    })
                  }
                >
                  {Object.values(cardSystem.distributionKeys).map(
                    (distributionKey) => (
                      <option
                        selected={selectedCardSystems.some(
                          (selectedCardSystem) =>
                            Object.values(
                              selectedCardSystem.distributionKeys,
                            ).some(({ id }) => id === distributionKey.id),
                        )}
                        value={distributionKey.id}
                        key={distributionKey.id}
                      >
                        {distributionKey.name}
                      </option>
                    ),
                  )}
                </Select>
              )}
            </Inline>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export { OrganizerStep };
