import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { CalendarType } from '@/constants/CalendarType';
import { getPlaceById, useAddPlaceMutation } from '@/hooks/api/places';
import { useGetTypesByScopeQuery } from '@/hooks/api/types';
import { useHeaders } from '@/hooks/api/useHeaders';
import { Countries, Country } from '@/types/Country';
import { Place } from '@/types/Place';
import { AlertVariants } from '@/ui/Alert';
import { parseSpacing } from '@/ui/Box';
import { Button, ButtonVariants } from '@/ui/Button';
import { FormElement } from '@/ui/FormElement';
import { Inline } from '@/ui/Inline';
import { Input } from '@/ui/Input';
import { Modal, ModalSizes, ModalVariants } from '@/ui/Modal';
import { Paragraph } from '@/ui/Paragraph';
import { Stack } from '@/ui/Stack';
import { Text, TextVariants } from '@/ui/Text';
import { DuplicatePlaceErrorBody } from '@/utils/fetchFromApi';
import { parseOfferId } from '@/utils/parseOfferId';

import { AlertDuplicatePlace } from './AlertDuplicatePlace';
import { City } from './CityPicker';

const schema = yup
  .object({
    name: yup.string().required(),
    streetAndNumber: yup.string().required(),
    zip: yup.string().required(),
    municipalityName: yup.string().required(),
    term: yup.object({
      label: yup.string().required(),
      domain: yup.string().required(),
      id: yup.string().required(),
    }),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

type Props = {
  visible: boolean;
  municipality: City;
  country: Country;
  prefillPlaceName: string;
  onClose: () => void;
  onConfirmSuccess: (place: any) => void;
};

export const DUPLICATE_STATUS_CODE = 409;

type DuplicatePlaceResponse = {
  query?: string;
  id?: string;
};

const PlaceAddModal = ({
  visible,
  onClose,
  municipality,
  country,
  prefillPlaceName,
  onConfirmSuccess,
}: Props) => {
  const { t, i18n } = useTranslation();
  const [duplicatePlaceInfo, setDuplicatePlaceInfo] =
    useState<DuplicatePlaceResponse>();

  const getTypesByScopeQuery = useGetTypesByScopeQuery({
    scope: 'places',
  });

  const headers = useHeaders();

  const terms = getTypesByScopeQuery.data ?? [];

  const addPlaceMutation = useAddPlaceMutation();

  const handleUseOriginalPlace = (duplicatePlace: Place) => {
    onConfirmSuccess(duplicatePlace);
  };

  const handleConfirm = async () => {
    await handleSubmit(async (data) => {
      const formData = {
        address: {
          addressCountry: country,
          addressLocality: data.municipalityName,
          postalCode: data.zip,
          streetAddress: data.streetAndNumber,
        },
        calendar: {
          calendarType: CalendarType.PERMANENT,
        },
        mainLanguage: i18n.language,
        name: data.name,
        terms: [data.term],
      };

      try {
        setDuplicatePlaceInfo(undefined);

        const resp = await addPlaceMutation.mutateAsync(formData);

        if (!resp?.placeId) return;
        const newPlace = await getPlaceById({ headers, id: resp.placeId });
        onConfirmSuccess(newPlace);
      } catch (error) {
        if (error?.status === DUPLICATE_STATUS_CODE) {
          const body = error?.body as DuplicatePlaceErrorBody;
          const query = body?.query;
          const placeId = body.duplicatePlaceUri
            ? parseOfferId(body.duplicatePlaceUri)
            : undefined;
          setDuplicatePlaceInfo({ query, id: placeId });
        }
      }
    })();
  };

  const handleClose = () => {
    onClose();
    clearErrors();
    setDuplicatePlaceInfo(undefined);
  };

  const {
    register,
    handleSubmit,
    formState,
    control,
    setValue,
    watch,
    trigger,
    clearErrors,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (!municipality) return;
    setValue('zip', municipality.zip);
    setValue('municipalityName', municipality.name);
  }, [municipality, setValue]);

  useEffect(() => {
    if (!prefillPlaceName) return;
    setValue('name', prefillPlaceName);
  }, [prefillPlaceName, setValue]);

  const selectedTerm = useWatch({ control, name: 'term' });

  return (
    <Modal
      title={t('location.add_modal.title')}
      confirmTitle={t('location.add_modal.actions.add')}
      cancelTitle={t('location.add_modal.actions.cancel')}
      visible={visible}
      variant={ModalVariants.QUESTION}
      onConfirm={handleConfirm}
      onClose={handleClose}
      size={ModalSizes.LG}
    >
      <Stack padding={4} spacing={4}>
        <AlertDuplicatePlace
          variant={AlertVariants.WARNING}
          onSelectPlace={handleUseOriginalPlace}
          placeId={duplicatePlaceInfo?.id}
          query={duplicatePlaceInfo?.query}
          labelKey={`location.add_modal.errors.duplicate_place`}
        />
        <FormElement
          Component={<Input {...register('name')} value={watch('name')} />}
          maxLength={90}
          id="location-name"
          label={t('location.add_modal.labels.name')}
          error={formState.errors.name && t('location.add_modal.errors.name')}
          info={
            <Text
              variant={TextVariants.MUTED}
              maxWidth={parseSpacing(9)}
              dangerouslySetInnerHTML={{
                __html: t(`create.name_and_age.name.tip_places`),
              }}
            />
          }
        />
        <FormElement
          Component={<Input {...register('streetAndNumber')} />}
          id="location-street"
          label={t('location.add_modal.labels.streetAndNumber')}
          error={
            formState.errors.streetAndNumber &&
            t('location.add_modal.errors.streetAndNumber')
          }
        />
        <Inline spacing={5}>
          <FormElement
            Component={
              <Input {...register('zip')} disabled={country === Countries.BE} />
            }
            id="location-zip"
            label={t('location.add_modal.labels.zip')}
            error={formState.errors.zip && t('location.add_modal.errors.zip')}
          />
          <FormElement
            Component={<Input {...register('municipalityName')} disabled />}
            id="location-municipality-name"
            label={t('location.add_modal.labels.municipality')}
          />
        </Inline>
        <Stack>
          <Text fontWeight="bold">{t('location.add_modal.labels.type')}</Text>
          <Paragraph marginBottom={3} variant={TextVariants.MUTED}>
            {t('location.add_modal.labels.typeInfo')}
          </Paragraph>
          {formState.errors.term?.id && (
            <Text color="red">{t('location.add_modal.errors.type')}</Text>
          )}
          <Inline spacing={3} flexWrap="wrap" maxWidth="70rem">
            {terms.map(({ id, name, domain }) => (
              <Button
                width="auto"
                marginBottom={3}
                display="inline-flex"
                key={id}
                active={id === selectedTerm?.id}
                variant={ButtonVariants.SECONDARY_TOGGLE}
                onClick={() => {
                  setValue('term', {
                    id,
                    label: name[i18n.language],
                    domain,
                  });
                  trigger('term');
                }}
                css={`
                  &.btn {
                    padding: 0.3rem 0.7rem;
                  }
                `}
              >
                {name[i18n.language]}
              </Button>
            ))}
          </Inline>
        </Stack>
      </Stack>
    </Modal>
  );
};

export { PlaceAddModal };
