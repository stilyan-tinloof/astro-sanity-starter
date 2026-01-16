// Test file to debug type inference
import { createClient } from '@sanity/client';
import { defineQuery } from 'groq';

// Import the types to activate module augmentation
import '@packages/sanity/types';

const client = createClient({
  projectId: 'test',
  dataset: 'production',
  apiVersion: '2024-01-16',
  useCdn: false,
});

// Define query inline
const HOME_QUERY_INLINE = defineQuery(`*[_type == "home"][0] {
  _id,
  _type,
  title,
  description
}`);

// Import the query from the package
import { HOME_QUERY } from '@packages/sanity/queries';

async function test() {
  // Test inline defineQuery
  const data1 = await client.fetch(HOME_QUERY_INLINE);

  // Test imported query
  const data2 = await client.fetch(HOME_QUERY);

  // Check if either has proper types
  console.log(data1, data2);
}