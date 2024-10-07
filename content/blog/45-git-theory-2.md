---
title: Git Theory - 2 - Basics
date: 2020-10-04
description: This part of Git series covers the basics like config, init, add, rm, .gitignore, commit, log, blame, diff, tag, describe, show and stash
tags:
  - notes
  - git
slug: "/45-git-theory-2"
---

In basics, we will be covering config, init, add, rm, .gitignore, commit, log, blame, diff, tag, describe, show and stash 

This picture, sort of gives an overview, where each of the commands we will be covering, fit in the git world. 

![git basics](assets/45-git2-basics.png)  

#### # Basic commands

  | Commands   | Description                               |
  | :--------- | :---------------------------------------- |
  | git help | Open local documentation on specific topic |
  | git config | Setting up configuration parameters, metadata that will be used during object creation |
  | git init   | Initializes the repository |
  | git add    | Adds file to the staging area |
  | git rm --cached | Unstage & Untracks the file |
  | git rm     | Delete file from working directory & stages the deletion |
  | git mv    | Rename a file eg:- `git mv Index.txt Index.html` |
  | .gitignore | Files/Folders mentioned in this file will be ignored |
  | git status | View status of files in working directory & staging |
  | git commit | Takes snapshot of the staging area |
  | git log    | Show commits made in the repository in reverse chronological order. (ie., latest at top ) |
  | git blame  | Shows who was the last person to change code in a program |
  | git diff   | Shows difference in files in working directory and staged |
  | git diff --cached | Shows difference in files in staged and repository |
  | git ls-files | Show information about files in the index and the working tree. Eg: git ls-files --stage | 
  | git tag    | It refers a commit point and gives it a human readable name |
  | git describe | Used with tags, gives an object, a human readable name based off of the nearest annotated tag | 


#### # git help 

`git help -a` command shows all available git commands which you enter locally in your system. 

* `git help everyday` : Opens your web browser having useful minimum set of commands for Everyday Git
* Example : `git help add`, opens your web browser with page related to `git add`. 

#### # git config

  * There are 3 types of configuration, below shows the command and respective location where these settings are stored. 

    | Commands   | File locations                               |
    | :--------- | :---------------------------------------- |
    | git config --local --list | cat .git/config |
    | git config --global --list | cat ~/.gitconfig |
    | git config --system --list | /etc/gitconfig |

  * To view the all the config settings including alias use `git config --list`

  * Git provides ability to setup name and email different for local(`--local`) and global(`--global`). 
    ```sh title=local 
    git config --local user.name "sushanth"
    git config --local user.email "bobby.dreamer@gmail.com"
    ```  

    ```sh title=global 
    git config --global user.name "sushanth"
    git config --global user.email "bobby.dreamer@gmail.com"
    ```  

  * Use --unset option to remove a setting     
    `git config --unset --global user.email`

  * Changing default editors ( default is vim )
    ```sh 
    git config --global core.editor ~/bin/vimgit
    git config --global core.editor "nano"
    ```


#### # git init

  `git init` command will initialize current folder as a git repository. Basically it will create a new hidden folder called `.git` which will contain all the git objects. This command also creates a default branch called `master` (in future it could be called as `main`). Another flavor of the command is `git init folder-name` where it will create a new folder in initialize git in it. 


#### # git add

  ![git add](assets/45-git4.png)  

  In order to start tracking file changes, the file needs to be added to git. It can be done by executing command `git add` and when its added you can say the file is staged and tracked. This phase is also known as *'adding files to INDEX'*. Next phase that comes after `git add` is `git commit`, here all the staged files are committed(saved), they will be part of git repository history. 


  Below are multiple ways a file can be added to git

  | Commands   | Description                               |
  | :--------- | :---------------------------------------- |
  | git add fileA.txt | Add file fileA.txt to staging area |
  | git add fileB.txt fileC.txt | Adding multiple files to staging area |
  | git add . | Add all files & subdirectories with files to staging area |
  | git add f* | Add all files starting with f* to staging area |
  | git add -f . | Add all ignored files. Long command `--force` |

  ##### Adding binary files
  
  Git uses a heuristic to try to determine if a file is a binary or not. If you don't trust automatic detection and want to state is explicitly, you can do by creating a `.gitattributes` file like below.   

  ```sh:title=.gitattributes
  *.pbxproj binary
  *.pickle binary
  *.exe binary
  *.foo -crlf -diff -merge
  ```
  Now, Git won't try to convert or fix CRLF issues; nor will it try to compute or print a diff for changes in this file when you run git show or git diff on your project.

#### # git status 
This is one of the most used commands and it has few flavours. 

  1. `git status` : default (shows changes to be committed and Untracked)
    ```sh {3,8}
    $ git status
    On branch name2
    Changes to be committed:
      (use "git reset HEAD <file>..." to unstage)
    
            deleted:    b.txt
    
    Untracked files:
      (use "git add <file>..." to include in what will be committed)
    
            .gitignore
    ```

  2. `git status --ignored` : This will additionally show the ignored files as well. 
    ```sh {3,8,13}
    $ git status --ignored
    On branch name2
    Changes to be committed:
      (use "git reset HEAD <file>..." to unstage)
    
            deleted:    b.txt
    
    Untracked files:
      (use "git add <file>..." to include in what will be committed)
    
            .gitignore
    
    Ignored files:
      (use "git add -f <file>..." to include in what will be committed)
    
            b.txt
            c.txt
    ```
  
  3. `git status -s` : Short format of the output. Default is the long format. 
    ```sh
    $ git status -s --ignored
    A  d.txt
    ?? .gitignore
    ?? e.txt
    !! b.txt
    !! c.txt
    ```
    Meaning of symbols `A`:Added, `D`:Deleted, `??`:Untracked, `!!`:Ignored

#### # .gitignore
  * This is a file where we can mention what files/folders to be ignored while tracking changes. 
  * Possible files that we can ignore are
    - Confidential files
    - Password files
    - Account files
    - Any files which we don't want anyone to find
    - In .gitignore we can mention .gitignore file itself

  Whats are recommended to add it .gitignore 
  ```sh:title=.gitignore
  node_modules
  npm-debug.log*
  .DS_Store
  ```

Note : When you are building a big app, let just say enterprise level, dont ignore `node_modules` because all the npm modules are mostly open source written by a third-party who might not support later, so there is this possibility of packages getting disappeared later. For instance take [kik, left-pad, and npm](https://blog.npmjs.org/post/141577284765/kik-left-pad-and-npm).

##### Patterns
| pattern   | Description                               |
| :--------- | :---------------------------------------- |
| **/logs	| You can prepend a pattern with a double asterisk to match directories anywhere in the repository. |
| **/logs/debug.log | You can also use a double asterisk to match files based on their name and the name of their parent directory. |
| *.log | An asterisk is a wildcard that matches zero or more characters. |
| *.log         !important.log | Prepending an exclamation mark to a pattern negates it. If a file matches a pattern, but also matches a negating pattern defined later in the file, it will not be ignored. |
| /debug.log | Prepending a slash matches files only in the repository root. |
| debug.log | By default, patterns match files in any directory |
| debug?.log | A question mark matches exactly one character |
| debug[0-9].log | Square brackets can also be used to match a single character from a specified range. For alphabetic [a-z] |
| debug[!01].log | An exclamation mark can be used to match any character except one from the specified set. |
| logs | If you don't append a slash, the pattern will match both files and the contents of directories with that name. In the example matches on the left, both directories and files named logs are ignored |
| logs/ | Appending a slash indicates the pattern is a directory. The entire contents of any directory in the repository matching that name – including all of its files and subdirectories – will be ignored |
| logs/**/debug.log | A double asterisk matches zero or more directories. |
| logs/debug.log | Patterns specifying a file in a particular directory are relative to the repository root. (You can prepend a slash if you like, but it doesn't do anything special.) |


##### Check ignored files

  There are multiple ways to check to see if the files are ignored. 
  * `git check-ignore`
  * `git status -s --ignored`
    - Already covered in `git status` section above
  * `git ls-files --others --ignored --exclude-standard`
    - Outputs only the excluded files 
    - `--others` : Shows untracked files 
    - `--ignored` : Shows only ignored files 
    - `--exclude-standard` : Add the standard Git exclusions: `.git/info/exclude`, `.gitignore` in each directory, and the user's global exclusion file

  In the below scenario, there are 5 files at different stages(committed, staged, working directory and ignored). Review the command outputs. 
  ```sh
  $ ls -l
  total 5
  -rw-r--r-- 1 Sushanth 197121 4 Oct 16 22:19 a.txt   # Committed
  -rw-r--r-- 1 Sushanth 197121 2 Oct 18 15:12 b.txt   # Ignored 
  -rw-r--r-- 1 Sushanth 197121 2 Oct 18 15:12 c.txt   # Ignored 
  -rw-r--r-- 1 Sushanth 197121 2 Oct 18 16:16 d.txt   # Staged
  -rw-r--r-- 1 Sushanth 197121 2 Oct 18 16:17 e.txt   # Untracked

  $ cat .gitignore
  b.txt
  c.txt
  ```
  
  ##### git check-ignore 
  
  There are multiple flavours ( i prefer flavour 2 )
  ```sh {1,6,11}
  # Flavour 1 : Plain, just shows the ignored files
  $ git check-ignore *
  b.txt
  c.txt
  
  # Flavour 2 : Shows ignored files with the rule used to ignore it (-v:verbose)
  $ git check-ignore -v *
  .gitignore:1:b.txt      b.txt
  .gitignore:2:c.txt      c.txt
  
  # Flavour 3 : Shows matched & unmatched files  (-n:non-matching)
  $ git check-ignore -vn *
  ::      a.txt
  .gitignore:1:b.txt      b.txt
  .gitignore:2:c.txt      c.txt
  ::      d.txt
  ::      e.txt
  ```

* * * 

  ##### Scenario : I want to track a specific folder in `node_modules` but ignore the rest

  Below is the easiest way to ignore `node_modules` folder
  ```sh:title=.gitignore
  node_modules/
  ```
  
  In my case i want to track changes in folder `node_modules/@lekoarts/`. So as per [the gitignore documentation](https://git-scm.com/docs/gitignore), when negating. 
  > it is not possible to re-include a file if a parent directory of that file is excluded.
  
  In other words, no greedy matches, you cannot use `**`. Below you can see that `node_modules/@lekoarts` folder is getting ignored due to `node_modules/` mentioned in `.gitignore` file line number 36. 
  
  ```sh
  node_modules/
  
  # output
  > git check-ignore -vn node_modules/@lekoarts 
  .gitignore:36:node_modules/     node_modules/@lekoarts
  ```
  
  Below i have included `!node_modules/@lekoarts` with excalmation symbol, a negating pattern to un-ignore the file/folder. But `git check-ignore` shows same output. 
  ```sh {2}
  node_modules/
  !node_modules/@lekoarts
  
  # output
  > git check-ignore -vn node_modules/@lekoarts
  .gitignore:36:node_modules/     node_modules/@lekoarts
  ```
  
  When you introduce a `*` single-level wildcard. It works. Now it shows the line number 37 in `.gitignore` using negating pattern and using `git status` we can confirm that folder will be added as before when executing `git status`, `node_modules/` folder wouldn't appear. 
  
  ```sh {1-2,6}
  node_modules/*
  !node_modules/@lekoarts
  
  # output
  > git check-ignore -vn node_modules/@lekoarts
  .gitignore:37:!node_modules/@lekoarts   node_modules/@lekoarts
  ```

* * * 

#### # git rm    

This command will remove file from both the staging and the working directory.
  
  * Eg:- `git rm fileF2.txt`
  
**Option flags** available are `-f`:force, `-n`:dry run, `-r`:recursive    
  
  * Eg:- `git rm -rf fileF1.txt` will recursively & forcibly delete file from Working directory & Repository
  
  **Note** : If a file is deleted using `git rm` and that change is committed. To recover the file, use `git reflog` to find a ref that is before the `git rm` execution.


##### Untracking a staged file

![git rm --cached](assets/45-git5.png)  

**git rm --cached fileF1.txt**
  * `--cached` is used to unstage and remove paths from the index. 
  * In simple words the command unstages & untracks files, but it does not delete the file.     

Scenario where this command could be useful is,    

  * Scenario 1 : Unstaging everything `git rm -rf --cached .`

  * Scenario 2 : Suppose you create .gitignore after files have been staged or committed. Now to unstage and those specific files you can use the below method. 
    ```
    git rm -rf --cached `git ls-files -i -X .gitignore`
    ```
    Note 1 : in the above command, its not single quotation but tilde symbol. 
    * `-rf` : recursively and forcefully
    * `git ls-files` : Show information about files in the index and the working tree
      - `-i` : Show only ignored files in the output
      - `-X` : Read exclude patterns from (file); 1 per line

    Note 2 : You have a problem, if that was a confidential file, even so it was removed by above method. Since you added it, it will be somewhere inside as a git object. You have to hunt that down and delete it. 


#### # git commit 

![git commit](assets/45-git6.png)  

* Only staged files can be committed. 
* Generates a unique SHA-1 hash (40 characters hex string) for every commit.
* Opens VIM by default – Press `I` and start typing the comments and then `[ESC] :wq` to save and exit
* Inline commit message can be given using below command 
  + `git commit -m "October 2020 - Git Theory post"`

![git commit internals](assets/45-git7.png)  

* When you commit your change to git, it takes a snapshot of the repo and creates a commit object. Each circle in the above picture is a commit object. 
* The very first commit object has no 'parents' and after that all commit objects has parents(one or more). 
* The usual workflow is, you start making changes to the code and commit as neccessary and proceed to do the same. Parent of the latest commit is the earlier commit. 

##### Format of commit messages    
Some standard procedures one need to set when writing commit messages. It should easily help one understand about that commit. 

* Format = `<ACTION> : <WHEN> : Description(50 chars max)`
  + Example = `Add : October 2020 : Added a new post`

##### git commit examples
* Committing specific files     
  - `git commit -m "Add : August 2020 : Adding second.txt" second.txt`

* Staging & Committing tracked files in a single command     
  - `git commit -a -m "Update : Dec 2019 : Emergency commits"`

* Amending commit     
  - If you want to change the commit message. `git commit --amend -m "New commit message"`
  - If you had missed adding a file to the recent commit, below command can be used. 
    ```
    git add forgottenfile.txt
    git commit --amend --no-edit
    ```
    + `--no-edit` means *Comment does not change*

* Dummy commit     
  - `git commit --allow-empty -m ‘Initial branch empty commit'`



#### # git log
Shows the commit logs ( latest at top ) and each commit contains following information    
* SHA-1 hash, Author name, Timestamp, Comments, Which branch HEAD is pointing to

##### Some common git log commands    

  * `git log –p`
    - Show changes in each commit (output could be big)
  * `git log --all --decorate --oneline --graph`  
    - This is a lot less information when compared to `git log` but provides all basic info. 
  * `git log --graph --format=%s`
    - This show graph with only commit messages(no SHA1-hash)
  * `git log -n 3`
    - Show last 3 commits
  * `git log --since=5.days --author=Sushanth`
    - Show commits done by me in the last 5 days 
  * `git lol d9e798a..804e1db`
    - Shows all commits infomation between two hashes (uses alias we will see it later)
    - Instead of hash you can also specify tags like `git log v1.0..v2.0`
  * `git lol --grep="Add"`
    - Filtering based on the commit message(uses alias we will see it later)
  * `git lol -- f7.txt`
    - Shows the history of file(uses alias we will see it later)
  * `git log --full-history -1 -- f1.txt`
    - Show the last commit that had the file. `-1` to show just last commit, can be increased. 
  

It recommended to use alias to shorten long git log commands 
* `git graph`
  - `git config --global alias.graph "log --all --decorate --oneline --graph"`
* `git lofi`
  - `git log --oneline --name-status --graph`
  - `git config --global alias.lofi "log --oneline --name-status --graph"`
* `git lol`
  - Prettify log output 
  - `git log --graph --pretty=format:'%C(yellow)%h%Creset -%C(cyan)%d%Creset %s %Cgreen(%cr) %C(magenta)<%an>%Creset' --date=relative`
  - `git config --global alias.lol "log --graph --pretty=format:'%C(yellow)%h%Creset -%C(cyan)%d%Creset %s %Cgreen(%cr) %C(magenta)<%an>%Creset' --date=relative"`

**Referencing commits from HEAD using ~ and ^**
![Referencing commits](assets/45-git38.png)  

#### # git shortlog
This command summarizes the git log output. It groups all commits by author and includes the first line of the commit message. That `(23)` is the total commit, i had done in the test.

```sh {2,9}
$ git shortlog
Sushanth Bobby Lloyds (23):
      initial commit
      Adding F3.txt
      Updated f1.txt
...

# -s:Suppresses the commit message and provides count, -n:sorts output based on commit count
$ git shortlog -sn
    23  Sushanth Bobby Lloyds
```

#### # git blame 
As the name tells, it will tell you who changed the file last. Below i am just trying to see who added the file g.txt
```sh {1,16}
$ git ls-files -s
100644 7a8e17364db020c34670f00f6e7473a6d457cf5b 0       a.txt
100644 00479302f1a096d1fa5fd53abb2bcf79908b1d16 0       b.txt
100644 6ad93728a01d93effb3b6a2c8b12bc8ea999bc57 0       c.txt
100644 d102f3fd7e19939ec42cf015ade11a5f96aaf997 0       d.txt
100644 dfd49bc24fa0ae3c4ec1d121e45fc55078394f63 0       e.txt
100644 f1d86f4b27f1990368072562534c43e2b981c4db 0       f.txt
100644 a2e4e883b5423c8d35301828fc96bb2d480f790c 0       f1.txt
100644 0ac8e950b1dfcfba626ad613bf935b678892239b 0       f2.txt
100644 7b855c80b44dcdb1bec0f75f8721da8b93279884 0       f3.txt
100644 941901aa8eae68b75cf6265c27edfa55ad501766 0       f4.txt
100644 b33f2940f9f546b1bec4aa03a4bc056f22c7af00 0       f6.txt
100644 e9678181fd88b69443cb24ebe9f5e552c6a986f3 0       f7.txt
100644 d028b559cc081dd915679d4fc395be259870ce0f 0       g.txt

$ git blame g.txt
83ce55e7 (Sushanth Bobby Lloyds 2018-12-04 11:11:18 +0530 1) initial g
```


#### # git diff
![git diff](assets/45-git8.png)  
Above commit objects are `C1`:Contains(f1.txt, f2.txt), `C2`:f3.txt, `C3`:Updated f1.txt

* `git diff` compares files in working directory & staging area/INDEX
* `git diff –cached` compares files in staging area & last commit. Also `--staged` is a synonym for cached.

**Setup**    

1. Created two files F1.txt & F2.txt and performed first commit. 
2. Create another file F3.txt and performed second commit. 
3. Updated F1.txt and staged it
4. Again updated F1.txt and changes are in working directory. 

```sh {4,7,9-10}
echo "F1" >> F1.txt
echo "F2" >> F2.txt
git add . 
git commit -m "Add : F1.txt, F2.txt"
echo "F3" >> F3.txt
git add . 
git commit -m "Add : F3.txt"
echo "F1 : Feature 1" >> F1.txt
git add .
echo "F1 : Feature 1 - New Changes" >> F1.txt

$ git status
On branch master
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        modified:   F1.txt

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   F1.txt
```

* git diff - Shows difference between working directory and stage. Here it shows what added in working directory. 
```sh {1,11}
$ git diff F1.txt
warning: LF will be replaced by CRLF in F1.txt.
The file will have its original line endings in your working directory.
diff --git a/F1.txt b/F1.txt
index 6b30d17..c08ef58 100644
--- a/F1.txt
+++ b/F1.txt
@@ -1,2 +1,3 @@
 F1
 F1 : Feature 1
+F1 : Feature 1 - New Changes
```

* git diff --cached - Shows difference between stage and last commit point. Here it shows what added in stage. 
```sh {1,8}
$ git diff --cached F1.txt
diff --git a/F1.txt b/F1.txt
index 66d43ba..6b30d17 100644
--- a/F1.txt
+++ b/F1.txt
@@ -1 +1,2 @@
 F1
+F1 : Feature 1
```

Committing changes that were staged 
```
$ git commit -m 'Update : F1.txt : Feature'
[master 1c2875b] Update : F1.txt : Feature
 1 file changed, 1 insertion(+)
```

* Finding difference between two commit points

`git diff <old-hash> <new-hash>`
  * Shows you all the differences between two commit points
  * Note : In the below picture, observe the changes due to interchanging of hashes. Remember to properly order. 

![git diff](assets/45-git8a.png)  



If you think, its hard to remember those hashes, then you need to tag them, thats the next subject `git tags`


#### # git tag
Tag is used to mark a particular commit point as a milestone, a new stable release or a new version.

**Why use tag ?**    
  * Its easy to remember a version number than a SHA1 hash in git.

There are two types of tags
  * Lightweight tag
  * Annotated tag

##### git tag – Lightweight tag    

* This is a simple tag which just stores hash of the commit they refer to. 
* `git tag <tagname>`
  - Example : `git tag v1.0`
    + This will refer to the latest commit

  - Example : `git tag v1.0 <hash>`
    + This will refer to commit you specify

![git tag - lightweight](assets/45-git8b.png)  

##### git tag – Annotated tag 

* This type of tag stores extra meta data information like 
  - Tagger
  - when the tag was created
  - message

* `git tag –a <tagname>`
  - Example : `git tag –a v2.0`
    + This will refer to the latest commit
    + Add -m to provide inline message 

![git tag - annotated](assets/45-git8c.png)  

##### git tag – describe 

* `git describe` is only applicable for “annotated tag”. 
* This attaches additional information to the tag based off the nearest annotated tag.
 
Continuing above example, made some changes to all the three files and performed a commit.     
```sh {3,15}
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/diff (master)
$ git commit -m "Updated all 3 files"
[master 3d4728e] Updated all 3 files
 3 files changed, 3 insertions(+), 2 deletions(-)

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/diff (master)
$ git lol
* 3d4728e - (HEAD -> master) Updated all 3 files (3 seconds ago) <Sushanth Bobby Lloyds>
* 1c2875b - (tag: v2.0) Update : F1.txt : Feature (24 hours ago) <Sushanth Bobby Lloyds>
* efd122b - Add : F3.txt (24 hours ago) <Sushanth Bobby Lloyds>
* a891bb1 - (tag: v1.0) Add : F1.txt, F2.txt (24 hours ago) <Sushanth Bobby Lloyds>

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/diff (master)
$ git describe
v2.0-1-g3d4728e
```

In the above example,
* V2.0 is the nearest annotated tag
* 1- number of commits made after tagging
* g – Git
* 3d4728e – Hash of the latest commit

##### git tag – other operations

  | Commands   | Description                               |
  | :--------- | :---------------------------------------- |
  | git show tagname | shows details of object |
  | git tag | Lists all tags |
  | git tag –n | List all tags with their messages (tag message or commit message if tag has no message) |  
  | git tag –l –n3 | Lists tags with messages (max 3 lines) |
  | git tag –d tagname | Delete a tag |
  | git tag –a –f tagname (commit-id) | To replace existing annotated tag |
  | git checkout tagname | To view files of that specific version (detached HEAD state) |
  | git push (location) tagname | A tag is just a reference to your local repository and it is not automatically pushed to the remote repository with the rest of the code. |
  | git push (location) --tags | Push all tags at once |
  | git tag tagname -m 'message' (commit-id) | create tags for a certain commit-id |


#### # git show

Shows details of objects like blobs, trees, tags and commits and output differs based on object types.     

* For commits it shows the log message and textual diff. It also presents the merge commit in a special format as produced by `git diff-tree --cc`.
* For tags, output is similar to commits but additionally it show tag details as well.
* For trees, it shows the names (equivalent to `git ls-tree with --name-only`).
* For plain blobs, it shows the plain contents.

Continuing with above **Tag example**, v1.0 is a light-weight tag and v2.0 is a annotated tag. Below, i can use `v1.0` instead of `a891bb1`, there wouldn't be any difference in the output. 

![git show - light-weight](assets/45-git8d.png)  

Showing annotated tag v2.0,    

![git show - annotated tag](assets/45-git8e.png)  

`git show v1.0^{tree}`    

  - Shows the tree pointed to by the tag v1.0

```sh {2,9}
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/diff (master)
$ git show v1.0^{tree}
tree v1.0^{tree}

F1.txt
F2.txt

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/diff (master)
$ git show v2.0^{tree}
tree v2.0^{tree}

F1.txt
F2.txt
F3.txt
```

##### Viewing content of file at different stage or commit

Syntax : git show [reference]:[file_path]    
* `[reference]` : can be a branch, tag, HEAD or commit ID

We are going test file f7.txt
```sh {1,5}
$ git lol -- f7.txt
* 25dc023 - (tag: v2.0) Revert "f7.txt Update 1" (1 year, 11 months ago) <Sushanth Bobby Lloyds>
* d9e798a - f7.txt Update 2 (1 year, 11 months ago) <Sushanth Bobby Lloyds>
* 2f161e1 - f7.txt Update 1 (1 year, 11 months ago) <Sushanth Bobby Lloyds>
* 431be32 - f7.txt Initial (1 year, 11 months ago) <Sushanth Bobby Lloyds>
```

When the file was added initially, it looked like this 
```sh {1}
$ git show 431be32:f7.txt
One
Two
Three
Four
``` 

currently it looks like this
```sh {1}
$ git show master:f7.txt
One
Two
Three
4
```

* `git show head:F1.txt` : Shows content of file from HEAD(latest commit)
* `git show :F1.txt` : Shows content of file from staging 


And you can make a copy of the file by doing `git show 431be32:f7.txt > old_f7.txt`


#### # git stash
* Used for temporarily saving half-works in a stack storage. 
* By default, `git stash` will stash
  + staged files : changes that have been added to your index
  + unstaged files : changes made to files that are currently tracked by Git
  + And add default comment which will be the latest commit comment.  
* And it will not stash files below files by default
  + untracked files
  + ignored files  

It takes the changes of TRACKED modified files in your working directory and staging area and saves it in a stack and later when you require them you can reapply. 

Following are the basic stash commands :

| commands   | Description                               |
| :--------- | :---------------------------------------- |
| git stash | Add changed content to stash |
| git stash list | List items in stash |
| git stash show -p stash@{n} | View the content of stash with difference |
| git stash apply | Applies the latest stash to the current working branch and copy will remain in the stash |
| git stash pop | Applies the latest stash to the current working branch and removes the stash entry |
| git stash clear | Clears the stash |
| git stash push –m "Added on dd/mm/yyyy" | Adding user-defined message to stash |


##### Listing stash

![git stash list](assets/45-git23.png)  

| Name   | Description                               |
| :--------- | :---------------------------------------- |
| stash@{0} | Its a stack, so latest one stashed will be at top having index as 0. In the pic you can see, top one has user provided comment. |
| stash@{1} | It's the stash that was created before stash@{0} and it has the default comment |


##### Applying stash    

  There are multiple ways to apply stash.
  * apply : Copy of the stash will remain in stash even after applying. 
  * pop : Stash copy will be removed after applying it. 

| Command   | Description                               |
| :--------- | :---------------------------------------- |
| git stash apply | Simplest. Applies the recent stash (i.e., stash@{0}). Unstages the old files if it was staged. |
| git stash apply stash@{1} | To apply specific stash |
| git stash apply 0 | Stack number can be also used directly. |
| git stash apply 0 --index | This will stage the files which were staged before |
| git stash pop | Simplest. Applies the recent stash |      
| git stash pop 1 | To apply specific stash |      


##### Clearing items from stash     

Two ways to remove items from stash i)drop ii)clear

| Command   | Description                               |
| :--------- | :---------------------------------------- |
| git stash drop 0 | Drops item stash@{0} from stash stack |      
| git stash clear | Empties the stash |      

##### Stashing untracked files    

  * Git will include untracked files in the stash being created.

  ```
  git stash push -u
  git stash push -u -m "This stash includes untracked files too"
  git stash --include-untracked
  ```

##### Stashing all files    
+ This will stash all files, including untracked and ignored files.
  * `git stash --all`
  

Below picture says it all. 

![Stash in simple ways](assets/45-git45.png)  


##### Creating a Branch from a Stash   

`git stash branch <new branchname>`

  + Creates a new branch 
  + Checks out the commit you were on when you stashed your work, reapplies your work there
  + drops the stash if it applies successfully
  + This command does this 3 things together 
    - `git checkout -b my-new-branch` + `git stash apply` + `git stash drop`
  + Used in scenarios when there is a conflict, when applying stash to working directory. 
  + This technique can be used move uncommitted changes from current branch to another branch as well. 
  ```
  $ git stash
  $ git checkout branch2
  $ git stash pop
  ```

##### Stash Test

**Test Plan**

1. Run all the commands in the setup and below should be the current state of the setup. 

    * First commit will contain file comitted-file.txt and it is again updated and staged. 
    * Creating 3 new files : a.txt(staged), b.txt(will remain in working directory), ignored-file.txt(ignored)
    * **Note** : For stash to work there needs to be atleast one commit.     
    
  ```
  mkdir stashtest
  cd stashtest
  git init
  echo "First Commit" > comitted-file.txt
  git add comitted-file.txt
  git commit -m "Initial Commit"
  echo "Staging file" >> comitted-file.txt
  git add comitted-file.txt
  
  echo "This is to be staged" > a.txt
  echo "This should be in working directory" > b.txt
  
  echo "This file is ignored" > ignored-file.txt
  echo "ignored-file.txt" > .gitignore
  echo ".gitignore" >> .gitignore
  
  git add a.txt
  ```

2. `git stash` only stashes files comitted-file.txt and a.txt. It doesnt stash b.txt as it is not tracked.

3. `git stash show` shows files in the latest stash. If there were multiple stashes `git stash show stash@{1}` shows file in the earlier stash. Note : index 0 points to the latest and 1 earlier than 0.

4. `git stash show -p` compares and shows differences. In our scenario, 

    * comitted-file.txt is already a commited and tracked file and we made some new changes and staged it again. 
    * a.txt is a new file and it was staged before executing stash command.

5. `git stash apply` or `git stash apply 0` applies the latest stash and following occurs,  

    * File a.txt is a new file which was staged before we did stash and it appears as staged after applying too. 
    * File comitted-file.txt we made some new changes and staged it before executing stash command and after apply command it came down to working directory(got unstaged). 
    * b.txt is untracked from the beginning(never stashed, so its unaffected). 

6. `git stash push -u -m "Stashing Tracked & Untracked files"` using this command we can stash tracked & untracked files.   

    * Tracked files are a.txt and comitted-file.txt
    * Untracked file is b.txt 

7. `git stash show` shows tracked files but there is no easy way to see or list untracked files.     

    * `git rev-list -g stash | git rev-list --stdin --max-parents=0 | xargs git show --stat` this command lets you see the untracked file.    

    * `git show stash@{0}^3` this command shows Untracked files. Basically untracked files are stored in the third parent of a stash commit. (This is not documented)    
    
8. `git stash push -a -m "Stashing all files including ignored"` using this command we can stash all (tracked, untracked & ignored)files. 

9. When you do `git stash show` there wouldn't be any output, if you have stashed only ignored files. 

    * `git show stash@{0}^3` shows ignored files as well. 
    
11. `git stash pop` or `git stash pop 0` will pop the latest stash to working directory and remove item from stash list
12. `git stash drop 1` using command item at index 1 is dropped. 
13. `git stash clear` clears the stash. 


##### Listing all files in folder    

After the executing all the git stash setup commands for test, this is the current state of git repository and directory. 
* In left image you can see, listing of all files
* In Right image you can see, git commit log, status and whats in .gitignore. 

![git stash picture 1](assets/45-gitstash1.png)  


##### On executing git stash   

Sequence of images are left to right, 
* On Left, you can see git stash execution and show. 
* On right in listing the files, you can see a.txt is missing as its stashed and comitted-file.txt what you see is the one already comitted. 

![git stash picture 2](assets/45-gitstash2.png)  

##### Comparing difference between files in stash and index    

* a.txt is a new file which is been staged so there is nothing to compare to
* On b.txt you can see the difference and new changes in stage in green. 

![git stash picture 3](assets/45-gitstash3.png)  

##### Applying stash   

After applying the stash you can notice, 

* On left, you can notice, new file a.txt is staged and comitted-file.txt which was staged before stashing got unstaged and b.txt is in same state as it was never tracked or added to git. 

* On right, you can see the files which had disappeared after stash are now available. 

![git stash picture 4](assets/45-gitstash4.png)  

##### Stashing untracked files   

* Untracked file here is b.txt and even after executing the command you can notice b.txt doesn't show up on stash show because gits like that. 

* On the right, you can see the command used to view the untracked file. 

![git stash picture 5](assets/45-gitstash5.png)   

Untracked files are stored in the third parent of a stash commit. 
![git stash picture 6](assets/45-gitstash6.png)   


##### Stashing all files   

Again as before all untracked & ignored files are stored in the third parent of a stash commit. 

![git stash picture 7](assets/45-gitstash7.png)   


##### Popping stashed files   

![git stash picture 8](assets/45-gitstash8.png)   


##### Stash - Under the hood

Git creates two commits(by default) when you run the command `git stash`. The special ref at `.git/refs/stash` points to your most recently created stash and previously created stashes are referenced by the stash ref's reflog. This is why you refer to stashes by stash@{n}: you're actually referring to the nth reflog entry for the stash ref. Since a stash is just a commit, you can inspect it with git log

In the output below HEAD is at `260b361`. 
```sh {3}
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/git (master)
$ git lol -5
* 260b361 - (HEAD -> master) Deleting a c d e text files (1 year, 10 months ago) <Sushanth Bobby Lloyds>
* 25bde47 - (tag: V4, stash/start) Updated readme.txt & adding back c d e (1 year, 10 months ago) <Sushanth Bobby Lloyds>
*   d4bff73 - (tag: V3) Merge reset/finished into master (1 year, 10 months ago) <Sushanth Bobby Lloyds>
|\
| * 1ab856b - (reset/finished) Adding a.txt (1 year, 10 months ago) <Sushanth Bobby Lloyds>
|/
* b77ca73 - (reset/start) Updated readme.txt for RESET (1 year, 10 months ago) <Sushanth Bobby Lloyds>
```

In the below output, still the HEAD is at `260b361` but there are two commits above it and have a look at the messages and it will reveal it was created stash. 
* `commit 458a388b0fcb94579cd68404c2edae718d37d509 (refs/stash)` :  WIP on master: 260b361 Deleting a c d e text files
* `commit 86055785f42ce7866f824146e1f441e5ece958e0` : index on master: 260b361 Deleting a c d e text files

```sh {16}
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/git (master)
$ git log --graph --all refs/stash -3
*   commit 458a388b0fcb94579cd68404c2edae718d37d509 (refs/stash)
|\  Merge: 260b361 8605578
| | Author: Sushanth Bobby Lloyds <bobby.dreamer@gmail.com>
| | Date:   Thu Oct 15 22:01:21 2020 +0530
| |
| |     WIP on master: 260b361 Deleting a c d e text files
| |
| * commit 86055785f42ce7866f824146e1f441e5ece958e0
|/  Author: Sushanth Bobby Lloyds <bobby.dreamer@gmail.com>
|   Date:   Thu Oct 15 22:01:21 2020 +0530
|
|       index on master: 260b361 Deleting a c d e text files
|
* commit 260b3619e6447bc1ef6f33746e879286490e8ba8 (HEAD -> master)
| Author: Sushanth Bobby Lloyds <bobby.dreamer@gmail.com>
| Date:   Mon Dec 10 22:56:29 2018 +0530
|
|     Deleting a c d e text files
```


Below is the simplest diagram for above approach,    

```
# H:HEAD, I:Index, W:Working directory                
       .----W
      /    /
-----H----I
```

If you include `git stash --all`, you will get 3 commits as in this case git will stash untracked files as well. 
```
# H:HEAD, I:Index, W:Working directory, U:Untracked files
       .----W----.
      /    /    /
-----H----I    U
```

When you run `git stash pop`, the changes from the commits are used to update your working copy and index, and the stash reflog is shuffled to remove the popped commit. Note that the popped commits aren't immediately deleted, but do become candidates for future garbage collection.

##### Tricks
* How to recover a dropped stash in Git?
```
# if you know the hash of the stash commit you dropped, you can apply it as a stash
git stash apply $stash_hash
# or create a separate branch for it
git branch recovered $stash_hash
```

* How do I discard unstaged changes in Git?
```
git stash save --keep-index --include-untracked
# then afterwards
git stash drop
```

* * * 

#### # Things to remember
* Don't add large files to git, even if you `git rm` or `git reset` they will be in there dangling. Its not easy to find them.
* Don't use master/main branch for development purposes, they should have only production ready, releasable code. 
* Destructive commands in git 
  ```
  git checkout -- .
  git reset --hard
  git clean -f 
  ```

#### # Next steps 
* **[Undos](46-git-theory-3)** : checkout, reset, revert and restore
* **[Branching](47-git-theory-4)** : Git Branching
* **[Internals](48-git-theory-5)** : Git Internals
* **[Collaboration](49-git-theory-6)** : Git remote repository
* **[Git Everyday](50-git-theory-7)** : Git flowchart, shortcuts and references
* **[Origin](44-git-theory-1)** : How it all began. What is git ? and Terminologies used in this series. 
