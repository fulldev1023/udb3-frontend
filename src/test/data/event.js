const event = {
  '@id':
    'https://io.uitdatabank.dev/event/82e6367d-e8f4-4684-9f13-7bddd33d8c98',
  '@context': '/contexts/event',
  mainLanguage: 'nl',
  name: { nl: 'eeeee' },
  location: {
    '@id':
      'https://io.uitdatabank.dev/place/bff97b2d-b4eb-4e2b-b1d4-87ada7f0e463',
    '@context': '/contexts/place',
    mainLanguage: 'nl',
    name: { nl: 'ee' },
    address: {
      nl: {
        addressCountry: 'BE',
        addressLocality: 'Gent',
        postalCode: '9000',
        streetAddress: 'eee',
      },
    },
    calendarType: 'permanent',
    availableTo: '2100-01-01T00:00:00+00:00',
    terms: [
      {
        id: '3CuHvenJ+EGkcvhXLg9Ykg',
        label: 'Archeologische Site',
        domain: 'eventtype',
      },
    ],
    created: '2020-06-23T11:43:07+00:00',
    modified: '2020-06-23T11:43:08+00:00',
    creator: 'google-oauth2|104823890460871396997',
    workflowStatus: 'DRAFT',
    languages: ['nl'],
    completedLanguages: ['nl'],
    geo: { latitude: 51.06783069999999, longitude: 3.7290914 },
    status: { type: 'Available' },
  },
  calendarType: 'single',
  startDate: '2020-07-14T22:00:00+00:00',
  endDate: '2020-07-15T21:59:59+00:00',
  subEvent: [
    {
      status: { type: 'Available' },
      '@type': 'Event',
      startDate: '2020-07-14T22:00:00+00:00',
      endDate: '2020-07-15T21:59:59+00:00',
    },
  ],
  availableTo: '2020-07-15T21:59:59+00:00',
  sameAs: [
    'http://www.uitinvlaanderen.be/agenda/e/eeeee/82e6367d-e8f4-4684-9f13-7bddd33d8c98',
  ],
  terms: [{ id: '0.50.4.0.0', label: 'Concert', domain: 'eventtype' }],
  created: '2020-07-15T13:53:05+00:00',
  modified: '2020-07-15T13:53:08+00:00',
  creator: 'google-oauth2|104823890460871396997',
  workflowStatus: 'READY_FOR_VALIDATION',
  audience: { audienceType: 'everyone' },
  languages: ['nl'],
  completedLanguages: ['nl'],
  availableFrom: '2020-07-15T15:53:08+02:00',
  production: null,
  status: { type: 'Available' },
};

const eventWithSubEvents = {
  '@id':
    'https://io.uitdatabank.dev/event/b678d697-3634-4489-9fcd-c5c29b1f9ca6',
  '@context': '/contexts/event',
  mainLanguage: 'nl',
  name: { nl: 'Multiple calendar typee' },
  location: {
    '@type': 'Place',
    '@id':
      'https://io.uitdatabank.dev/place/3d1f205a-b081-4a40-8f64-a884b8a42a56',
    '@context': '/contexts/place',
    mainLanguage: 'nl',
    name: {
      nl: 'UGC de Brouck\u00e8re',
      fr: 'UGC de Brouck\u00e8re',
      en: 'UGC de Brouck\u00e8re',
    },
    address: {
      nl: {
        addressCountry: 'BE',
        addressLocality: 'Brussel',
        postalCode: '1000',
        streetAddress: 'de Brouck\u00e8replein, 30 - 1000 Brussel',
      },
      fr: {
        addressCountry: 'BE',
        addressLocality: 'Bruxelles',
        postalCode: '1000',
        streetAddress: 'Place de Brouck\u00e8re, 30 - 1000 Bruxelles',
      },
    },
    calendarType: 'permanent',
    availableTo: '2100-01-01T00:00:00+00:00',
    terms: [{ id: '0.8.0.0.0', label: 'Openbare ruimte', domain: 'eventtype' }],
    created: '2018-06-13T08:18:48+00:00',
    modified: '2018-06-13T08:20:13+00:00',
    creator: 'a.larrea@visit.brussels',
    workflowStatus: 'APPROVED',
    languages: ['nl', 'fr', 'en'],
    completedLanguages: ['nl', 'fr'],
    availableFrom: '2013-10-19T01:13:39+02:00',
    geo: { latitude: 50.8517105, longitude: 4.3524106 },
    bookingInfo: { phone: '0900-10.440' },
    contactPoint: {
      phone: ['0900-10.440'],
      email: ['ugc.bel@skynet.be'],
      url: ['http://www.ugc.be'],
    },
    description: {
      nl:
        'De voormalige Eldorado, met een filmzaal met mythische dimensies en een prachtig bewaard art deco kader. Een gevarieerd en internationaal aanbod.',
      fr:
        'C\u2019est l\u2019ancien Eldorado, salle de l\u00e9gende, avec sa grande salle Art d\u00e9co conserv\u00e9e. Au niveau de la programmation, les grandes productions internationales c\u00f4toient les derni\u00e8res Palmes d\u2019Or.',
    },
    status: { type: 'Available' },
  },
  status: { type: 'Available' },
  availableTo: '2021-06-20T21:59:59+00:00',
  sameAs: [
    'http://www.uitinvlaanderen.be/agenda/e/multiple-calendar-type/b678d697-3634-4489-9fcd-c5c29b1f9ca6',
  ],
  terms: [{ id: '0.0.0.0.0', label: 'Tentoonstelling', domain: 'eventtype' }],
  created: '2021-03-05T10:33:22+00:00',
  modified: '2021-03-05T10:33:57+00:00',
  creator: '8033457c-e13e-43eb-9c24-5d03e4741f95',
  workflowStatus: 'READY_FOR_VALIDATION',
  audience: { audienceType: 'everyone' },
  languages: ['nl'],
  completedLanguages: ['nl'],
  production: null,
  typicalAgeRange: '-',
  availableFrom: '2021-03-05T11:33:45+01:00',
  calendarType: 'multiple',
  startDate: '2021-03-04T23:00:00+00:00',
  endDate: '2021-06-20T21:59:59+00:00',
  subEvent: [
    {
      status: { type: 'Available' },
      startDate: '2021-03-04T23:00:00+00:00',
      endDate: '2021-03-05T22:59:59+00:00',
      '@type': 'Event',
    },
    {
      status: { type: 'Available' },
      startDate: '2021-03-19T23:00:00+00:00',
      endDate: '2021-03-28T21:59:59+00:00',
      '@type': 'Event',
    },
    {
      status: { type: 'Available' },
      startDate: '2021-05-19T22:00:00+00:00',
      endDate: '2021-06-20T21:59:59+00:00',
      '@type': 'Event',
    },
  ],
};

export { event, eventWithSubEvents };