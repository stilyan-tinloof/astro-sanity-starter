export default {
  sanity: {
    projectId: import.meta.env.SANITY_PROJECT_ID || '',
    dataset: import.meta.env.SANITY_DATASET || 'production',
    apiVersion: '2024-01-16',
    token: import.meta.env.SANITY_TOKEN,
  },
};