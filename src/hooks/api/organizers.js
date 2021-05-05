import { useAuthenticatedQuery } from '@/hooks/api/authenticated-query';
import { fetchFromApi } from '@/utils/fetchFromApi';

const getOrganizerById = async ({ headers, id }) => {
  const res = await fetchFromApi({
    path: `/organizers/${id.toString()}`,
    options: {
      headers,
    },
  });
  return await res.json();
};

const useGetOrganizerById = ({ req, queryClient, id }, configuration = {}) =>
  useAuthenticatedQuery({
    req,
    queryClient,
    queryKey: ['organizers'],
    queryFn: getOrganizerById,
    queryArguments: { id },
    enabled: !!id,
    ...configuration,
  });

const getOrganizersByCreatorId = async ({ headers, ...queryData }) => {
  const res = await fetchFromApi({
    path: '/organizers/',
    searchParams: {
      ...queryData,
    },
    options: {
      headers,
    },
  });
  return await res.json();
};

const useGetOrganizersByCreatorId = (
  {
    creatorId,
    limit = 50,
    start = 0,
    sort = { field: 'modified', order: 'desc' },
  },
  configuration = {},
) =>
  useAuthenticatedQuery({
    queryKey: ['organizers'],
    queryFn: getOrganizersByCreatorId,
    queryArguments: {
      creator: creatorId,
      limit,
      start,
      embed: true,
      [`sort[${sort.field}}]`]: `${sort.order}`,
    },
    ...configuration,
  });

export { useGetOrganizerById, useGetOrganizersByCreatorId };
