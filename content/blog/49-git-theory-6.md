---
title: Git Theory - 6 - Remote repository
date: 2020-11-05
description: Git basics covers clone, pull and push
tags:
  - notes
  - git
slug: "/49-git-theory-6"
---

One of the best feature about GIT Source Control Management(SCM) is its distributed. Git repositories can be hosted in a file server in the web which can be your backup (or) a repository you are contributing to (or) someone else is contributing to yours. 

To collaborate in any project in the current world, zipping your development folder and sending it over an email (or) sharing the zip via any file sharing platforms is unacceptable. You need to know how distributed SCM system works. 

Good news is, git is a distributed SCM, so you just need to know how to manage your remote repositories which basically involves setting up remote repositories, cloning, push, pull and handling conflicts. 

#### # Setting up remote repository

This is the syntax to add a remote git repository `git remote add <shortname> <url>`

When you try to create a git repository in Github by default it will ask you run few git commands like below, 

If you are setting up a new repository with name *bootstrap5alpha2*. You can run the below commands in your local system and notice `git remote add` command with origin(is just a short name for your remote repo) and *url*. Here `main` is the new `master` branch, default branch name has been changed. 

```sh {7-8}
# …or create a new repository on the command line
echo "# bootstrap5alpha2" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/bobbydreamer/bootstrap5alpha2.git
git push -u origin main
```

If you already have the repository 'bootstrap5alpha2' in your local system and you want to just upload it to remote then you can do the below, 
```sh {2}
# …or push an existing repository from the command line
git remote add origin https://github.com/bobbydreamer/bootstrap5alpha2.git
git branch -M main
git push -u origin main #or use this if github just has initial commit : git push --force -u origin main

```

* `git push -u origin new-feature` : `-u` or `--set-upstream` flag adds the new branch `new-feature` to the upstream(tracking) reference, so next time `git push` can be invoked without any parameters to automatically push the new-feature branch to the central repository.

#### # Clone
Cloning a repository automatically downloads all the data from that repository including its history and git makes local master branch as a tracking branch for the master branch of the origin repository (short: origin/master ) by Git.

If tracking branches need to be created manually, you need to run below commands 
```
git checkout -b newbranch origin/new-feature

# (or)

# create branch based on remote branch
git branch new-feature origin/master
git branch --track new-feature origin/master
```

So, if remote repository is updated with new developments after you cloned, you can do a `git fetch` and download all the latest data but does not merge that data with your current working directory. Thats the job for `git pull`, it does all the merging automatically. 

![Github - Clone](assets/49-git-clone.png)  

In the below `git clone` command, i have used '.' to initialize current folder as a git repository and if i have not done that, in that case, `git clone` command would have created a new folder 'HelloWorld` and git initialized that. 

```sh {2}
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3
$ git clone https://github.com/bobbydreamer/HelloWorld.git .
Cloning into '.'...
remote: Enumerating objects: 74, done.
remote: Total 74 (delta 0), reused 0 (delta 0), pack-reused 74
Unpacking objects: 100% (74/74), done.
```

`git remote` with `-v` shows the remote details(remote name, url)
```sh {2,7,15,21}
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git remote -v
origin  https://github.com/bobbydreamer/HelloWorld.git (fetch)
origin  https://github.com/bobbydreamer/HelloWorld.git (push)

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git remote show
origin

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git branch
* master

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git branch -a
* master
  remotes/origin/HEAD -> origin/master
  remotes/origin/master

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git remote show origin
* remote origin
  Fetch URL: https://github.com/bobbydreamer/HelloWorld.git
  Push  URL: https://github.com/bobbydreamer/HelloWorld.git
  HEAD branch: master
  Remote branch:
    master tracked
  Local branch configured for 'git pull':
    master merges with remote master
  Local ref configured for 'git push':
    master pushes to master (up to date)
```

#### # Push
If you want to share your code changes or back it up, you have to do `git push` which basically uploads all your committed data to your remote repository. 

```sh {13}
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ cat readme.MD
# Push Testing
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git add .

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git commit -m "Push Testing"
[master f1db835] Push Testing
 1 file changed, 1 insertion(+), 2 deletions(-)

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git push origin master
Counting objects: 3, done.
Delta compression using up to 8 threads.
Compressing objects: 100% (2/2), done.
Writing objects: 100% (3/3), 285 bytes | 285.00 KiB/s, done.
Total 3 (delta 1), reused 0 (delta 0)
remote: Resolving deltas: 100% (1/1), completed with 1 local object.
To https://github.com/bobbydreamer/HelloWorld.git
   d33855d..f1db835  master -> master
```

![Github - Push Testing](assets/49-git-push.png)  

Push tags using below command
```
git push --tags
```

#### # Pull
`git fetch` command will fetch all the changes on the server that you don't have yet, it will not modify your working directory at all. It will simply get the data for you and let you merge it yourself. However, there is a command called `git pull` which is essentially a `git fetch` immediately followed by a `git merge`.

What `git pull` does is, it will look up what server and branch your current branch is tracking, fetch from that server and then try to merge in that remote branch.

Now, i have updated the readme.MD directly at git as 'Pull Testing' and currently local system is not aware of the new changes. 

![Github - Pull Testing](assets/49-git-pull.png)  

```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git lol -n 3
* f1db835 - (HEAD -> master, origin/master, origin/HEAD) Push Testing (6 minutes ago) <Sushanth Bobby Lloyds>
* d33855d - 13. Updating readme.md (2 years, 8 months ago) <Sushanth Bobby Lloyds>
* aac86ea - 12. Adding readme.md (2 years, 8 months ago) <Sushanth Bobby Lloyds>
```

There is no easy porcelain command to see if there are any latest commits at remote. Below is one of the approaches. 
```sh {2}
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git ls-remote https://github.com/bobbydreamer/HelloWorld.git
311577e12ae8b60fe1b3ef9abf6580922a2c3c13        HEAD
311577e12ae8b60fe1b3ef9abf6580922a2c3c13        refs/heads/master
```

Every other commands gets data from local only like below and after `git fetch` they can show the remote commits. 
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git rev-parse origin/master
f1db83597d8adba36d22262644c0381c36e59564

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git rev-parse HEAD
f1db83597d8adba36d22262644c0381c36e59564
```

First we will try `git pull` then we will do another update and try `git fetch`
```sh {2}
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git pull -at
remote: Enumerating objects: 5, done.
remote: Counting objects: 100% (5/5), done.
remote: Compressing objects: 100% (2/2), done.
remote: Total 3 (delta 1), reused 0 (delta 0), pack-reused 0
Unpacking objects: 100% (3/3), done.
From https://github.com/bobbydreamer/HelloWorld
   f1db835..311577e  master     -> origin/master
Updating f1db835..311577e
Fast-forward
 readme.MD | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git lol
* 311577e - (HEAD -> master, origin/master, origin/HEAD) Pull Testing (37 minutes ago) <Sushanth Bobby Lloyds>
* f1db835 - Push Testing (39 minutes ago) <Sushanth Bobby Lloyds>
* d33855d - 13. Updating readme.md (2 years, 8 months ago) <Sushanth Bobby Lloyds>
* aac86ea - 12. Adding readme.md (2 years, 8 months ago) <Sushanth Bobby Lloyds>
```

Now again we have updated readme.MD in github and this time try to fetch. 

![Github - Fetch](assets/49-git-fetch.png)  

```sh {8,13,17,28-29}
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git lol -n 3
* 311577e - (HEAD -> master, origin/master, origin/HEAD) Pull Testing (40 minutes ago) <Sushanth Bobby Lloyds>
* f1db835 - Push Testing (41 minutes ago) <Sushanth Bobby Lloyds>
* d33855d - 13. Updating readme.md (2 years, 8 months ago) <Sushanth Bobby Lloyds>

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git ls-remote https://github.com/bobbydreamer/HelloWorld.git
5f2670d5823af2977a0bdbe8df08dfa6aae36bd7        HEAD
5f2670d5823af2977a0bdbe8df08dfa6aae36bd7        refs/heads/master

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git branch -vv
* master 311577e [origin/master] Pull Testing

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git fetch --all
Fetching origin
remote: Enumerating objects: 5, done.
remote: Counting objects: 100% (5/5), done.
remote: Compressing objects: 100% (2/2), done.
remote: Total 3 (delta 1), reused 0 (delta 0), pack-reused 0
Unpacking objects: 100% (3/3), done.
From https://github.com/bobbydreamer/HelloWorld
   311577e..5f2670d  master     -> origin/master

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git branch -vv
* master 311577e [origin/master: behind 1] Pull Testing
```

Since its fetched, now you can do `git merge`
```sh {2}
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git merge origin/master
Updating 311577e..5f2670d
Fast-forward
 readme.MD | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git lol -n 3
* 5f2670d - (HEAD -> master, origin/master, origin/HEAD) Fetch Testing (10 minutes ago) <Sushanth Bobby Lloyds>
* 311577e - Pull Testing (49 minutes ago) <Sushanth Bobby Lloyds>
* f1db835 - Push Testing (50 minutes ago) <Sushanth Bobby Lloyds>
```

##### Fetch from all remote repositories
The git fetch command updates only the remote-tracking branches for one remote repository. In case you want to update the remote-tracking branches of all your remote repositories you can use the following command.
```
# this runs git fetch for every remote repository
git remote update

# the same but remove all stale branches which are not in the remote anymore
git remote update --prune
```

#### # Deleting Remote Branches
When all your developments on a feature is done. You can delete the remote branch. 
```
git push origin --delete FeatureBranch007
```

#### # Renaming remote branch
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git remote rename origin rem-HW

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git remote -v
rem-HW  https://github.com/bobbydreamer/HelloWorld.git (fetch)
rem-HW  https://github.com/bobbydreamer/HelloWorld.git (push)
```

#### # Deleting remote branch 
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git remote remove rem-HW

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git remote -v
```

#### # Forking
Forking is a popular workflow, mostly used in open-source projects. Fork operation clones the remote repository to your github/BitBucket account instead of downloadig it your local computer. Forked repositories are special they just `git clone` on the server-side maintained by GH/BB. Later you can clone the personalized copy of that repository to your local system. 

Below is the process when creating a fork
![Github - Fork](assets/49-git-fork-1.png)  

Forking workflow mostly would be following below steps, 
1. Do a fork in GitHub or BitBucket on any project which you want to contribute to, it could be an open source project as well.
2. Once you get the personalized copy that open-source repository to your account, clone it to your local. This forked repository becomes the `origin`, remote is automatically added by `git clone` which you can check by `git remote -v`. 
3. Go to the original open-source repository which you wanted contribute to and get the URL by clicking the clone drop-down. Come back to your local machine and do `git remote add upstream URL`, this will add that official open-source repository as upstream. 
    * Basically forked repos have two remotes 
      + *Origin* which points to personalized copy of the forked repo 
      + *Upstream*, points to the offical open-source repository
        - Upstream is setup, so that you can regularly pull the latest changes
      + In the end when you do `git remote -v` you should two entires for origin and two rows for upstream.
4. Create a local branch and work on it and when it looks good, commit it.
5. Periodcally check the offical repository for any new updates and pull using 
  ```
  git pull upstream master
  # or 
  git fetch upstream 
  git checkout master
  git merge upstream/master
  ```
6. Push the changes to your personalized copy of the open-source repository. 
    * `git push origin feature-branch`
7. Go to github, you should see *Compare  & pull request* button, click it to begin a Pull Request(PR) from the new branch to the 'official open-source' repository. In the pull request, you will see that orginal open-source repository is listed as the "base repository", and your fork is listed as the "head repository". Before submitting the PR, you need to describe the change you have made. 
8. The maintainer might ask you to make some changes you can do by, 
    * Go to your local feature-branch
    * Make updates and commit
    * Push changes to your fork
    * Open your pull request, you should see your new commits. 
    * Discuss on the changes in comments and resolve conversation.
9. PR get reviewed by the maintainer and when all good, gets approved for merge to the main open source project repository. You will be given an option to delete your branch, you can proceed to do so, if you wish. If you delete the branch, you should delete it in your local as well. `git branch -D feature-branch`
10. Synchronize your fork by running below commands and after that go to Github to your fork, you should see a message like "This branch is even with open-source repository". This step is not necessary but it keeps thing clean. 
  ```
  git pull upstream master
  git push origin master
  ```

Below is the process when submitting a pull request, 
![Github - Fork](assets/49-git-fork-2.png)  

On the other side what the maintainer does to integrate is, 
1. Maintainer pulls the contributor's changes into his/her own local repository
2. Reviews to to make sure it doesn't break the project and then merges it into their local master branch
3. Pushes the master branch to the official repository on the server. 

Now this contribution is now part of the bigger project and other developers should pull from the official repository to synchronize their local repositories.

* * * 

#### # Next steps 
* **[Git Everyday](50-git-theory-7)** : Git flowchart, shortcuts and references
* **[Origin](44-git-theory-1)** : How it all began. What is git ? and Terminologies used in this series. 
* **[Basics](45-git-theory-2)** : config, init, add, rm, .gitignore, commit, log, blame, diff, tag, describe, show and stash
* **[Undos](46-git-theory-3)** : checkout, reset, revert and restore
* **[Branching](47-git-theory-4)** : Git Branching
* **[Internals](48-git-theory-5)** : Git Internals

