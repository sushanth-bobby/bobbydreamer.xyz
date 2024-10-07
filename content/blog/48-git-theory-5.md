---
title: Git Theory - 5 - Internals
date: 2020-10-20
description: This part of Git series covers Architecture and Internals
tags:
  - notes
  - git
slug: "/48-git-theory-5"
---

#### # Git Architecture
Git maintains two primary data structures
* ##### Index
  - Stores information about current working directory and changes made to it

* ##### Object Database
  - Blobs (files)
    + Stored in .git/objects
    + All files are stored as blobs
    + It has only file's data does not contain any meta data information or even file name.
    + Blob name is just hash of data it contains
  - Trees 
    + Represents one-level directory information. It can also be pictured as a simple table.
    + Records object details like Hash ID, mode, type and filename. This can pictured as columns in the simple table.
    + Only types of objects, it can contain are blob or tree(sub-folders).
  - Commits
    + One object for every commit
    + Contains hash of parent, name of author, time of commit, and hash of the current tree
  - Tags
    + Human readable name to a commit

To efficiently use disk space and network bandwidth, git compresses the objects and stores in pack-files which are also placed in .git/objects directory

Simplistically just remember, 
* Git stores content of your files as blob objects
* You folders become tree object which contains blob objects(files) and other tree objects(sub folders)
* Commit is a type of object that always point to a tree. Every commit always creates two objects (a)tree (b)commit metadata. 
* Branches are pointers to commit metadata objects.

#### # SHA1 hash
* SHA1 values are 160-bits, 20-bytes. Represented in 40 Hex Characters.

* Git uses SHA1 hash of the content as file name. SHA1 hash is 40 characters, so first 2 characters as folder name and remaining 38 characters as filename in .git/object/ directory. 
  - Like for example `8ab686eafeb1f44702738c8b0f24f2567c36da6d` is the hash of the content. Then it will be stored as 
`.git/objects/8a/b686eafeb1f44702738c8b0f24f2567c36da6d`. 

* It is considered as globally unique because you can have 2160 or 148 possible SH1 hashes(i.e., 1 with 48 zeros after it) 

* Important characteristic of SHA1 hash computation is it always computes  the same hash for identical content, regardless of where the content is. In other words, the same file content in different directories and even on different machines yields the exact same SHA1 hash ID. Thus, the SHA1 hash ID of a file is a globally unique identifier.

* Any change to the file makes SHA1 hash change and thus creating new version of the file. 

* A collision is very rare but possible( if one hashed 280 random blobs )

* SHA1 hash can point to a blob, a commit or a tree.

#### # How git hashes content

```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test1 (master)
$ echo "Hello, World!" | git hash-object --stdin
8ab686eafeb1f44702738c8b0f24f2567c36da6d
```

##### Git hash-object 
* This command computes hash of the content and optionally can write it to the object database
* It is one of plumbing commands

##### Git has two types of commands
* Porcelain – User facing commands/functions
* Plumbing – Low level commands /functions

#### # Contents of .git directory

![Contents of .git directory](assets/48-git40.png)  


#### # Git Objects
Git is simple key-value data store meaning any content you add into git repo, you will in-turn get a unique key for it. Later that object/content can be retreived by using the key. 

Git consists of 4 types of object : 

* **blob** : Binary large object. In git terms all files containing data are called as blobs.
* **tree** : Trees are like folders which can contain more files or sub-folders. So in git terms, trees can contain more blobs or trees. Each entry in a tree object consists of SHA-1 hash of a blob or subtree and its mode, type, and filename. 
* **commit** : When you perform commit, the commit object stores details like tree, author, committer, commit-data and message. Tree object contains details of newly updated objects and objects that has'nt been changed. For example, if a file is updated and when the change is committed, git creates a new tree object containing links pointing to the newly updated file and other objects which hasn't changed. 
* **tag** : Tags just refers to a commit point. This is a much easier way than remembering a commit hash. It can be called as a bookmark or say a user-friendly commit name usually a version number. 


##### Initial commit 

![Git Objects – Initial Commit](assets/48-git41.png)  

##### Second commit 

![Git Objects – second Commit](assets/48-git42.png)  

Overall this will be the structure of git internal objects

![Git Objects](assets/48-git43.png)  

##### Objects, Hashes & Blobs

For testing purposes, we can either create a new file or create a object like below, 
```
$ echo 'test content' | git hash-object -w --stdin
d670460b4b4aece5915caf5c68d12f560a9fe3e4
```
* `git hash-object` would take the content you handed to it and merely return the unique key that would be used to store it in your Git database. 
* The `-w` option then tells the command to not simply return the key, but to write that object to the database. 
* Finally, the `--stdin` option tells git hash-object to get the content to be processed from stdin; otherwise, the command would expect a filename argument at the end of the command containing the content to be used.
  ```
  $ git hash-object -w test.txt
  83baae61804e65cc73a7201a7252750c76066a30
  ```

All the git objects can be found in .git/objects folder. Below, we are in a new repo, so its empty.
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/Internals (master)
$ find .git/objects
.git/objects
.git/objects/info
.git/objects/pack
```

Create a new file with content & commit
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/Internals (master)
$ echo "Hello, World!" > HW.txt

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/Internals (master)
$ git add .
warning: LF will be replaced by CRLF in HW.txt.
The file will have its original line endings in your working directory.

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/Internals (master)
$ git commit -m "Initial Commit"
[master (root-commit) 003c678] Initial Commit
 1 file changed, 1 insertion(+)
 create mode 100644 HW.txt

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/Internals (master)
$ git log
commit 003c6781e4475888b59f248e5e76d3334d278f99 (HEAD -> master)
Author: Sushanth Bobby Lloyds <bobby.dreamer@gmail.com>
Date:   Mon Oct 12 22:34:54 2020 +0530

    Initial Commit
```

**Note** : If you look at the output of commit above, the code next `create mode` means, 
* 100644 : File attributes of the object. Regular non-executable file
* 100755 : Executable file


Now objects directory has 3 files – 3 Objects. They are Commit, Tree & Blob 
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/Internals (master)
$ find .git/objects
.git/objects
.git/objects/00
.git/objects/00/3c6781e4475888b59f248e5e76d3334d278f99
.git/objects/8a
.git/objects/8a/b686eafeb1f44702738c8b0f24f2567c36da6d
.git/objects/ee
.git/objects/ee/929cd9cd862b204986cf94ab23853b4c98cb97
.git/objects/info
.git/objects/pack
```

Now lets map what is what 
* From `git log` we know commit hash is `003c6781e4475888b59f248e5e76d3334d278f99`
  ```
  .git/objects/00
  .git/objects/00/3c6781e4475888b59f248e5e76d3334d278f99
  ```

* Using the command `git ls-files -s`, we can know the hash of the files 
  ```
  Sushanth@Sushanth-VAIO MINGW64 /d/GITs/Internals (master)
  $ git ls-files -s
  100644 8ab686eafeb1f44702738c8b0f24f2567c36da6d 0       HW.txt
  ```
  Now we can say that below is the file 
  ```
  .git/objects/8a
  .git/objects/8a/b686eafeb1f44702738c8b0f24f2567c36da6d
  ```

* Now we can easily make a guess that remaining one has to the tree 
  ```
  .git/objects/ee
  .git/objects/ee/929cd9cd862b204986cf94ab23853b4c98cb97
  ```

Instead of guessing, we can use `git cat-file` to know the type, content and size of the files from the hash. 
`git cat-file –t <hash>`
  * To know type of the object

`git cat-file –p <hash>`
  * Pretty-print the content of the file

`git cat-file –s <hash>`
  * To know the size of the file

##### Knowing object type 
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/Internals (master)
$ git cat-file -t ee929
tree

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/Internals (master)
$ git cat-file -t 8ab68
blob

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/Internals (master)
$ git cat-file -t 003c6
commit
```

##### Knowing content in the object 
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/Internals (master)
$ git cat-file -p ee929
100644 blob 8ab686eafeb1f44702738c8b0f24f2567c36da6d    HW.txt

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/Internals (master)
$ git cat-file -p 8ab68
Hello, World!

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/Internals (master)
$ git cat-file -p 003c6
tree ee929cd9cd862b204986cf94ab23853b4c98cb97
author Sushanth Bobby Lloyds <bobby.dreamer@gmail.com> 1602522294 +0530
committer Sushanth Bobby Lloyds <bobby.dreamer@gmail.com> 1602522294 +0530

Initial Commit
```

##### Knowing the size of the object 
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/Internals (master)
$ git cat-file -s ee929
34

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/Internals (master)
$ git cat-file -s 8ab68
14

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/Internals (master)
$ git cat-file -s 003c6
209
```

**Note** : Cannot use CAT command to print the contents as they are compressed

![cat object](assets/48-git44.png)  

##### Knowing more about tags 

Lets see basic difference about light-weight tag & annotated tag. In the below example, 

* v1.0 : Light-weight tag 
* v2.0 : Annotated tag

```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test1 (master)
$ git cat-file -t v1.0
commit

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test1 (master)
$ git cat-file -t v2.0
tag
```

Lets pretty print v1.0 & v2.0. Here you can see whats in both the tags. 
* v1.0 : Just refers the commit 0500b45. This tag is sort of alias/aka of that commit. 
* v2.0 : This has additional information. 
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test1 (master)
$ git lol
* 83ce55e - (HEAD -> master) Adding g.txt (1 year, 10 months ago) <Sushanth Bobby Lloyds>
* 804e1db - Added f.txt - Tag Testing (1 year, 10 months ago) <Sushanth Bobby Lloyds>
* 25dc023 - (tag: v2.0) Revert "f7.txt Update 1" (1 year, 11 months ago) <Sushanth Bobby Lloyds>
* d9e798a - f7.txt Update 2 (1 year, 11 months ago) <Sushanth Bobby Lloyds>
* 2f161e1 - f7.txt Update 1 (1 year, 11 months ago) <Sushanth Bobby Lloyds>
* 431be32 - f7.txt Initial (1 year, 11 months ago) <Sushanth Bobby Lloyds>
* 4d60b51 - Adding e.txt (1 year, 11 months ago) <Sushanth Bobby Lloyds>
* 34013d4 - Adding d.txt (1 year, 11 months ago) <Sushanth Bobby Lloyds>
* f891fb4 - Adding c.txt (1 year, 11 months ago) <Sushanth Bobby Lloyds>
* 3cee413 - Adding b.txt (1 year, 11 months ago) <Sushanth Bobby Lloyds>
* 080f76f - Adding a.txt (1 year, 11 months ago) <Sushanth Bobby Lloyds>
* 4fd2b57 - Revert "Adding f5.txt" (1 year, 11 months ago) <Sushanth Bobby Lloyds>
* 0500b45 - (tag: v1.0) Adding f6.txt (1 year, 11 months ago) <Sushanth Bobby Lloyds>
...

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test1 (master)
$ git cat-file -p v1.0
tree 10aa603d8807f825e542e351421d82784119b542
parent 5e01aa2fd80af3f7ac30013f41df6fee105f9c90
author Sushanth Bobby Lloyds <bobby.dreamer@gmail.com> 1542990955 +0530
committer Sushanth Bobby Lloyds <bobby.dreamer@gmail.com> 1542990955 +0530

Adding f6.txt

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test1 (master)
$ git cat-file -p v2.0
object 25dc023c91c8a2ae63b2f7d92f93b094347e9bec
type commit
tag v2.0
tagger Sushanth Bobby Lloyds <bobby.dreamer@gmail.com> 1543898924 +0530

O.O Version 2
```

To confirm that v1.0 is just refering the commit. We are below pretty printing hash 0500b45
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test1 (master)
$ git cat-file -p 0500b45
tree 10aa603d8807f825e542e351421d82784119b542
parent 5e01aa2fd80af3f7ac30013f41df6fee105f9c90
author Sushanth Bobby Lloyds <bobby.dreamer@gmail.com> 1542990955 +0530
committer Sushanth Bobby Lloyds <bobby.dreamer@gmail.com> 1542990955 +0530

Adding f6.txt
```
The output is exactly same. So for ease of use, instead of using commit hash you can use light-weight commit for referencing.

##### Knowing the content in merged commit

Lets see this `git graph`. 
* HEAD is pointing to the tip of the branch which is a commit created by merge 
* Parent of the merge-commit is, 
  - branch : add b1988f4
  - branch : sub f608a17
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git lol
*   335604e - (HEAD -> master) Merge branches 'add' and 'sub' (8 days ago) <Sushanth Bobby Lloyds>
|\
| * f608a17 - (sub) Update sub() (8 days ago) <Sushanth Bobby Lloyds>
* | b1988f4 - (add) Updated add() (8 days ago) <Sushanth Bobby Lloyds>
|/
*   c35ab3e - Added both add and sub (8 days ago) <Sushanth Bobby Lloyds>
|\
| * 447bd6a - Added sub feature (8 days ago) <Sushanth Bobby Lloyds>
* | 8671031 - Added add feature (8 days ago) <Sushanth Bobby Lloyds>
|/
* 216acda - Initial commit (8 days ago) <Sushanth Bobby Lloyds>
```

Lets pretty print commit `335604e` or `HEAD` and confirm the parent 
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git cat-file -p HEAD
tree ec0367d3524177d7b5350200217a227677b5b9e0
parent b1988f45e9ef5f1717762df1d39ea409eb63cb4d
parent f608a17f5bbccf7bc5b5154ec0c8299e03933364
author Sushanth Bobby Lloyds <bobby.dreamer@gmail.com> 1601826795 +0530
committer Sushanth Bobby Lloyds <bobby.dreamer@gmail.com> 1601826795 +0530

Merge branches 'add' and 'sub'
```

`git merge-base`
* It race backwards from these two points until these branches have same commit point
* This helps in analysis
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test3 (master)
$ git merge-base add sub
c35ab3e9d7611576ac203473d5c75946b336810b
```

#### # git rev-parse
* Most of the git commands internally executes “git rev-parse” to get the full SHA1-hash
* It basically converts short-hash into long-hash
* Below you can see rev-parse used 4letter hash to get the actual hash
* This is what we used earlier to get the tag hash

Lets take below example for our rev-parse test.
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test1 (master)
$ git lol
* 83ce55e - (HEAD -> master) Adding g.txt (1 year, 10 months ago) <Sushanth Bobby Lloyds>
* 804e1db - Added f.txt - Tag Testing (1 year, 10 months ago) <Sushanth Bobby Lloyds>
* 25dc023 - (tag: v2.0) Revert "f7.txt Update 1" (1 year, 11 months ago) <Sushanth Bobby Lloyds>
...
* 0500b45 - (tag: v1.0) Adding f6.txt (1 year, 11 months ago) <Sushanth Bobby Lloyds>
...
```

'git rev-parse` takes short-hash convert to long-hash
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test1 (master)
$ git rev-parse 83ce
83ce55e716284a03e8bcf20d732f3df90799d77c
```

Here we are rev-parsing tags, when we
* v1.0 : We know that its refering to commit 
* v2.0 : Annotated tag is a object with its own hash. 
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test1 (master)
$ git rev-parse v1.0
0500b45503db6409bc2dc2d2c27a8d09a86150f8

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test1 (master)
$ git rev-parse v2.0
8a128853cc7f76c0243331b49aed36f8100cbabf

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test1 (master)
$ git cat-file -t 8a1288
tag

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/test1 (master)
$ git cat-file -p 8a1288
object 25dc023c91c8a2ae63b2f7d92f93b094347e9bec
type commit
tag v2.0
tagger Sushanth Bobby Lloyds <bobby.dreamer@gmail.com> 1543898924 +0530

O.O Version 2
```

Knowing rev-parse we can get the hash of commit or tree easily `git rev-parse commit-ish^{type}`

`git rev-parse head^{tree}`
  - Shows current HEAD's tree hash
`git rev-parse head^{commit}`
  - Shows current HEAD's commit hash
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/Internals (master)
$ git lol
* 003c678 - (HEAD -> master) Initial Commit (76 minutes ago) <Sushanth Bobby Lloyds>

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/Internals (master)
$ git rev-parse master^{commit}
003c6781e4475888b59f248e5e76d3334d278f99

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/Internals (master)
$ git rev-parse master^{tree}
ee929cd9cd862b204986cf94ab23853b4c98cb97

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/Internals (master)
$ git cat-file -p ee92
100644 blob 8ab686eafeb1f44702738c8b0f24f2567c36da6d    HW.txt

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/Internals (master)
$ git ls-files -s
100644 8ab686eafeb1f44702738c8b0f24f2567c36da6d 0       HW.txt
```

#### # Git FileSystemChecK

`git fsck`
* Verifies the connectivity and validity of the objects in the repository

Typical output looks like this 
```
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/git (master)
$ git fsck
Checking object directories: 100% (256/256), done.
dangling commit 1972cb1c728ed3c120ed4ea41b1ff421d9eb7604
dangling blob 2ccc9d4b364a7f69544839b78e223c482508919f
dangling tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
dangling commit 5060f314ceef6ed57af5a9c0bc96eee39d925e04
dangling commit 69643d82b2951bbe46e4c613446fe5424319cb5a
dangling blob 9686686012038d0e769708df79668e4a83afdccb
dangling blob 9fec48973ca630bb0869b04f42957f23f40e3d2e
dangling commit a34ce3582f54e198d8b050871ef5bab970a0c9c4
dangling blob d62cb1ccedd70cd9b1c1ce0a19962389f0d2b4a5
dangling tag 2725b352a7d635e37761ddb0e6070bb9ce5f40c0
dangling tag 4129fcbafa2cc682fc9fecef0304bedce94f7bbe
dangling commit 8e1f25a9ada69c9ae4b5d56c16722e5ffe2d8fb7
dangling tag 9a19fca3bb272e12b138ab3b43bbf45d5516eaa8
dangling commit 9a21716ed23c6f9049e90dfa1d86838fa3a22d44
dangling tag b3abe249b2b1e7d0cf65d77c276a3c77556db162
dangling commit f0871d07baf443ce8915d28e3cbdf1d658fec211
```
* Dangling blob : A change that made it to the staging area/index but never got committed. One thing that is amazing with git is that once it gets added to the staging area, you can always get it back because these blobs behave like commits in that they have a hash too. 

* Dangling commit/tag : A commit which is not associated with reference, i.e there is no way to reach it. For example, we delete the branch featureX without merging its changes, then the commit in featureX will become a dangling commit because there is no reference associated with it. Had it been merged into master, then HEAD and master references would have pointed to the commit in featureX and it would not be dangling anymore, even if we deleted featureX. 

You can think branches(master/main, featureX) and HEAD are just references to specific commits. featureX and master labels refer to latest commits on their respective branches. HEAD generally refers to the tip of the currently checked out branch (master in this case).

#### # Garbage Collection
`git gc`
* Executes a lots of housekeeping activities
  - Compresses all the objects and stores in pack file
  - Removes unreachable objects ( dangling commits )

Below command can be used to remove all dangling objects from the repository 
```
git gc --prune=now
```


#### # Cleaning the repo 
  | Commands   | Description                               |
  | :--------- | :---------------------------------------- |
  | git clean -n | to list what files would be removed(dry run) |
  | git clean -f | to remove untracked files |
  | git clean -dfx | (d):remove any untracked folders, (f):force, (x):remove ignored/hidden files as well |

**Caution** : `git clean -dfx` usually everyone ignore key files and folders. This command can delete them and it will be unrecoverable. 

#### # Un git 
```
rm –rf .git .gitignore
```

* * *

#### # Next steps 
* **[Collaboration](49-git-theory-6)** : Git remote repository
* **[Git Everyday](50-git-theory-7)** : Git flowchart, shortcuts and references
* **[Origin](44-git-theory-1)** : How it all began. What is git ? and Terminologies used in this series. 
* **[Basics](45-git-theory-2)** : config, init, add, rm, .gitignore, commit, log, blame, diff, tag, describe, show and stash
* **[Undos](46-git-theory-3)** : checkout, reset, revert and restore
* **[Branching](47-git-theory-4)** : Git Branching
