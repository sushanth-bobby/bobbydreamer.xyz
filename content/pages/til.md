--- 
title: Today I Learned
slug: "/til"
---

**Date** : 24/April

**Git log in CSV format**

```sh {1}
git log -5 --pretty=format:%h::%an::%ae::%ai::%s
1ade327::sushanth bobby lloyds::sushanth.august@gmail.com::2022-08-31 14:21:57 +0530::Updated README.md
91f2a6c::Sushanth Bobby Lloyds::sushanth.august@gmail.com::2022-08-31 13:48:32 +0530::August 2022 Update
d65b6c5::Sushanth Bobby Lloyds::sushanth.august@gmail.com::2022-08-06 15:40:02 +0530::Updated README.md for August
ed6fe0b::Sushanth Bobby Lloyds::sushanth.august@gmail.com::2022-08-06 15:35:17 +0530::April 2022 : April-August Updates
6606793::Sushanth Bobby Lloyds::sushanth.august@gmail.com::2022-08-06 14:33:36 +0530::April-August Updates
```

**Date** : 11/October/2021

**Forcing Dark mode in Chrome**     

* Type in address bar chrome://flags
* Search for `dark` and you will find `Force Dark Mode for Web Contents`
* Change settings from **Default** to **Enabled**

* * *

**Date** : 20/September/2021

Yesterday i felt asleep, thinking about what i was doing that day. I don't even remember ending it, i think i felt asleep in the mid way itself. This actually could be a cure to my sleeping problem. My day was soo boring, i put myself to sleep thinking about it. hmm... Amazing. Should try it multiple times, to prove it works. 

* * * 

**Date** : 29/July/2021

When you type `cmd` in windows explorer address bar and command prompt for that specific folder will be opened 

* * * 

**Date** : 15/April/2021

> bureaucracy means rigid role, rigid rule   
> -- Mark Schwartz

* * * 

**Date** : 25/February/2021

Just a thought, after hearing lots of motivation videos/speeches what i really liked other than quotes are the voices. May be sometimes I feel, its the voice that drives me to get inspired and motivated. i.e., Jim Rohn

* * * 

**Date** : 27/January/2021

Dont go with the first thought, rethink it the second time

___ 

**Date** : 14/January/2021

`df.sample()` this far better than using `df.head()` and later `df.tail()`

___ 

**Date** : 22/December/2020    

I was about to reach my 15GB of freespace in google. Breaking it down, i had 1GB in Drive, 5GB in GMail and 8GB in Photos. I was bit surprised to see 5GB in Gmail, i didn't think i had attachments in mail. So, i started to hunt them down with below commands, initially started with mails > 10MB and later got to 1MB. Now got it down to 2GB after deleting lots of photos i had attachment. Got to find few more efficient ways to delete emails. Its a time consuming task. 

```
has:attachment larger:10M
has:attachment larger:1M
```

___ 

**Date** : 08/December/2020    

Googles weird way of reusing XML namespace. I was like initially WHAT. Is google using S3 behind the hood. 
![Cloud Storage XML namespace](ListBucketResult.png)

When i started digging(googling) into this found out that this tag(ListBucketResult) was specified by AWS (Amazon) and GCP decided to re-use this specification in its own implementation rather than just implement a completely new specification which likely would have been semantically identical to that which already existed. The re-use of interfaces is normally a good thing. 

___ 

**Date** : 30/November/2020    

Reworks are frustrating. Its the same work which keeps coming back, again and again. If it’s a product, few tweaks here and there but its not easy when you have to rethink lot of things. If it’s a report, its much worse, at times, I get exhausted in preparing the report, itself. Time best spent should be in reviewing the report not in the making. Reworks could come from different areas and in different ways, its stressful. 

One workaround I found to reduce stress is not thinking about it as a rework but as a new work. Once you deliver, it's done, if it comes back, think of it as a new work. In preparing reports, I break it down as two tasks, one preparing it and two analyzing it. 

Do remember anyhow you are going to do that work, do you want to do it with stress ? Breaking it down (or) changing the way, you look at it, works.

___ 

**Date** : 29/November/2020    

Found this app [hemingwayapp.com](http://www.hemingwayapp.com/) which helps in reviewing the content.
___ 

**Date** : 02/October/2020    

In windows explorer using below expression can find file modified between date ranges. 
```
datemodified:3/1/2020..5/1/2020
```
___ 

**Date** : 01/October/2020    

Brian Kernighan famously wrote:
> Everyone knows that debugging is twice as hard as writing a program in the first place. So if you're as clever as you can be when you write it, how will you ever debug it?     
> — The Elements of Programming Style 

Basically states, prefer simple over complex code as complex code may be tedious to debug. 

___ 

**Date** : 25/September/2020    

There are lot of people who can predict failure than success. 

___ 

**Date** : 21/September/2020    

Feedback is a gift. Give 1 feedback to each of your team members - James Carter, Sionic    

Feedback format 
* One aspect of your contribution, i have valued is : 
* One thing you could do differently would be :  
___ 

**Date** : 09/September/2020    

After a complete burnout and pressure leading to headache, a long engaging virtual creative session(zoom) just adding points with no compulsion or pressure actually relieved my headache. 

___ 

**Date** : 15/August/2020    

No point in saving URLs as they are prone to change. Saving content, screenshots and taking notes are the only way. 

___ 

**Date** : 17/July/2020    

In today's world while building application, think about,

  1. Have a plan that application is capable of running in Physical server or cloud. 
  2. Flexible enough to change programming language and framework. When you do it for second time, be sure that doesn't become legacy soon. 

___ 

**Date** : 12/June/2020    

All this time, i was thinking i had to pull the plug to play these games. Suprisingly there is link for it.  
```
chrome://dino/
edge://surf
```
___ 

**Date** : 24/April/2020    

Read [this](https://www.quantamagazine.org/why-sex-biologists-find-new-explanations-20200423/) science article and it said 
> The Volvox species she works with are facultatively sexual, meaning that they choose whether to clone themselves or have sex. When they opt for sex, it’s to improve their odds of survival.

Volvox is a algae and green. I guess piccolo's do that. 

___ 

**Date** : 20/April/2020    

Archival, quality, deletion of unnecessary data are very important when you are processing lot of data. When you are writing and testing, it might perform well for the input provided, even for full data and also completes in few seconds or minutes, it might be ok at that time, eventually when quantity increases, performance degrades and those seconds & minutes become hours of unnecessary processing. Here, archival is about moving data that need not be processed anymore but required, so its better to move it to history tables, quality is about every field or column, being in up-to-date state as sometimes, the row is processed because of that column and after processing, its still not updated. Reasons could be, that row should have been archived, missed to update that field, updating wrong data to the field. Deletion of unnecessary data, really helps in tablespace scans in the worst case scenario, makes the table active rather than one table having history and active rows. Housekeeping of data is really a important thing and hate to say this, its always ongoing task.

Sometimes progress is not about refactoring the same code, so, its best to think about performance at the beginning, it might not be possible all the times, if you are working in a new technology or new domain. Below are some lessons learnt this week,

1. Refreshing of whole table is a waste of time, if you are doing it everyday because and only few rows changed. So think about processing/updating specific rows. MQTs(pre calculated tables) are not the answers always
1. Cleansing data is a everyday process, don't make a habit to do it every day, weekly or monthly is fine
1. There are always best practices that are proven to work, read about them, test them. 
___ 

**Date** : 17/April/2020    

Learnt the below technique in python to show the line which caused the exception. By default, when you handle exception, it doesn't show the line number. Now, adding this to all my programs.
```py {6}
    try : 

    except Exception as e:
        print('Failed due to error')        
        print('Exception : ',e)
        print(traceback.format_exc())
```
___ 

**Date** : 08/April/2020    

Problem being a computer programmer is, your life is so perfect(you think), so you create a problem for yourself and work on solving that problem. It gives a good feeling when you solve it. But its entirely waste of time at some point you might wonder. Problem never existed.  
___ 

**Date** : 07/April/2020    

**Jupyter Notebook** - Previously when i try to write a program, i also create lots of small programs to test features, functionality, understanding concepts and finally implement them in the big program with Notebook everthing can be done in one big place and tests go really cluttered and its everywhere, eventually i spend lot of time in deleting cells which should have been in a separate program, as i wrote that for testing and understanding purposes. 

Have to learn a approach to avoid this. 

