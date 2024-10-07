---
title: Git Theory - 4 - Branching
date: 2020-10-17
description: This part of Git series covers branching concepts using checkout, merge, rebase and handling conflict scenarios
tags:
  - notes
  - git
slug: "/47-git-theory-4"
---

Here we are covering subjects related to branches. 

#### # git branch

* Branches allow us to work on different versions of the same file in parallel. Edits on one branch is independent of other branch. 
* At later point it can be decided whether to merge or not.
* Default branch was called Master after BLM(BlackLivesMatter) protests in 2020 its been changed to 'main'

##### Always do remember

* Head will always point to the tip of the branch(i.e., latest commit)
* Branch is a lightweight movable pointer which will always point to latest commit
* If head points to a different commit point, then head is in a state referred to as 'detached HEAD'

![git branching](assets/47-git24.png)  

##### Detached HEAD     

![git branching](assets/47-git25.png)  

* `git checkout <sha1>` \ `git checkout <tag_name>`
  - Switches the currently active branch to a specific commit
  - Updates the files in the working directory to reflect that commit point. 
    
* To get back to master branch 
  - `git checkout master`

![git detached](assets/47-git26.png)

##### Branching concepts 

`git branch` can tell you to which branch HEAD is pointing to.

![git branch](assets/47-git27.png)

* `git branch -v` gives you more information about branches and commit points and messages (-v is verbose)

If you give `git checkout –b feature`
* Creates a new branch
* Checkout to new branch feature

![git checkout](assets/47-git28.png)

Now we are ready to merge feature with master. 

You can also create a new branch like below, it creates a new feature12-test branch based on master branch.
```
git checkout -b feature12-test master
```

**Two steps of merging**    

* Checkout into the branch you want merge INTO (ALREADY DONE)
* Merge the branch you want to merge

![git merge](assets/47-git29.png)

##### Understanding merge graph
![git merge graph](assets/47-git30.png)

Make a note of the strategy in the above diagram **recursive**

##### Lets rewind a bit and do fast-forward merge
![Remove a commit](assets/47-git31.png)

![git reset -hard](assets/47-git32.png)

![Fast-forward strategy](assets/47-git33.png)
This is a fast-forward merge 

![Fast-forward strategy](assets/47-git34.png)

**Going back to the Recursive Strategy (or) 3-way merge**

> “the commit on the branch you're on isn't a direct ancestor of the branch you're merging in, Git has to do some work. In this case, Git does a simple three-way merge, using the two snapshots pointed to by the branch tips and the common ancestor of the two.”

Git uses 3 commits to generate a merge commit
* Last commit of master
* Last commit of feature
* Common ancestor commit (base commit)

![Recursive Strategy](assets/47-git35.png)

##### Delete branch

Once the branches are merged they can be deleted
* `Git branch --merged`
    - Show all the merged branches
* `git branch –d feature`
    - Deletes the branch

**NOTE**:- *Git will not allow a branch to be deleted if its not merged. Use the below command to forcibly delete the branch.*
  - `git branch –D feature`


**Create a new tracking branch based on a remote branch**    
```
git branch --track <new-branch> <remote-branch>
```

##### Rename current branch to new branch name
```sh {6,15}
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test4 (master)
$ git branch
* master

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test4 (master)
$ git checkout -b name1
Switched to a new branch 'name1'

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test4 (name1)
$ git branch
  master
* name1

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test4 (name1)
$ git branch -m name2

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test4 (name2)
$ git branch
  master
* name2
```

##### Use of stash during branch jumps

If you have made some unstaged changes in the working directory and try to checkout to new branch. You will not be able to do it. During then use,
  - `git stash`

##### Tricks
* Switching branches 
  ```
  git checkout master
  git checkout dev

  # here - means master
  git checkout -

  # here - means dev
  git checkout -
  ```


#### # git reflog
Reflog is short for reference log, is a mechanism to record when the tip of branches are updated. Git tries really hard not to lose your data, so if for some reason you think it has, chances are you can dig it out using git reflog. 

The most common usecase, you made some changes and committed those and did a `git reset --hard` to “undo” those changes, and then later realized, you want those changes back. Usecase for this would be any scenario where you move your HEAD. With reflog you can recover almost anything you've committed

Git refs are updated when below commands are executed
* Git checkout
* Git reset
* Git merge

`git reflog` is similar to `git log` but shows list of times when HEAD is changed. 

Things to remember 
* HEAD changes only, when you issue `git checkout -- <filename>`, HEAD does not change, so reflog cannot recover those. 
* `git reflog` does not last forever as git periodically cleans up objects which are unreachable. Its a global setting, by default it keeps for 90 days. 

Common reflog commands are
* `git reflog`  / `git reflog show HEAD`
* `git reflog show <<branch>>`
* `git reflog stash`

![git reflog](assets/47-git36.png)

Scenario above
* We have added 3 files in 3 commits and did a reset—hard to second commit. 
* After looking at hash from reflog, we did again a reset—hard to third commit.

#### # git rebase
> Rebasing is changing the base of your branch from one commit to another making it appear as if you'd created your branch from a different commit. Internally, Git accomplishes this by creating new commits and applying them to the specified base. It's very important to understand that even though the branch looks the same, it's composed of entirely new commits.

* In Simple words, rebase reapplies commits on top of another base tip.
* Other git command that capable of intergrating two branches is `get merge`. 
* Prefer to use rebase only on locally unpublished commits.

##### Usecase

* You are working on a feature branch that is out of date with a master branch, rebasing the feature branch onto master will allow all the new commits from master to be included in feature. 
* This helps in keeping branch's history clean so it appears as if you've been working off the latest master branch
* Cleaner history meaning it appears that all the work happened in series, even when it originally happened in parallel.

##### Rebase step-by-step
* Upstream : master
* Branch   : feature 

Before rebase
```
          A---B---C feature(head)
         /
    D---E---F---G master
```
Assuming here you are currently on your feature branch(`git checkout feature`) and when you enter (`git rebase master`) following happens,    

1. Git checks whats the common commit point(ancestor) in both branches.
2. Git looks at the current branch and see's all changes made by commits that are not in 'master' and are saved to a temporary area.
3. Current branch is reset to 'master' or 'newbase'. Eg:`git reset --hard <master>`
4. The commits that were previously saved into the temporary area are then reapplied to the current branch, one by one, in order.

During rebase (step 3)
```
                  feature(head)
                 /
    D---E---F---G master
```

After rebase command completion(A', B' and C' will have new SHA1-hashes)
```
                  A'--B'--C' feature(head)
                 /
    D---E---F---G master
```
Command `git rebase master feature ` combines above two command into a single command, what it does is, 
* Checks out the feature branch for you 
* Replays it onto the master branch

At this point, you can go back to the master branch and do a fast-forward merge as well. 
```
git checkout master
git merge feature

# Visual Output 
                              feature
                              |
    D---E---F---G---A'---B'---C' master(head)
```
You can remove the feature branche because all the work is integrated into master you don't need it anymore. 
```
git branch -d feature
```

![git rebase practical](assets/47-git37.png)

* (feature) branch has two additional commits D & E
* (master) branch has one additional commit F
* `git checkout` to feature
* Git rebase replays feature commits D & E on top of master commit(F) with new SHA1 commit values
* Now you can merge feature branch into master. It will be a fast-forward merge. 
```
git checkout master
git merge feature
```

Note : Its not recommended to rebase master onto a feature branch as it would create confusing history when working with multiple people in a team. Dont do something like the following, 
```
git checkout master
git rebase feature
```

Other options 
* Abort : `git rebase --abort`

##### Squashing commits using rebase

Plan is to squash last two commits(260b361, 25bde47) into one

Latest 10 commits
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/git (master)
$ git lol -n10
* 260b361 - (HEAD -> master) Deleting a c d e text files (1 year, 10 months ago) <Sushanth Bobby Lloyds>
* 25bde47 - (tag: V4, stash/start) Updated readme.txt & adding back c d e (1 year, 10 months ago) <Sushanth Bobby Lloyds>
*   d4bff73 - (tag: V3) Merge reset/finished into master (1 year, 10 months ago) <Sushanth Bobby Lloyds>
|\
| * 1ab856b - (reset/finished) Adding a.txt (1 year, 10 months ago) <Sushanth Bobby Lloyds>
|/
* b77ca73 - (reset/start) Updated readme.txt for RESET (1 year, 10 months ago) <Sushanth Bobby Lloyds>
*   85e7f70 - (tag: V2) Merge undo/finished into master (1 year, 10 months ago) <Sushanth Bobby Lloyds>
|\
| * db8427c - (undo/finished) Revert "Updated OneTwoThreeFour.txt line 2 from Two to number 2" (1 year, 10 months ago) <Sushanth Bobby Lloyds>
| * 178a3ca - Updated OneTwoThreeFour.txt line 4 from Four to number 4 (1 year, 10 months ago) <Sushanth Bobby Lloyds>
| * 6405ecb - Updated OneTwoThreeFour.txt line 2 from Two to number 2 (1 year, 10 months ago) <Sushanth Bobby Lloyds>
| * 3ebe1db - Adding OneTwoThreeFour.txt (1 year, 10 months ago) <Sushanth Bobby Lloyds>
```

Squashing latest two commits `git rebase -i HEAD~2`. As soon as i entered the command, vim editor window poped up and listed the two commits in chronological order with command `pick` and manually changed second commit command to `squash`. 
```
pick 25bde47 Updated readme.txt & adding back c d e
squash 260b361 Deleting a c d e text files

# Rebase d4bff73..260b361 onto d4bff73 (2 commands)
#
# Commands:
# p, pick = use commit
# r, reword = use commit, but edit the commit message
# e, edit = use commit, but stop for amending
# s, squash = use commit, but meld into previous commit
# f, fixup = like "squash", but discard this commit's log message
# x, exec = run command (the rest of the line) using shell
# d, drop = remove commit
#
# These lines can be re-ordered; they are executed from top to bottom.
#
# If you remove a line here THAT COMMIT WILL BE LOST.
#
# However, if you remove everything, the rebase will be aborted.
#
# Note that empty commits are commented out
```

After `Esc -> :wq`(save & exit), another editor pops up like below, this is for rewriting the comment message. 
```
# This is a combination of 2 commits.
# This is the 1st commit message:

Updated readme.txt & adding back c d e

# This is the commit message #2:

Deleting a c d e text files

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# Date:      Mon Dec 10 19:48:44 2018 +0530
#
# interactive rebase in progress; onto d4bff73
# Last commands done (2 commands done):
#    pick 25bde47 Updated readme.txt & adding back c d e
#    squash 260b361 Deleting a c d e text files
# No commands remaining.
# You are currently rebasing branch 'master' on 'd4bff73'.
#
# Changes to be committed:
#	deleted:    a.txt
#	modified:   readme.txt
#
# Untracked files:
#	Branching.txt
#
```

Commented existing comments by insert # symbol and added inserted message `squashing two commits (Updated readme.txt & adding back c d e, Deleting a c d e text files)` then save & exit. 

This is the final output 
```
$ git rebase -i HEAD~2
[detached HEAD 745f48c] squashing two commits (Updated readme.txt & adding back c d e, Deleting a c d e text files)
 Date: Mon Dec 10 19:48:44 2018 +0530
 2 files changed, 64 insertions(+), 1 deletion(-)
 delete mode 100644 a.txt
Successfully rebased and updated refs/heads/master.

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/git (master)
$ git lol -n 5
* 745f48c - (HEAD -> master) squashing two commits (Updated readme.txt & adding back c d e, Deleting a c d e text files) (6 minutes ago) <Sushanth Bobby Lloyds>
*   d4bff73 - (tag: V3) Merge reset/finished into master (1 year, 10 months ago) <Sushanth Bobby Lloyds>
|\
| * 1ab856b - (reset/finished) Adding a.txt (1 year, 10 months ago) <Sushanth Bobby Lloyds>
|/
* b77ca73 - (reset/start) Updated readme.txt for RESET (1 year, 10 months ago) <Sushanth Bobby Lloyds>
*   85e7f70 - (tag: V2) Merge undo/finished into master (1 year, 10 months ago) <Sushanth Bobby Lloyds>
|\
```

If this is what you had expected, then this is fine otherwise you can undo the above action by doing.

1. git reflog -n 10 : Show the last 10 reflog lists
2. Find the sha-value of the latest commit you had before (260b361)
3. git reset --hard "HEAD@{n}"

```
$ git reflog -n 10
745f48c (HEAD -> master) HEAD@{0}: rebase -i (finish): returning to refs/heads/master
745f48c (HEAD -> master) HEAD@{1}: rebase -i (squash): squashing two commits (Updated readme.txt & adding back c d e, Deleting a c d e text files)
25bde47 (tag: V4, stash/start) HEAD@{2}: rebase -i (start): checkout HEAD~2
260b361 HEAD@{3}: rebase -i (abort): updating HEAD
260b361 HEAD@{4}: rebase: aborting
d4bff73 (tag: V3) HEAD@{5}: rebase -i (start): checkout HEAD~2
260b361 HEAD@{6}: reset: moving to ORIG_HEAD
be43d59 HEAD@{7}: rebase -i (finish): returning to refs/heads/master
be43d59 HEAD@{8}: rebase -i (squash): Updated readme.txt & adding back c d e
7ac6472 HEAD@{9}: rebase -i (reword): Updated readme.txt & adding back c d e

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/git (master)
$ git reset --hard "HEAD@{3}"
HEAD is now at 260b361 Deleting a c d e text files

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/git (master)
$ git lol -n 10
* 260b361 - (HEAD -> master) Deleting a c d e text files (1 year, 10 months ago) <Sushanth Bobby Lloyds>
* 25bde47 - (tag: V4, stash/start) Updated readme.txt & adding back c d e (1 year, 10 months ago) <Sushanth Bobby Lloyds>
*   d4bff73 - (tag: V3) Merge reset/finished into master (1 year, 10 months ago) <Sushanth Bobby Lloyds>
|\
| * 1ab856b - (reset/finished) Adding a.txt (1 year, 10 months ago) <Sushanth Bobby Lloyds>
|/
* b77ca73 - (reset/start) Updated readme.txt for RESET (1 year, 10 months ago) <Sushanth Bobby Lloyds>
*   85e7f70 - (tag: V2) Merge undo/finished into master (1 year, 10 months ago) <Sushanth Bobby Lloyds>
|\
| * db8427c - (undo/finished) Revert "Updated OneTwoThreeFour.txt line 2 from Two to number 2" (1 year, 10 months ago) <Sushanth Bobby Lloyds>
| * 178a3ca - Updated OneTwoThreeFour.txt line 4 from Four to number 4 (1 year, 10 months ago) <Sushanth Bobby Lloyds>
| * 6405ecb - Updated OneTwoThreeFour.txt line 2 from Two to number 2 (1 year, 10 months ago) <Sushanth Bobby Lloyds>
| * 3ebe1db - Adding OneTwoThreeFour.txt (1 year, 10 months ago) <Sushanth Bobby Lloyds>
```

Instead of `git reflog`, `git reset --hard "HEAD@{n}"` and all the detective stuff above, you can just enter this command as well `git reset --hard ORIG_HEAD`.

Any other issues with rebase, you can do 
* If conflict, fix the conflict, `git add` then 'git rebase --continue`
* Any issues that couldn't be resolved `git rebase --abort`
* Any other issues you can do `git reset --hard`

##### Merge Vs. Rebase
This is a big topic has its own pro and con and decision needs to be based on collaborators and team, 
* `git merge` is run, an extra merge commit is created, so there might be too many merge commits. 
* `git rebase` is risky insense, it rewrites history
* `git rebase` can be used to squash commits locally

#### # Handling Conflicts
Conflicts occur when there are changes to the same position/line of the file at different commits or branches
Usually conflicts occur during
* Reverting changes
* Merging branches
* Rebasing 

**Test Setup**    

```
rm -rf .git *.*
git init

echo "Big bang" > universe.txt
git add .
git commit -m "Initial Commit"
echo "Sun"     >> universe.txt && git commit -am "Added Sun"
echo "Mercury" >> universe.txt && git commit -am "Added mercury"
echo "Venus"   >> universe.txt && git commit -am "Added venus"
echo "Earth"   >> universe.txt && git commit -am "Added earth"
echo "Mars"    >> universe.txt && git commit -am "Added mars"
echo "Jupiter" >> universe.txt && git commit -am "Added jupiter"
echo "Saturn"  >> universe.txt && git commit -am "Added saturn"
echo "Uranus"  >> universe.txt && git commit -am "Added uranus"
echo "Neptune" >> universe.txt && git commit -am "Added neptune"
```

Content of file and commits
```sh {21}
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ cat universe.txt
Big bang
Sun
Mercury
Venus
Earth
Mars
Jupiter
Saturn
Uranus
Neptune

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git lol
* bc3b214 - (HEAD -> master) Added neptune (9 seconds ago) <Sushanth Bobby Lloyds>
* 1bc7ec8 - Added uranus (11 seconds ago) <Sushanth Bobby Lloyds>
* 1cb6a2c - Added saturn (11 seconds ago) <Sushanth Bobby Lloyds>
* 479fc63 - Added jupiter (11 seconds ago) <Sushanth Bobby Lloyds>
* 762ee6e - Added mars (11 seconds ago) <Sushanth Bobby Lloyds>
* ff9623a - Added earth (12 seconds ago) <Sushanth Bobby Lloyds>
* 8dd1b51 - Added venus (12 seconds ago) <Sushanth Bobby Lloyds>
* 4790be6 - Added mercury (3 minutes ago) <Sushanth Bobby Lloyds>
* 56f3e34 - Added Sun (3 minutes ago) <Sushanth Bobby Lloyds>
* e1d1d72 - Initial Commit (4 minutes ago) <Sushanth Bobby Lloyds>
```

##### Conflicts during reverts

As part of test, i am going to remove commit related to Earth 
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git revert ff9623a
error: could not revert ff9623a... Added earth
hint: after resolving the conflicts, mark the corrected paths
hint: with 'git add <paths>' or 'git rm <paths>'
hint: and commit the result with 'git commit'

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master|REVERTING)
$ cat universe.txt
Big bang
Sun
Mercury
Venus
 <<<<<<< HEAD
Earth
Mars
Jupiter
Saturn
Uranus
Neptune
=======
 >>>>>>> parent of ff9623a... Added earth
```

Git adds below markers(seven <,> & = symbols) when a conflict is found and its the developers responsibility to remove the markers after manually reviewing the program 
* `<<<<<<< HEAD`
  - All the content between HEAD and DIVIDER, exists in the current branch master which the HEAD ref is pointing to.
* `=======`
* `>>>>>>> parent of ff9623a... Added earth`

Manually markers and Earth needs to be removed. 
```sh {5,29,44,50}
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master|REVERTING)
$ git status
On branch master
You are currently reverting commit ff9623a.
  (fix conflicts and run "git revert --continue")
  (use "git revert --abort" to cancel the revert operation)

Unmerged paths:
  (use "git reset HEAD <file>..." to unstage)
  (use "git add <file>..." to mark resolution)

        both modified:   universe.txt

no changes added to commit (use "git add" and/or "git commit -a")

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master|REVERTING)
$ cat universe.txt
Big bang
Sun
Mercury
Venus
Mars
Jupiter
Saturn
Uranus
Neptune

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master|REVERTING)
$ git add .

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master|REVERTING)
$ git status
On branch master
You are currently reverting commit ff9623a.
  (all conflicts fixed: run "git revert --continue")
  (use "git revert --abort" to cancel the revert operation)

Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        modified:   universe.txt

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master|REVERTING)
$ git revert --continue
[master 6e6cfa5] Revert "Added earth"
 1 file changed, 1 deletion(-)

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git lol
* 6e6cfa5 - (HEAD -> master) Revert "Added earth" (13 seconds ago) <Sushanth Bobby Lloyds>
* bc3b214 - Added neptune (42 minutes ago) <Sushanth Bobby Lloyds>
* 1bc7ec8 - Added uranus (42 minutes ago) <Sushanth Bobby Lloyds>
* 1cb6a2c - Added saturn (42 minutes ago) <Sushanth Bobby Lloyds>
* 479fc63 - Added jupiter (42 minutes ago) <Sushanth Bobby Lloyds>
* 762ee6e - Added mars (42 minutes ago) <Sushanth Bobby Lloyds>
* ff9623a - Added earth (42 minutes ago) <Sushanth Bobby Lloyds>
* 8dd1b51 - Added venus (42 minutes ago) <Sushanth Bobby Lloyds>
* 4790be6 - Added mercury (44 minutes ago) <Sushanth Bobby Lloyds>
* 56f3e34 - Added Sun (44 minutes ago) <Sushanth Bobby Lloyds>
* e1d1d72 - Initial Commit (45 minutes ago) <Sushanth Bobby Lloyds>
```
As soon as you hit `git revert --continue`, vim editor pops up for comment message which is auto-filled, you can go with it. Save, Exit and you have completed the reverting process. 

Note : Read `git status` messages, they will give you options and commands on how to proceed. Above, it gave two options
* `(all conflicts fixed: run "git revert --continue")`
* `(use "git revert --abort" to cancel the revert operation)`

**Conflicts during merging branches**

Scenario : Developer wants to write a calculator program in rexx and basically wants two features add() and sub() initially and quickly writes the below main logic and each feature is added in separate branch. 
```
# calc.txt contains below code
/*** rexx ***/
a = 10
b = 5
c = add(a, b)
d = sub(a, b)
say 'Addition    : 'c
say 'Subractiion : 'd
exit
```

Creating branches
```sh {4,9}
git init
git add .
git commit -m 'Initial commit'
git checkout -b add
# Add add()
git add . && git commit -m "Added add feature"

git checkout master
git checkout -b sub
# Add sub()
git add . && git commit -m "Added sub feature"
```

Add feature
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git checkout add
Switched to branch 'add'

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (add)
$ cat calc.txt
/*** rexx ***/
a = 10
b = 5
c = add(a, b)
d = sub(a, b)
say 'Addition    : 'c
say 'Subractiion : 'd
exit

add:procedure
get argument a
get argument b
say 'Adding a + b'
return 0
```

Sub feature 
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (add)
$ git checkout sub
Switched to branch 'sub'

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (sub)
$ cat calc.txt
/*** rexx ***/
a = 10
b = 5
c = add(a, b)
d = sub(a, b)
say 'Addition    : 'c
say 'Subractiion : 'd
exit

sub:procedure
get argument a
get argument b
say ‘Subracting a - b'
return 0
```

Merging add and sub features 
```sh {2,6,}
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (sub)
$ git checkout master
Switched to branch 'master'

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git merge add sub
Fast-forwarding to: add
Trying simple merge with sub
Simple merge did not work, trying automatic merge.
Auto-merging calc.txt
ERROR: content conflict in calc.txt
fatal: merge program failed
Automatic merge failed; fix conflicts and then commit the result.

$ cat calc.txt
/*** rexx ***/
a = 10
b = 5
c = add(a, b)
d = sub(a, b)
say 'Addition    : 'c
say 'Subractiion : 'd
exit

<<<<<<< .merge_file_a14136
add:procedure
get argument a
get argument b
say 'Adding a + b'
=======
sub:procedure
get argument a
get argument b
say ‘Subracting a - b'
>>>>>>> .merge_file_a13400
return 0
```

Removed the markers and proceeded to stage and commit 
```sh {9,16,21,}
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master|MERGING)
$ git status
On branch master
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)

        both modified:   calc.txt

no changes added to commit (use "git add" and/or "git commit -a")

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master|MERGING)
$ git add .
warning: LF will be replaced by CRLF in calc.txt.
The file will have its original line endings in your working directory.

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master|MERGING)
$ git commit -m 'Added both add and sub'
[master c35ab3e] Added both add and sub

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git lol
*   c35ab3e - (HEAD -> master) Added both add and sub (32 seconds ago) <Sushanth Bobby Lloyds>
|\
| * 447bd6a - (sub) Added sub feature (9 minutes ago) <Sushanth Bobby Lloyds>
* | 8671031 - (add) Added add feature (11 minutes ago) <Sushanth Bobby Lloyds>
|/
* 216acda - Initial commit (13 minutes ago) <Sushanth Bobby Lloyds>

# Deleted the branches as they are no longer required. 
git branch -D add
git branch -D sub
```

**More changes & conflicts**

Adding proper code to add function
```
git checkout -b add

# add function in the current code is replaced with below
add:procedure
a = arg(1)
b = arg(2)
say 'Adding a + b'
return a + b

git add .
git commit -m 'Updated add()'

git checkout master
```

Adding proper code to add function
```
git checkout -b sub

# sub function in the current code is replaced with below
sub:procedure
a = arg(1)
b = arg(2)
say 'Subracting a - b'
return a - b

git add .
git commit -m 'Updated add()'

git checkout master
```

Merging calc.txt with master 
```sh {2,9}
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git merge add sub
Fast-forwarding to: add
Trying simple merge with sub
Simple merge did not work, trying automatic merge.
Auto-merging calc.txt
warning: LF will be replaced by CRLF in calc.txt.
The file will have its original line endings in your working directory.
Merge made by the 'octopus' strategy.
 calc.txt | 14 +++++++-------
 1 file changed, 7 insertions(+), 7 deletions(-)

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git status
On branch master
nothing to commit, working tree clean
```

No conflicts this time as each of the developers updated different part of the code, different lines. Additionally if you notice here we have been merging two branches to master in a single command and strategy we are using in ‘octopus'

> “This resolves cases with more than two heads, but refuses to do a complex merge that needs manual resolution. It is primarily meant to be used for bundling topic branch heads together. This is the default merge strategy when pulling or merging more than one branch. “

##### git switch
This is experimental, its sort of similar to `git checkout <branch-name>` as it does switch to a specified branch. The working tree and the index are updated to match the branch. All new commits will be added to the tip of this branch.

**Most common operations are** 

* `git switch feature-v1` : Switching to feature-v1 branch 
* `git switch -c feature-v1` : (caps-off)Creating a new branch 
* `git switch -C feature-v1` : (caps-on)If a branch already exists, it will reset the start point. 
* `git switch -` : Switches to last branch 
* `git switch -m feature-v1` : Does a 3-way merge


##### What else 
**Creating a branch from old commit**    

There are multiple ways to do like 
1. Using checkout : `git checkout -b feature-pre-v1 a9c146a09505837ec03b`

2. Using branch but without checking out `git branch feature-pre-v1 a9c146a09505837ec03b`

3. Via detached HEAD 
  ```
  git checkout a9c146a09505837ec03b
  git branch feature-pre-v1
  # or
  git checkout -b feature-pre-v1
  ```

* * *

#### # Things to remember
* Don't add large files to git, even if you `git rm` or `git reset` they will be in there dangling. Its not easy to find them.
* Don't use master/main branch for development purposes, they should have only production ready, releasable code. 
* Destructive commands in git 
  ```
  git checkout HEAD -- fn.ext
  git checkout -- .
  git reset --hard
  git clean -f 
  ```


#### # Next steps 
* **[Internals](48-git-theory-5)** : Git Internals
* **[Collaboration](49-git-theory-6)** : Git remote repository
* **[Git Everyday](50-git-theory-7)** : Git flowchart, shortcuts and references
* **[Origin](44-git-theory-1)** : How it all began. What is git ? and Terminologies used in this series. 
* **[Basics](45-git-theory-2)** : config, init, add, rm, .gitignore, commit, log, blame, diff, tag, describe, show and stash
* **[Undos](46-git-theory-3)** : checkout, reset, revert and restore
