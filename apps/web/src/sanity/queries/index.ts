import { defineQuery } from "groq";

export const HOME_QUERY = defineQuery(`*[_type == "home"][0]`);

export const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug][0]`);

export const ALL_PAGES_QUERY = defineQuery(`*[_type == "page" && defined(slug.current)]{ slug }`);

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
