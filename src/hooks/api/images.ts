import { fetchFromApi, isErrorObject } from '@/utils/fetchFromApi';

import {
  useAuthenticatedMutation,
  useAuthenticatedQuery,
} from './authenticated-query';

const getImageById = async ({ headers, id }) => {
  const res = await fetchFromApi({
    path: `/images/${id}`,
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

const useGetImageByIdQuery = ({ id }, configuration = {}) =>
  useAuthenticatedQuery({
    queryKey: ['images'],
    queryFn: getImageById,
    queryArguments: {
      id,
    },
    enabled: !!id,
    ...configuration,
  });

const addImage = async ({
  headers,
  language,
  copyrightHolder,
  description,
  file,
}) => {
  const formData = new FormData();

  Object.entries({
    description,
    copyrightHolder,
    language,
    file,
  }).forEach(([key, value]) => formData.append(key, value));

  return fetchFromApi({
    path: `/images/`,
    options: {
      method: 'POST',
      headers: {
        ...headers,
      },
      body: formData,
    },
  });
};

const useAddImageMutation = (configuration = {}) =>
  useAuthenticatedMutation({ mutationFn: addImage, ...configuration });

export { useAddImageMutation, useGetImageByIdQuery };
