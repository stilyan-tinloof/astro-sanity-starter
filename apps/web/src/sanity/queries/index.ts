import { defineQuery } from "groq";

// Header fragment - reused in page queries
const HEADER_FRAGMENT = `"header": *[_type == "header"][0]{
  _id,
  title,
  navigation[]{
    _key,
    label,
    href
  }
}`;

// Footer fragment - reused in page queries
const FOOTER_FRAGMENT = `"footer": *[_type == "footer"][0]{
  _id,
  copyright,
  navigation[]{
    _key,
    label,
    href
  }
}`;

// Combined queries for pages (include header/footer in single request)
export const HOME_QUERY = defineQuery(`{
  "page": *[_type == "home"][0]{ _id, ... },
  ${HEADER_FRAGMENT},
  ${FOOTER_FRAGMENT}
}`);

export const PAGE_QUERY = defineQuery(`{
  "page": *[_type == "page" && pathname.current == $pathname][0]{ _id, ... },
  ${HEADER_FRAGMENT},
  ${FOOTER_FRAGMENT}
}`);

// Standalone queries (for cases where only one is needed)
export const ALL_PAGES_QUERY = defineQuery(`*[_type == "page" && defined(pathname.current)]{ pathname }`);

export const HEADER_QUERY = defineQuery(`*[_type == "header"][0]{
  title,
  navigation[]{
    _key,
    label,
    href
  }
}`);

export const FOOTER_QUERY = defineQuery(`*[_type == "footer"][0]{
  copyright,
  navigation[]{
    _key,
    label,
    href
  }
}`);
