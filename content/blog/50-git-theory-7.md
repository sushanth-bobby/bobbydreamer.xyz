---
title: Git Theory - 7 - Git Everyday
date: 2020-11-14
description: Contains Git flowchart, shortcuts and references
tags:
  - notes
  - git
slug: "/50-git-theory-7"
---

This picture, sort of gives an overview of some major git commands and where it fits in the Git World

![git flowchart](assets/50-git-flowchart.png)  


Below are some useful git commands, tests and references. 

##### Git Configuration 

| Description                                                  | Git Command                                      |
| ------------------------------------------------------------ | ------------------------------------------------ |
| Configure the author name to be used with your commits.      | `git config --global user.name "Sushanth Bobby"` |
| Configure the author email address to be used with your commits | `git config --global user.email bobby.dreamer@gmail.com` |


##### Git Everyday 

| Description                                                  | Git Command                                      |
| ------------------------------------------------------------ | ------------------------------------------------ |
| Staging files            | `git add .`                  |
| Commit                   | `git commit -m "Added/Updated/Deleted November 2020 : route-name, page-name : Did what ?`  |
| Commit added and changed | `git commit -am "Added/Updated/Deleted November 2020 : route-name, page-name : Did what ?` |
| List status              | `git status`                 |
| Check ignore             | `git check-ignore -v *`      |
| Creating tags            | `git tag 1.0.0 <commitID>`   |
| Replaces file in working directory | `git checkout -- fileA.txt` |

##### Git Branch

| Description                                                  | Git Command                     |
| ------------------------------------------------------------ | ------------------------------- |
| List all the branches in your repo, and also tell you what branch you're currently in | `git branch` |
| Switch from one branch to another                            | `git checkout branch_name`      |
| Create a new branch and switch to it                         | `git checkout -b branch_name`   |
| Deletign a branch                                            | `git branch -d <branchname>`    |
| Forcibly delete the branch(before merging)                   | `git branch –D feature`         |


##### Git Remote

| Description                                                  | Git Command                       |
| ------------------------------------------------------------ | --------------------------------- |
| Clone a repository into a new directory                                 | `git clone repo_url`   |
| Download objects and refs from remote repository for master branch      | `git fetch origin master`   |
| Download objects and refs from remote repository for all branches       | `git fetch --all`      |
| List all currently configured remote repository urls             | `git remote -v`               |
| Push and add upstream(tracking) reference for argument-less pull | `git push -u origin master`   |
| Pull from remote master and set as upstream                      | `git pull -u origin master`   |
| Fetch and merge changes on the remote server to your working directory: | `git pull`             |
| Pushing commits to remote                                        | `git push`                    |
| Send changes of master branch to remote origin master branch     | `git push origin master`      |
| Delete remote branch                                             | `git push origin -d feature`  |
| Push all branches to your remote repository                      | `git push --all origin`       |
| Push all tags to remote repository                               | `git push --tags origin`      |


##### Other Git commands

| Description                                                  | Git Command                  |
| ------------------------------------------------------------ | ---------------------------- |
| Search the working directory for `foo()`                     | `git grep "foo()"`           |
| List of all files in a commit tree                           | git ls-tree --name-only -r HEAD  |
| List of all files changed in a commit                        | git diff-tree --no-commit-id --name-only -r HEAD |


#### # References
* [Git glossary](https://git-scm.com/docs/gitglossary)
* [Pro Git](https://git-scm.com/book/en/v2)
* [Vogella : Git](https://www.vogella.com/tutorials/Git/article.html)
* [GitHowTo](https://githowto.com/)
* [A Git Workflow for Agile Teams](http://reinh.com/blog/2009/03/02/a-git-workflow-for-agile-teams.html)

Cheatsheet
* [arslanbilal/git-cheat-sheet](https://github.com/arslanbilal/git-cheat-sheet/blob/master/README.md)
* [git-tips/tips](https://github.com/git-tips/tips)

Visualizations
* [Bit-Booster - Offline Commit Graph Drawing Tool](http://bit-booster.com/graph.html)
* [CS Visualized: Useful Git Commands](https://dev.to/lydiahallie/cs-visualized-useful-git-commands-37p1)
* [A Visual Git Reference](https://marklodato.github.io/visual-git-guide/index-en.html)

Rebasing
* [Rebase workflow : Randy Fay](https://randyfay.com/content/rebase-workflow-git)
* [Rebase workflow : Catherine Chepkurui](https://medium.com/@katherinekimetto/git-rebase-rebase-then-merge-86c0b1d18973)
* [Rebase example: YT](https://www.youtube.com/watch?v=CEtqad1jM2E&t=767s) : Order of commit is changed. 

Git flow 
* [A successful Git branching model](https://nvie.com/posts/a-successful-git-branching-model/)
* [Issues with git-flow](http://scottchacon.com/2011/08/31/github-flow.html)

Git advance topics
* [Git Extras](https://github.com/tj/git-extras)
* [BFG Repo-Cleaner : Removes large blobs](https://rtyley.github.io/bfg-repo-cleaner/)
* [Rewriting Your Git History and JS Source for Fun and Profit](https://blog.isquaredsoftware.com/2018/11/git-js-history-rewriting/)


Materials
* [Powerpoint Slides](https://storage.googleapis.com/bobbydreamer-com-technicals/Git%20-%20Sushanth-1.pptx) which i had prepared in Dec 2018. 


#### # Git Theory 
* **[Origin](44-git-theory-1)** : How it all began. What is git ? and Terminologies used in this series. 
* **[Basics](45-git-theory-2)** : config, init, add, rm, .gitignore, commit, log, blame, diff, tag, describe, show and stash
* **[Undos](46-git-theory-3)** : checkout, reset, revert and restore
* **[Branching](47-git-theory-4)** : Git Branching
* **[Internals](48-git-theory-5)** : Git Internals
* **[Collaboration](49-git-theory-6)** : Git remote repository
* **[Local Git Hooks](115-git-hook-client-side)** : Sample on pre-commit and prepare-commit-msg hooks 
