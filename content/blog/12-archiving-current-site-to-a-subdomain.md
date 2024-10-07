---
title: Archiving current site to a subdomain
date: 2020-03-28
description: Archiving V2 of bobbydreamer.com
tags: 
  - web-development 
  - GCP 
  - hosting 
  - GoogleDomains
  - GCS 
slug: "/archiving-current-site-to-a-subdomain"
---

Version upgrades are usual process in software life cycle, below are the steps, i had used to migrate my existing site. 

What i am doing is sort of migrating my existing site from root domain to a subdomain, so in a way previous version is also active for reference purposes. 

**Existing Current site** : bobbydreamer.com 
	![Google Cloud Storage](assets/12-v2sd0.png)

**New Proposed Site** : localhost:8000
	![Google Cloud Storage](assets/12-v2sd4.png)

After this migration process, current site would become archived site and new proposed site would become the current site

**Archived site** : [v2.bobbydreamer.com](http://www.v2.bobbydreamer.com/)
	![Google Cloud Storage](assets/12-v2sd3.png)

### # Steps i took in migrating the site

1. Created a new bucket in GCS with settings multi-regional and permissions `fine-grained` access control.
	![Google Cloud Storage](assets/12-v2sd1.png)

1. Since the current site is hosted from Cloud Storage, i am just moving all the files from current bucket `www.bobbydreamer.com` to `www.v2.bobbydreamer.com`. I don't have to do this but it will reduce confusion in future. Open Cloud Shell and enter the below commands
    ```sh
    gsutil -m cp -r gs://www.bobbydreamer.com/* gs://www.v2.bobbydreamer.com

    gsutil defacl set public-read gs://www.v2.bobbydreamer.com
    ```
    **First command** : `gsutil -m cp -r gs://www.bobbydreamer.com/* gs://www.v2.bobbydreamer.com` copies files from one bucket to another 
    * -m for parallel(multi-threaded/multi-processing) copy
    * -r for recursive to copy entire directory tree 

    **Second command** : `gsutil defacl set public-read gs://www.v2.bobbydreamer.com` to make entire bucket public

1. Did you note the highlighted text in the image in point(1). Sort of, Domain ownership verification required. Since everything is in Planet Google, its easy for me. I am already logged in google account, now i have to go to [Search console](https://search.google.com/search-console), type in new URL( www.v2.bobbydreamer.com ) to verify ownership. 

1. Adding custom resource records in Google Domains.   
    Go to [Google Domains](https://domains.google/intl/en_in/) -> My Domains -> DNS -> Add the below custom record 

	![Google Domains](assets/12-v2sd2.png)

1. After waiting for 10mins everything is set. 
	![Google Cloud Storage](assets/12-v2sd3.png)

1. As a final step i have deleted the "Custom resource records" related to www.bobbydreamer.com with data "c.storage.googleapis.com."


### # Related articles
1. [How i made this gatsby site](04-how-i-made-this-site)
