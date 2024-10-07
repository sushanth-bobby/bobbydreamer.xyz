---
title: Unix Shell Learnings
date: 2022-08-07
description: Some unix shell learnings
tags: ['shell', 'unix']
slug: "/114-shell-learnings"
---

**Created on:** 2021-07-26

#### Creating multiple files and folders in single command

```sh
-- Creates multiple subfolders(test1, test2) under ./lib folder
 mkdir -p routes/{books,homepages,number,posts,user,wiki}

-- Creates files package.json, index.js in the subfolders lib/test1 and lib/test2
 touch routes/{books,homepages,number,posts,user,wiki}/{index.js,README.md}
```

#### /dev/null 2>&1

Source : [What Does > /Dev/Null 2>&1 Mean?](http://www.xaprb.com/blog/2006/06/06/what-does-devnull-21-mean/)

##### Output redirection

The greater-thans (>) in commands like these redirect the program's output somewhere. In this case, something is being redirected into /dev/null, and something is being redirected into &1.

##### Standard in, out, and error

There are three standard sources of input and output for a program. Standard input usually comes from the keyboard if it's an interactive program, or from another program if it's processing the other program's output. The program usually prints to standard output, and sometimes prints to standard error. These three file descriptors (you can think of them as “data pipes”) are often called STDIN, STDOUT, and STDERR.

Sometimes they're not named, they're numbered! The built-in numberings for them are 0, 1, and 2, in that order. By default, if you don't name or number one explicitly, you're talking about STDOUT.

Given that context, you can see the command above is redirecting standard output into /dev/null, which is a place you can dump anything you don't want (often called the bit-bucket), then redirecting standard error into standard output (you have to put an & in front of the destination when you do this).

The short explanation, therefore, is “all output from this command should be shoved into a black hole.” That's one good way to make a program be really quiet!

* * * 

#### Return value to a variable

```sh
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/prehook (master)
$ git status
On branch master
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        new file:   "\340\256\207\340\256\250\340\257\215\340\256\244\340\256\277\340\256\257\340\256\276.txt"


Sushanth@Sushanth-VAIO MINGW64 /d/GITs/prehook (master)
$ rc=$(git status)

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/prehook (master)
$ echo $rc
On branch master Changes to be committed: (use "git restore --staged <file>..." to unstage) new file: "\340\256\207\340\256\250\340\257\215\340\256\244\340\256\277\340\256\257\340\256\276.txt"
```

Reading a file to a variable

```sh
# $COMMIT_MSG_FILE has the file path
  e_msg=$(cat "$COMMIT_MSG_FILE")

# Substring
  echo "${e_msg:0:5}"
```

* * * 

#### wc command 

wc is word count and its used for counting purpose. 

```sh 
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/prehook (master)
$ echo $rc
On branch master Changes to be committed: (use "git restore --staged <file>..." to unstage) new file: "\340\256\207\340\256\250\340\257\215\340\256\244\340\256\277\340\256\257\340\256\276.txt"

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/prehook (master)
$ echo $rc | wc
      1      17     193
```

Simplest options available are     

* -l : Returns how many lines 
* -w : Returns how many words 
* -c : Returns how many characters 

```sh 
Sushanth@Sushanth-VAIO MINGW64 /d/GITs/prehook (master)
$ echo $rc | wc -l
1

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/prehook (master)
$ echo $rc | wc -w
17

Sushanth@Sushanth-VAIO MINGW64 /d/GITs/prehook (master)
$ echo $rc | wc -c
193
```

* * * 

#### 'LC_ALL' variable

The LC_ALL variable sets all locale variables output by the command 'locale -a'. It is a convenient way of specifying a language environment with one variable, without having to specify each LC_* variable. Processes launched in that environment will run in the specified locale.

The value 'LC_ALL=C' is essentially an English-only environment that specifies the ANSI C locale.

Some language setting for LC_ALL are "ja" for Japanese and "us" for US English. For example, 'LC_ALL=ja'. 

* * * 

#### Convert String to Array

```sh
string=$(git diff --cached --name-only --diff-filter=A -z HEAD | sed 's/\x0/ /g')

## String to array
IFS=' ' read -r -a array <<< "$string"
```

#### For-Loop and If-condition

```sh
for i in "${array[@]}"
do
   if !([[ "$i" == I* ]] || [[ "$i" == B* ]]); then
      echo "pre-commit check : FAIL : First character should be I or B - $i"
      flag=1
   fi
done

if [ "$flag" == 1 ]; then
   exit 1
else
   echo "pre-commit check : PASS : First character naming : OK"
fi
```

#### -z flag

Checks if the string is empty

```sh
if [[ -z "$COMMIT_SOURCE" ]]; then
    echo "prepare-commit-msg check : FAIL : No commit message"
fi
```

* * * 

**Learning when learning comes**