---
title: Hosting a site from Google Cloud Storage
date: 2018-03-03
description: Hosting from Google Cloud Storage ( baby site )
tags: 
  - web-development
  - deployment
  - GCP
slug: "/host-site-from-google-storage"
---

*This content is from 2018, migrated from my old site and site's been migrated as well to [v2.bobbydreamer.com](http://www.v2.bobbydreamer.com)*     

This site is very basic, you know, *hosting a site from Google Cloud Storage*. There can't be any basic than this. 

Why ? 

You are about to host a .html file with images and hand-written CSS without much bootstrap. 

Only complex stuff would be setting up *Hosting*

### # Step-by-Step 

1. Register in Google Cloud    
    Register in google cloud as you will be using its storage and with free credit of $300, its free for a year. Google may check whether it's a valid debit/credit card by billing Rs.50 and reversing the transaction. Caution : Once you register your debit card be careful/watchful of all your actions in google cloud sites.

1. Go to Google Cloud Console
    ![Google Cloud Console](assets/02-image001.png)

1. Under Storage, hover on Storage and select "Browser"
    ![Google Cloud Console](assets/02-image002.png)

1. Create a bucket
    Since my site name is bobbydreamer.com. I am naming the bucket as www.bobbydreamer.com . When you bucket name with dot(.) symbol google will check, if that domain is available. So, it's better to do the below after purchasing the domain from google domains.

    ![Google Cloud Console](assets/02-image003.png)

1. Click the bucket name once its created    
    ![Google Cloud Console](assets/02-image004.png)

1. Now you can “Upload Files” (OR) Drag&Drop them.
    ![Google Cloud Console](assets/02-image006.png)

1. Check and set Share publicly    
    Go and click “Share publicly” checkbox either in the column header or specific files. When you check this only it will be available for use by others, till then its only for your personal use. Repeat this process for all items/objects which your webpage is going use(fonts/js/images/css) in all the sub-folders. Once you click “Share Publicly”, “Public link” should appear. You can click the link to see the page temporarily (debugging purposes).

    ![Google Cloud Console](assets/02-image007.jpg)

1. Edit Web Configuration
    Click on the bucket title and go back and then click the three dots at the right-end and Select “Edit website Configuration”

    ![Google Cloud Console](assets/02-image008.jpg)

1. Enter the name of the homepage(index.html) and error handling page(404.html) and click save

    ![Google Cloud Console](assets/02-image009.png)

1. Go to Google Domains(https://domains.google.com/). If you don't have a site yet, get one. It's around Rs.899 per year. Below is the site which I have created.    

    ![Google Cloud Console](assets/02-image010.png)

1. Select Configure DNS. Go to “Custom resource records” section at the bottom and type-in data like below and click “Add”

    ![Google Cloud Console](assets/02-image011.png)

1. It will appear as below, don't worry that your domain name didn't appear. Its like that only.
    
    ![Google Cloud Console](assets/02-image012.png)

1. That's it. It will take a minute or two to get the website online.

> NOTE    All the above will get www.bobbydreamer.com loaded, but if i type bobbydreamer.com i will get below error message. To resolve this, you will have to update “Synthetic Records” entires. It will forward bobbydreamer.com to www.bobbydreamer.com. This is recommended to carry-on and perform the below steps as well.

![Google Cloud Console](assets/02-image013.png)

### # Setting up Synthetic Records

1. Type in the below information, type @ symbol at the subdomain and your site address in “destination URL” and then Click “Add”    

    ![Google Cloud Console](assets/02-image014.png)

1. It should look like and in a minute this should get updated and now you should be able to get to www.bobbydreamer.com just by typing bobbydreamer.com as well.

    ![Google Cloud Console](assets/02-image015.png)

In case, if the bucket is deleted, you will get below message

![Google Cloud Console](assets/02-image016.png)
 
 **Source** : [Hosting a static website](https://cloud.google.com/storage/docs/hosting-static-website)

 