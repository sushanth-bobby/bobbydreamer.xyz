---
title: Local or Client-side git hooks
date: 2021-07-26
description: Local Git Hooks
tags: ['shell', 'unix', 'git']
slug: "/115-git-hook-client-side"
---

> Git hooks allow you to run custom scripts whenever certain important events occur in the Git life-cycle, such as committing, merging and pushing. 
> -- tygertec, Youtuber

Hooks are found in `.git/hooks` and to run them     

1. You have to remove .sample extension
2. Make them executable `chmod +x hook_name`

* Hooks(.git/hooks) are not pushed to source control(git / bitbucket)
* Hooks can be bypassed by using `--no-verify` flag
* Scripting languages can be anything available in the system like `#!/bin/sh` or `#!/bin/bash` or python or perl anything. 
* Exit return codes have to be 0(success) / 1(failure)

There are many hooks and here we are going to see two of them     

* **pre-commit** - This hook is invoked `git commit`. It takes no parameters, and is invoked before obtaining the proposed commit log message and making a commit. Exiting with a non-zero status from this script causes the `git commit` command to abort before creating a commit.

* **prepare-commit-msg** - This hook is invoked by `git-commit` right after preparing the default log message, and before the editor is started. It takes one to three parameters. The first is the name of the file that contains the commit log message. The second is the source of the commit message, and can be: message or template or squash or commit. If the exit status is non-zero, git commit will abort. The purpose of the hook is to edit the message file in place, and it is not suppressed by the --no-verify option. A non-zero exit means a failure of the hook and aborts the commit. It should not be used as replacement for pre-commit hook.

### pre-commit

This hook does 3 things     

* Checks if the filenames are ASCII Complaint
* File names should start either with I or B
* Files should be uppercase

```sh:title=pre-commit
#!/bin/sh
#
# An example hook script to verify what is about to be committed.
# The hook should exit with non-zero status after issuing an 
# appropriate message if it wants to stop the commit.
#
# To enable this hook, rename this file to "pre-commit".

##########################################
### Filename should be ASCII Complaint ###
##########################################

if git rev-parse --verify HEAD >/dev/null 2>&1
then        
	against=HEAD
else
	# Initial commit: diff against an empty tree object
	against=$(git hash-object -t tree /dev/null)
fi

# If you want to allow non-ASCII filenames set this variable to true.
allownonascii=$(git config --type=bool hooks.allownonascii)

# Redirect output to stderr.
exec 1>&2

#######################################################################
# Cross platform projects tend to avoid non-ASCII filenames; prevent
# them from being added to the repository. We exploit the fact that the
# printable range starts at the space character and ends with tilde.
#######################################################################
if [ "$allownonascii" != "true" ] &&
	# Note that the use of brackets around a tr range is ok here, (it's
	# even required, for portability to Solaris 10's /usr/bin/tr), since
	# the square bracket bytes happen to fall in the designated range.
	test $(git diff --cached --name-only --diff-filter=A -z $against |
	  LC_ALL=C tr -d '[ -~]\0' | wc -c) != 0
then
	cat <<\EOF
Error: Attempt to add a non-ASCII file name.

This can cause problems if you want to work with people on other platforms.

To be portable it is advisable to rename the file.

If you know what you are doing you can disable this check using:

  git config hooks.allownonascii true
EOF
	exit 1
fi

# If there are whitespace errors, print the offending file names and fail.
# exec git diff-index --check --cached $against --

#################################################################################
### File names should start either with I for Implementation or B for backout ###
#################################################################################
flag=0
string=$(git diff --cached --name-only --diff-filter=A -z HEAD | sed 's/\x0/ /g')

## String to array
IFS=' ' read -r -a array <<< "$string"

## Loop through the above array
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

#################################
### Files should be uppercase ###
#################################
string=$(git diff --cached --name-only --diff-filter=A -z HEAD | sed 's/\x0/ /g')

# String to array
IFS=' ' read -r -a array <<< "$string"

flag=0
## now loop through the above array
for i in "${array[@]}"
do
   val=$(echo $i | sed 's/\.txt//g;s/\.TXT//g;s/\.sql//g;s/\.SQL//g;s/[0-9]//g' | LC_ALL=C tr -d '[A-Z]\0')
   # String length
   if [ "${#val}" != 0 ];  then
      echo "pre-commit check : FAIL : Filename should be uppercase : $i"
      flag=1
   fi
done

if [ "$flag" == 1 ]; then
   exit 1
else
   echo "pre-commit check : PASS : Filename uppercase check : OK"
fi
```

### prepare-commit-msg

This hook checks whether the commit message starts with `ABCD=`

```sh:title=prepare-commit-msg
#!/bin/sh
#
# This hook check if the commit message has ABCD= as the starting 
# text. If the hook fails non-zero status is returned and 
# commit operation is aborted. 
#
# To enable this hook, rename this file to "prepare-commit-msg".

COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2
SHA1=$3

#echo "COMMIT_MSG_FILE = $COMMIT_MSG_FILE"
#echo "COMMIT_SOURCE = $COMMIT_SOURCE"
#echo "SHA1 = $SHA1"

if [[ -z "$COMMIT_SOURCE" ]]; then
    echo "prepare-commit-msg check : FAIL : No commit message"
    exit 1
else
    e_msg=$(cat "$COMMIT_MSG_FILE")
#	echo "${e_msg:0:5}"
    if [ ${e_msg:0:5} == "ABCD=" ]; then
      echo "prepare-commit-msg check : PASS : Found ABCD= in commit message"
      exit 0
    else
	  echo "prepare-commit-msg check : FAIL : No ABCD= in CAPS found in the beginning of commit message"
      exit 1
	fi
fi
```

This hook just sort of prepends commit message with month and year
```sh:title=prepare-commit-msg
#!/bin/sh
#
# This prepare-commit hook will prepend month and year to the 
# commit message. 

COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2
SHA1=$3

#echo "COMMIT_MSG_FILE = $COMMIT_MSG_FILE"
#echo "COMMIT_SOURCE = $COMMIT_SOURCE"
#echo "SHA1 = $SHA1"

if [[ -z "$COMMIT_SOURCE" ]]; then
    echo "prepare-commit-msg check : FAIL : No commit message"
    exit 1
else
    e_msg=$(cat "$COMMIT_MSG_FILE")
    read YYYY MMM <<<$(date +'%Y %B')
#    echo $MMM $YYYY :
    echo "$MMM $YYYY : $e_msg" > "$COMMIT_MSG_FILE"
    exit 0
fi
```

Initially wanted to try `pre-receive` hook. This hook executes once for the receive operation and thought i can club some of above operations/checks at the server side. But it seems, `pre-receive` hook is available at only Git Enterprise. Anyhow it was interesting to learn. 


**Learning, when learning comes**