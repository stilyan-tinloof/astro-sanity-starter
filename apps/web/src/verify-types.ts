// This file verifies that automatic type inference is working
import { sanityClient } from './lib/sanity';
import { HOME_QUERY } from '@packages/sanity/queries';

async function verifyTypes() {
  // This should automatically infer the type as HOME_QUERY_RESULT
  // WITHOUT any manual type annotations!
  const homeData = await sanityClient.fetch(HOME_QUERY);

  // If types are working, these will have proper IntelliSense:
  // homeData is: { _id: string; _type: "home"; title: string | null; description: string | null; } | null

  if (homeData) {
    console.log(homeData._id);        // string
    console.log(homeData._type);      // "home"
    console.log(homeData.title);      // string | null
    console.log(homeData.description); // string | null

    // This would cause a TypeScript error if uncommented:
    // console.log(homeData.nonExistentField);
  }
}

verifyTypes();