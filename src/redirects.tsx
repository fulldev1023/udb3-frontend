import { FeatureFlags } from './hooks/useFeatureFlag';
import type { SupportedLanguages } from './i18n';
import type { Values } from './types/Values';

const tabOptions = ['events', 'organizers', 'places'];

type Environment = 'development' | 'acceptance' | 'testing' | 'production';

const createDashboardRedirects = (environment: Environment) => {
  return [
    {
      source: '/dashboard',
      destination: '/dashboard?tab=events&page=1&sort=created_desc',
      permanent: environment !== 'development',
    },
    {
      source: '/events',
      destination: '/dashboard?tab=events&page=1&sort=created_desc',
      permanent: environment !== 'development',
    },
    {
      source: '/organizers',
      destination: '/dashboard?tab=organizers&page=1&sort=created_desc',
      permanent: environment !== 'development',
    },
    {
      source: '/places',
      destination: '/dashboard?tab=places&page=1&sort=created_desc',
      permanent: environment !== 'development',
    },
    ...tabOptions.map((tabName) => {
      const source = `/dashboard?tab=${tabName}`;
      return {
        source,
        destination: `${source}&page=1`,
        permanent: environment !== 'development',
      };
    }),
  ];
};

const getRedirects = (
  environment: Environment,
  language: Values<typeof SupportedLanguages> = 'nl',
) => [
  // Only make the permanent redirects really permanent in environments other
  // than development, so we don't get permanent redirects on localhost which
  // may conflict with other projects.
  {
    source: '/event',
    destination: '/create',
    permanent: false,
    featureFlag: FeatureFlags.REACT_CREATE,
  },
  {
    source: '/event/:eventId/status',
    destination: '/events/:eventId/availability',
    permanent: environment !== 'development',
  },
  {
    source: '/place/:placeId/status',
    destination: '/places/:placeId/availability',
    permanent: environment !== 'development',
  },
  {
    source: '/events/:eventId/status',
    destination: '/events/:eventId/availability',
    permanent: environment !== 'development',
  },
  {
    source: '/places/:placeId/status',
    destination: '/places/:placeId/availability',
    permanent: environment !== 'development',
  },
  {
    source: '/event/:eventId/edit',
    destination: '/events/:eventId/edit',
    permanent: false,
    featureFlag: FeatureFlags.REACT_CREATE,
  },
  {
    source: '/event/:eventId/duplicate',
    destination: '/events/:eventId/duplicate',
    permanent: false,
    featureFlag: FeatureFlags.REACT_CREATE,
  },
  {
    source: '/place/:placeId/edit',
    destination: '/places/:placeId/edit',
    permanent: false,
    featureFlag: FeatureFlags.REACT_CREATE,
  },
  {
    source: '/organizer',
    destination: '/organizers/create',
    permanent: false,
    featureFlag: FeatureFlags.REACT_CREATE,
  },
  {
    source: '/organizer/:organizerId/edit',
    destination: '/organizers/:organizerId/edit',
    permanent: false,
    featureFlag: FeatureFlags.REACT_CREATE,
  },
  {
    source: '/:language/copyright',
    destination: '/copyright',
    permanent: environment !== 'development',
  },
  ...(language !== 'nl'
    ? [
        {
          source: '/manage/movies/create',
          destination: '/dashboard',
          permanent: false,
        },
      ]
    : []),
  ...createDashboardRedirects(environment),
];

export { getRedirects };
