export default {
  sanity: {
    projectId: import.meta.env.SANITY_STUDIO_PROJECT_ID || "",
    dataset: import.meta.env.SANITY_STUDIO_DATASET || "production",
    apiVersion: "2024-01-16",
    token: import.meta.env.SANITY_TOKEN,
  },
};
