---
title: IAM and Service Accounts
date: 2021-10-10
description: Adding roles to service accounts
tags: ['GCP']
slug: "/131-gcp-iam"
---

#### What are service accounts ?     

A service account is a special kind of account used by an application or a virtual machine (VM) instance, not a person. Applications use service accounts to make authorized API calls, authorized as either the service account itself, or as Google Workspace or Cloud Identity users through domain-wide delegation.

A service account is identified by its email address, which is unique to the account.

##### Google-managed keys  

Google-managed key pairs imply that Google stores both the public and private portion of the key, rotates them regularly (each key can be used for signing a maximum of two weeks), and the private key is always held in escrow and is never directly accessible. IAM provides APIs to use these keys to sign on behalf of the service account.

##### Creating Service Account     

1. Go to IAM in Cloud Console and a create a new service account which will have naming convention like `<<home-project-name>>@<<project-id>>.iam.gserviceaccount.com` 

  * In Role selection section, if you don't know what you are doing, for starters you can select Role (Quick Access 🡪 Basic 🡪 Owner)
  * If you are bit experienced with GCP then, just keep adding the Admin role for the product you are going to use. 

2. After creating the account, go in to the *Keys* section and click *ADD KEY* 🡪 *Create new key* and download the key as JSON. 


#### Adding new roles to IAM account    

* Go to IAM 
* Click the Edit symbol on the *Principal* to edit permissions
* Click **ADD ANOTHER ROLE** 
* Search for *Storage Admin* and select it. It should say *Full control of GCS resources* in grey at the bottom. 

![IAM role storage admin](assets/131-iam-role-storage-admin.png)

Repeat the above process for other products 

![Principal](assets/131-iam-principal.png)

Later you can remove all the excess permissions when you want to restrict. 


#### Thats all folks!