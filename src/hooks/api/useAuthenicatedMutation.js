import { useRouter } from 'next/router';
import { useMutation as useReactMutation } from 'react-query';
import { Errors } from '../../utils/fetchWithRedirect';
import { useHeaders } from './useHeaders';

const useAuthenticatedMutation = (mutationFunction, configuration = {}) => {
  const router = useRouter();
  const headers = useHeaders();
  const alteredMutationFunction = async (variables) => {
    const result = await mutationFunction({ ...variables, headers });

    if (
      result.status === 'error' &&
      result.error.message === Errors.UNAUTHORIZED
    ) {
      router.push('/login');
    } else if (result.status) {
      throw new Error(result.title);
    }

    return result;
  };
  return useReactMutation(alteredMutationFunction, configuration);
};

export { useAuthenticatedMutation };
