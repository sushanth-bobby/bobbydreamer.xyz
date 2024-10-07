---
title: Git Theory - 3 - revert, reset and restore
date: 2020-10-05
description: This part of Git series covers checkout, revert, reset and restore
tags:
  - notes
  - git
slug: "/46-git-theory-3"
---

Undos are the most important thing when you are using computers, its something, one cannot do in any other sector cheaply. `Ctrl+Z` and `Ctrl+Y` are something we do very often when working, its easier way to try something new and go back if something fails or doesnt work. Git has many ways to undo work and it all depends on different scenarios, below are some simple ways, i have tried and did it. 

Git commands to undo changes, 

* git checkout 
* git reset 
* git revert
* git restore
  - As this is still in *"THIS COMMAND IS EXPERIMENTAL. THE BEHAVIOR MAY CHANGE"*, i have not explored this. 

#### # Undo using git checkout

Git checkout has multiple functionalities, 
1. Updating the working directory with content from index/staging. 
2. It can move HEAD to another branch or a commit. If you checkout to a commit, you end up with detached HEAD. 

Here for undo, we will try the first option. This command doesn't make any changes to the history.

**Test Setup**

```
rm -rf .git *.*

git init
echo "Committed" > fileA.txt
git commit -a -m "Initial Commit"

echo "Stage this" >> fileA.txt
git add fileA.txt

echo "Changes in working directory" >> fileA.txt
```
![git checkout setup](assets/46-git-checkout1.png)  

`git checkout -- fileA.txt`    

  * Checkout has multiple functions by putting two hypens -- you are saying you are dealing with a file
  * Copy fileA.txt from staging area to working directory
  * `git checkout -- .`
    - dot stands for the current directory
    - overwrites all the files in the working directory. 

In the below picture, you can see the after checkout file in working directory has been replaced with file from index/staging area. 

![git checkout -- fileA.txt](assets/46-git-checkout2.png)

`git checkout HEAD -- fileA.txt`
  * Copies fileA.txt from that commit point in repo to staging area
  * Copies fileA.txt from staging area to working directory

In the below image, 
  * Blue : Shows the content of fileA.txt before the command was executed. 
  * Green : Show the content of fileA.txt after the command was execute. 

![git checkout HEAD -- fileA.txt](assets/46-git-checkout3.png)

Below options can be used to reset specific subfolders, 
* `git checkout -- path/`
* `git checkout HEAD -- path/`
* Go into the folder you want to reset and then do `git checkout -- .`

#### # Undo using git reset

Git reset is specifically about updating your branch, moving the tip in order to add or remove commits from the branch. This operation changes the commit history.

There are three variants with git reset 

* **Soft** : Doesn't touch the index/staging or work directory, but all the changes show up as changes to be committed with git status. If you re-commit, the resulting commit will have exactly the same content as where you were before you reset. So can be used to squash commits. 

* **Mixed** : Default. It resets the index/staging area but does not touch the working directory. Here any differences between the latest commit and the one you reset to will show up as local modifications in git status. 

* **Hard** : Index/Stage and working directory are updated with data what was in commit point it was reset to. 

![git reset](assets/46-git-undos.png)  

**Test Setup** 

```sh {1,6,11,17,22,25-27}
rm -rf .git *.*

git init
echo "Line 1" > fileA.txt 
git add .
git commit -m "Initial Commit"

echo "Line 2" >> fileA.txt
echo "Line 1" > fileB.txt
git add .
git commit -m "Second Commit"

echo "Line 3" >> fileA.txt
echo "Line 2" >> fileB.txt
echo "Line 1" > fileC.txt
git add .
git commit -a -m "Third Commit"

echo "Line 4" >> fileA.txt
echo "Line 3" >> fileB.txt
echo "Line 2" >> fileC.txt
git commit -a -m "Fourth Commit"

echo "Line 5 - Staged" > fileA.txt
git add fileA.txt
echo "Line 4 - Working directory" >> fileB.txt
echo "Line 5 - Working directory" >> fileC.txt
```

This is how it looks after running the setup
```sh 
Initial Commit    | fileA.txt
                  | ---------
                  | Line 1

Second Commit     | fileA.txt | fileB.txt 
                  | --------- | ---------
                  | Line 1    | Line 1
                  | Line 2    |

Third Commit      | fileA.txt | fileB.txt | fileC.txt
                  | --------- | --------- | ---------
                  | Line 1    | Line 1    | Line 1
                  | Line 2    | Line 2    |
                  | Line 3    |           |

Fourth Commit     | fileA.txt | fileB.txt | fileC.txt
                  | --------- | --------- | ---------
                  | Line 1    | Line 1    | Line 1
                  | Line 2    | Line 2    | Line 2
                  | Line 3    | Line 3    |
                  | Line 4    |           |

# Current state 
--------------------------------------------------------------------------
Working directory                                        | Staged
---------------------------------------------------------| -------
fileB.txt                  |  fileC.txt                  | fileA.txt
---------                  |  ----------                 | ---------
Line 1                     |  Line 1                     | Line 5 - Staged
Line 2                     |  Line 2                     |
Line 3                     |  Line 5 - Working directory |
Line 4 - Working directory |                             |
```

Same as show above

![git reset --soft](assets/46-git-reset-soft-1.png)

##### git reset --soft

This is how it looks after `git reset --soft HEAD~2`   
* `HEAD~2` means we are going back 2 commits and resetting to "Second Commit".
* By comparing the before and after reset, we can say that nothing has happened to the content in staging and working directory other than we have few "Changes to be committed". 

![git reset --soft](assets/46-git-reset-soft-2.png)

##### git reset --mixed

We run our setup scripts again and this is how it looked at second commit
```
Second Commit     | fileA.txt | fileB.txt 
                  | --------- | ---------
                  | Line 1    | Line 1
                  | Line 2    |
```

Now we run `git reset --mixed HEAD~2`,

* `HEAD~2` means we are going back 2 commits and resetting to "Second Commit". So we are going to be losing changes that was made in "Third Commit" and "Fourth Commit". 
* Index/Stage area data was reset with data what was in "Second Commit". 
* Working directory is not affected. 
* `fileC.txt` is not found in index/staging because it was added in "Third Commit" only. 


![git reset --mixed](assets/46-git-reset-mixed.png)

To proceed with the changes, you need to `git add .` and `git commit`.  

##### git reset --hard

We run our setup scripts again and then run `git reset --hard HEAD~2`.
1. fileC.txt is missing. 
2. Index/Stage and Working directory is reset with data that was in "Second Commit". 
3. "Third Commit" and "Fourth Commit" are lost but not entirely(By default Git gives you 30 days before it cleans up those orphan commits)

![git reset --hard](assets/46-git-reset-hard-1.png)

Recovering from `git reset --hard`
* Whenever tip of the branches are updated(created or cloned, checked-out, renamed, or any commits), its recorded and that mechanism is call **Reflog**. 
* Here we use information from *Reflog* and again reset --hard and go back to "Fourth Commit"

![git reset --hard](assets/46-git-reset-hard-2.png)

From the above output, we know, we lost data from 
* Index/Stage
* Working directory

Its recommended before doing any `git reset --hard`, do a `git stash -u`.

You also want to do bit of cleanup after after `git reset --hard` like below
```
git reset --hard

# '-f' is force, '-d' is remove directories.
git clean -fd
```

Main thing to remember is *"Removing specific commit is not possible to with git reset"* thats what *git revert* is for. 

#### # Git Revert 
`git revert` command is about making a new commit that reverts the changes made by other commits. This command adds new history to the project (it doesn't modify existing history).

Below i am going show some `git revert` by examples, simple ones. 

##### Test 1 : Plan 

1. Creating a file with "one", "two", "three" and "four" in each line + doing a commit
1. Updating two to 2 and adding a newfile.txt + doing a commit
1. Updating four to 4
1. Revert (2). What happens is   
    * New commit for revert
    * newfile.txt goes missing
    * Updates onetwothreefour.txt, replaces 2 with two

**Setup**
```sh {9,14,17}
rm -rf .git *.*

git init
echo "one" > onetwothreefour.txt
echo "two" >> onetwothreefour.txt
echo "three" >> onetwothreefour.txt
echo "four" >> onetwothreefour.txt
git add .
git commit -m "Adding file onetwothreefour.txt"

sed -i 's/two/2/' onetwothreefour.txt
touch newfile.txt
git add . 
git commit -m "Update two to 2 and added new file"

sed -i 's/four/4/' onetwothreefour.txt
git commit -a -m "Update four to 4"
```

![git revert HEAD~1](assets/46-git-revert-1.png)

With `git revert hash --no-edit` it doesn't start editor, basically you are accepting the default commit message for revert. 

##### Test 2 : Plan 

1. Creating and appending data to file
2. Updating all content in one file and adding a new file.
3. Make few updates and commit
4. Revert (2). What happens ?
    * 123.txt reverted successfully without conflicts
    * abc.txt has conflicts which has to be handled manually. 

**Setup**    
```sh {6,9,17,22,26,29}
rm -rf .git *.*

git init
echo "abc" > abc.txt
git add .
git commit -m "Added abc in abc.txt"

echo "def" >> abc.txt
git commit -a -m "Added def in abc.txt"

echo "ghi" >> abc.txt
dd if=abc.txt of=output.txt conv=ucase
rm abc.txt
mv output.txt abc.txt
echo "123" >> 123.txt
git add .
git commit -m "Added ghi, CAPS in abc.txt and 123 to 123.txt"

echo "JKL" >> abc.txt
echo "456" >> 123.txt
sed -i 's/123/onetwothree/' 123.txt
git commit -a -m "Added JKL in abc.txt and 456 to 123.txt"

echo "MNO" >> abc.txt
echo "789" >> 123.txt
git commit -a -m "Added MNO in abc.txt and 789 to 123.txt"

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test4
$ git lol
* e561d30 - (HEAD -> master) Added MNO in abc.txt and 789 to 123.txt (9 seconds ago) <Sushanth Bobby Lloyds>
* 81cf3dd - Added JKL in abc.txt and 456 to 123.txt (9 seconds ago) <Sushanth Bobby Lloyds>
* efada58 - Added ghi, CAPS in abc.txt and 123 to 123.txt (10 seconds ago) <Sushanth Bobby Lloyds>
* 7ace0d0 - Added def in abc.txt (11 seconds ago) <Sushanth Bobby Lloyds>
* 54f77e1 - Added abc in abc.txt (11 seconds ago) <Sushanth Bobby Lloyds>
```

Current state of both the files
```
$ cat abc.txt  | $ cat 123.txt
ABC            | onetwothree
DEF            | 456
GHI            | 789
JKL            |
MNO            |
```

After `git revert HEAD~2`. Below are the current state of the files. 
```
$ cat abc.txt                                                              | $ cat 123.txt
ABC                                                                        | 456
DEF                                                                        | 789
GHI                                                                        |
JKL                                                                        |
MNO                                                                        |
```

123.txt file 
 * There is no conflict. 
 * Changes that was made in HEAD~2 were reverted, insense in the reverted commit this file was created and added data "123" in the next commit "456" was appended and "123" was updated to "onetwothree".

abc.txt
  * We have a conflict
  * Between `<<<<<<< HEAD` and `=======` its what in the HEAD
  * Below `=======` it what before HEAD~2
  * We have to manually update the abc.txt file. 

After updating the file, it looks like this, 

```sh {12-13}
$ cat abc.txt
abc
def
GHI
JKL
MNO

# follow the git instructions
$ git status
On branch master
You are currently reverting commit efada58.
  (fix conflicts and run "git revert --continue")
  (use "git revert --abort" to cancel the revert operation)

Unmerged paths:
  (use "git reset HEAD <file>..." to unstage)
  (use "git add/rm <file>..." as appropriate to mark resolution)

        deleted by them: 123.txt
        both modified:   abc.txt

no changes added to commit (use "git add" and/or "git commit -a")
```

Since we have updated file abc.txt and removed all the git markers. We will have to add and revert continue

```sh {2,8}
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test4 (master|REVERTING)
$ git add .
warning: LF will be replaced by CRLF in 123.txt.
The file will have its original line endings in your working directory.

# Once you enter the below command, it opens the default editor, i am going with default message, so :wq
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test4 (master|REVERTING)
$ git revert --continue
[master ed6bbb7] Revert "Added ghi, CAPS in abc.txt and 123 to 123.txt"
 1 file changed, 3 insertions(+), 3 deletions(-)

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test4 (master)
```

##### Test 3 : Plan 
1. Concatenating string and committing changes. 
2. Reverting HEAD~2. What happens ? Conflicts. That has to be changed manually. 

**Setup**    
```sh {6,9,12,15,18,25}
rm -rf .git *.*

git init
echo -n "abc" > abc.txt
git add .
git commit -m "Added abc in abc.txt"

echo -n "def" >> abc.txt
git commit -a -m "Added def in abc.txt"

echo -n "GHI" >> abc.txt
git commit -a -m "Added ghi in abc.txt"

echo -n "JKL" >> abc.txt
git commit -a -m "Added JKL in abc.txt"

echo -n "MNO" >> abc.txt
git commit -a -m "Added MNO in abc.txt"

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test4 (master)
$ cat abc.txt
abcdefGHIJKLMNO

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test4 (master)
$ git lol
* 193f710 - (HEAD -> master) Added MNO in abc.txt (11 seconds ago) <Sushanth Bobby Lloyds>
* ba22751 - Added JKL in abc.txt (12 seconds ago) <Sushanth Bobby Lloyds>
* 3207be7 - Added ghi in abc.txt (12 seconds ago) <Sushanth Bobby Lloyds>
* 713ab79 - Added def in abc.txt (13 seconds ago) <Sushanth Bobby Lloyds>
* 1d3ed23 - Added abc in abc.txt (13 seconds ago) <Sushanth Bobby Lloyds>
```

Here we will try to revert commit "3207be7" which added string "ghi".
```sh {3-5}
$ git revert HEAD~2
error: could not revert 3207be7... Added ghi in abc.txt
hint: after resolving the conflicts, mark the corrected paths
hint: with 'git add <paths>' or 'git rm <paths>'
hint: and commit the result with 'git commit'

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test4 (master|REVERTING)
```

In the below image, three commands were executed. 

1. `cat abc.txt` : Shows with git conflict markers, first part of the marker shows whats in HEAD and second part shows what was before the reverted commit. 
2. `git show HEAD~2 -- abc.txt` : Shows change that was made in that commit. From the image, we can clearly say that `+abcdefGHI` was added. 
3. `git diff HEAD~2 HEAD` : Show difference between HEAD~2 to HEAD. 

![git revert](assets/46-git-revert-2.png)

Resolving conflicts after updating the file abc.txt
```sh {1,8,20,23}
$ cat abc.txt
abcdefJKLMNO

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test4 (master|REVERTING)
$ git status
On branch master
You are currently reverting commit 3207be7.
  (fix conflicts and run "git revert --continue")
  (use "git revert --abort" to cancel the revert operation)

Unmerged paths:
  (use "git reset HEAD <file>..." to unstage)
  (use "git add <file>..." to mark resolution)

        both modified:   abc.txt

no changes added to commit (use "git add" and/or "git commit -a")

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test4 (master|REVERTING)
$ git add .

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test4 (master|REVERTING)
$ git revert --continue
[master 8a42d6f] Revert "Added ghi in abc.txt"
 1 file changed, 1 insertion(+), 1 deletion(-)

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test4 (master)
```


#### # Git Restore 

git-restore is about restoring files in the working tree from either the index or another commit.

* `git restore abc.txt` by default will restore file abc.txt to match the version in the index.
* `git restore --staged abc.txt` can be used to restore a file in the index to match the version in HEAD.
* `git restore --source=HEAD --staged --worktree abc.txt`
  - restore both the index and the working tree
  - Equivalent to `git reset --hard`


Thats all the undo's i have for now.

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
* **[Branching](47-git-theory-4)** : Git Branching
* **[Internals](48-git-theory-5)** : Git Internals
* **[Collaboration](49-git-theory-6)** : Git remote repository
* **[Git Everyday](50-git-theory-7)** : Git flowchart, shortcuts and references
* **[Origin](44-git-theory-1)** : How it all began. What is git ? and Terminologies used in this series. 
* **[Basics](45-git-theory-2)** : config, init, add, rm, .gitignore, commit, log, blame, diff, tag, describe, show and stash
