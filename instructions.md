## Goal

This is an astro project with the Sanity integration. I just copy-pasted the @apps/web/src/sanity/ folder from another project. 
I want you to fix all issues and make sure the @apps/web/src/pages/index.astro queries any sample document (e.g. *[_type == "home"][0]) and outputs it as JSON. 

Types need to be generated automatically out of queries, you can browse Sanity docs to learn exactly how to achieve that. 

If there are any missing dependencies, make sure to install them.


### Resources
- Sanity Typegen guide: https://www.sanity.io/docs/developer-guides/an-opinionated-guide-to-sanity-studio#40deeb99f4d1
- Sanity astro official guide: https://www.sanity.io/plugins/sanity-astro
