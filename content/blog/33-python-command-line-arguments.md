---
title: Python simple command line arguments
date: 2020-07-12
description: Writing a simple program which accepts command line arguments
tags:
  - python
slug: "/33-command-line-arguments"
---

Command line arguments are basically instructions or inputs given to the program in the terminal or command prompt. This is almost essential for a program which run in the terminal. Its pretty much easy to setup. 

#### Basics on CLI

If you want to use command line argument, you have to work with `sys.argv` which gives out a list/array containing all the arguments you had passed to the program when running it and to use `sys.argv`, you will first have to import the **sys** module.

Basically mapping would be like this
```py
python cliarg.py -p h
       |         |  |
       |         |  |-- Arg2 ( option value ) 
       |         |----- Arg1 ( option )
       |--------------- Arg0 ( program name )
```    

Below is a simple example using sys.argv, 

```py
import sys 

def process_args():
    print ('All Arguments :', str(sys.argv))
    print(sys.argv[0])   
    return

def main():
    period = process_args()

if __name__ == "__main__":
    main()

Output : 
(base) D:\BigData\12. Python\5. BTD\progs>python cliargs3.py 1 2 3 4 5
All Arguments : ['cliargs3.py', '1', '2', '3', '4', '5']
cliargs3.py
```

Next thing is to check that the arguments are valid, here easiest thing to check is, right number of arguments are provided when executing the program. For this we can just count the number of arguments and raise error when wrong. 

```py {7}
import getopt, sys 

def process_args():
    print ('All Arguments :', str(sys.argv))
    
    try: 
        if len(sys.argv) < 3:
            raise ValueError('Less arguments')
                
    except ValueError as err: 
        print (str(err))     
    return 

def main():
    process_args()


if __name__ == "__main__":
    main()

Output : 
(base) D:\BigData\12. Python\5. BTD\progs>python cliargs3.py 1 2 3 4 5
All Arguments : ['cliargs3.py', '1', '2', '3', '4', '5']

(base) D:\BigData\12. Python\5. BTD\progs>python cliargs3.py 1
All Arguments : ['cliargs3.py', '1']
Less arguments
```

If you start progressing with this, you will come to know that arguments have to be in right order otherwise there would be error or codebase could get complex. So, easiest available option is to `import getopt` module which parses command line options and parameter list. It can handle the 'right order' issue which i had mentioned. 

`getopt.getopt()` takes in 3 arguments,
* 1st argument, sequence of arguments to be parsed. Input is from `sys.argv[1:]` (leaving program name)
* 2nd argument, short-form or single character options. If an option has an argument then that single character option should be followed by colon(:)
  - like `'x:y:'`
* 3rd argument(optional), long-form option names, verbose. If an option has an argument then that option should be followed by equal sign(=)
  - like `["help", "period=", ""]`

When calling,
* Short-form arguments are prefixed with single hypen(eg: `python cliargs3.py -x 1 -y 2 3 4 5`)
* Long-form arguments are prefixed with double hypens(eg: `python cliargs2.py --period H`)

Below is a simple example using getopt,
```py
import getopt
import sys
 
argv = sys.argv[1:]
 
opts, args = getopt.getopt(argv, 'x:y:')
 
# list of options tuple (opt, value)
print('Options Tuple is {}'.format(opts))
 
# list of remaining command-line arguments
print('Additional Command-line arguments list is {}'.format(args))


Output : 
(base) D:\BigData\12. Python\5. BTD\progs>python cliargs3.py -x 1 -y 2 3 4 5
Options Tuple is [('-x', '1'), ('-y', '2')]
Additional Command-line arguments list is ['3', '4', '5']

(base) D:\BigData\12. Python\5. BTD\progs>python cliargs3.py -y 2 -x 1 3 4 5
Options Tuple is [('-y', '2'), ('-x', '1')]
Additional Command-line arguments list is ['3', '4', '5']
```

You can see the from the output, i had changed option order, but the tuple had the right values. 

Now lets write a program which would take arguments from command line and if the arguments are wrong it would use the default. I have highlighted all the important lines

```python {9,13,16,23}
# Python program to demonstrate Command line arguments
import getopt, sys 

def process_args():
    # Remove 1st argument from the 
    # list of command line arguments 

    print ('All Arguments :', sys.argv)
    argumentList = sys.argv[1:] 
    print ('Argument list :', argumentList)

    # Options (p requires an argument, thats why it has :)
    options = "hp:"

    # Long options : 'period=' requires an argument, so it has = suffixed
    long_options = ["help", "period=", ""]   
    period_long = {"Q":"Quarterly", "H":"Half yearly", "Y":"Yearly"}

    # Initializing default
    period = 'Q'
    try: 
        # Parsing argument 
        arguments, remainder = getopt.getopt(argumentList, options, long_options) 
        if(len(remainder)> 0):
            print('Other options = {}'.format(remainder))

        # checking each argument
        for currentArgument, currentValue in arguments:
            currentArgument = currentArgument.lower() # Converting all options to lowercase
            if currentArgument in ("-h", "--help"):
                print ("Diplaying Help. Options available") 
                print ("* {} -p Q = Process Quarterly".format('cliargs.py')) 
                print ("* {} -p H = Process Half yearly".format('cliargs.py')) 
                print ("* {} -p Y = Process Yearly".format('cliargs.py')) 
                period = '-'
            elif currentArgument in ("-p", "--period"): 
                if(currentValue.lower() in [x.lower() for x in ['Q', 'H', 'Y']]):
                    period = currentValue.upper()
                    print('Process {}'.format(period_long[period]))
                else:
                    period = 'Q'
                    print('Process Quarterly(default)')			
                
    except getopt.error as err: 
        # output error, and return with an error code 
        print (str(err)) 
        print ("Diplaying Help. Options available") 
        print ("* {} -p Q = Process Quarterly".format('cliargs.py')) 
        print ("* {} -p H = Process Half yearly".format('cliargs.py')) 
        print ("* {} -p Y = Process Yearly".format('cliargs.py'))     
    return period

def main():
    period = process_args()
    print('Chosen option is {}'.format(period))

if __name__ == "__main__":
    main()


Output 1 : Long Options help
(base) D:\BigData\12. Python\5. BTD\progs>python cliargs2.py --help
All Arguments : ['cliargs2.py', '--help']
Argument list : ['--help']
Diplaying Help. Options available
* cliargs.py -p Q = Process Quarterly
* cliargs.py -p H = Process Half yearly
* cliargs.py -p Y = Process Yearly
Chosen option is -

Output 2 : Long Options period
(base) D:\BigData\12. Python\5. BTD\progs>python cliargs2.py --period H
All Arguments : ['cliargs2.py', '--period', 'H']
Argument list : ['--period', 'H']
Process Half yearly
Chosen option is H

Output 3 : Short Options help
(base) D:\BigData\12. Python\5. BTD\progs>python cliargs2.py -h
All Arguments : ['cliargs2.py', '-h']
Argument list : ['-h']
Diplaying Help. Options available
* cliargs.py -p Q = Process Quarterly
* cliargs.py -p H = Process Half yearly
* cliargs.py -p Y = Process Yearly
Chosen option is -

Output 4 : Short Options period
(base) D:\BigData\12. Python\5. BTD\progs>python cliargs2.py -p y
All Arguments : ['cliargs2.py', '-p', 'y']
Argument list : ['-p', 'y']
Process Yearly
Chosen option is Y

Output 5 : In long form don't have mention full option name as long as its unique
(base) D:\BigData\12. Python\5. BTD\progs>python cliargs2.py --he
All Arguments : ['cliargs2.py', '--he']
Argument list : ['--he']
Diplaying Help. Options available
* cliargs.py -p Q = Process Quarterly
* cliargs.py -p H = Process Half yearly
* cliargs.py -p Y = Process Yearly
Chosen option is -

(base) D:\BigData\12. Python\5. BTD\progs>python cliargs2.py --pe h
All Arguments : ['cliargs2.py', '--pe', 'h']
Argument list : ['--pe', 'h']
Process Half yearly
Chosen option is H
```


**Thats it for now, go *PLAY* **