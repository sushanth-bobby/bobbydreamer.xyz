---
title: SRE - Notes from youtube
date: 2020-11-15
description: SRE Notes taken while watching youtube
tags:
  - notes
  - sre
slug: "/51-sre-notes-from-youtube"
---

*Note : Some of the content may seem repetitive as its same subject presented by different people.*

##### Best Practices from Google SRE: How You Can Use Them with GKE + Istio (Cloud Next '18) - Nori Heikkinen, Daniel Ciruli

Source : [Youtube](https://youtu.be/XPtoEjqJexs) : ⭐ very good one 

* SRE is a term google made up.  SW setup alerting and monitoring and paging to everyone and they found out only few people were always responding to alerts those people gravitated in to role  eventually became SRE. 
* It's still operationally driven, still get paged to fix problems at the basis still an engineering role. 
* Classic role all they can do is fix and mitigate the problem

SRE is still operationally driven but its more of a engineering role but you do also, 
  * Fix
  * Do root cause analysis
  * Postmortem
  * Make sure same thing doesn't happen again

CNN as a service used by healthcare.gov for monitoring . They watch news to know if their service is down. 

**Four golden signals**
![Four golden signals](assets/51-sre1.png)  

1. Traffic : How many requests are coming into the system : RPS(Requests per second) . Comes in the category of fundamental 
2. Errors : % of requests that are failing. What's also acceptable. Comes in the category of fundamental 
3. Latency : This is not fundamental. It's talked as percentile 50th percentile  or median P50, P90 and P99. Latency as a average is not good metric. 
4. Saturation : At what point your service is going to fallover. This sort of a metric of your choice to identify, when your system can fail. Example CPU utilization (or) it could something like Auto scaling signalling you should Autoscale, load shedding singnalling that you cannot scale anymore need to drop queries. 

* Should be able to see every other systems dashboard they could your dependency. 

* Google logs everything with reasonable retention period. Need to have a log analysis tool with SQL like interface is advantageous than grep(google uses Dremel). 

* SLI are metrics, golden signals are place to start. 
* SLOs are targets values or ranges for SLIs. (100% is not a good range). 
* SRE is all about planning about failure. Things are going to break. 
* SLA is a legal agreement. So customers are going to come with breach of contract. 

![SLI, SLO and SLAs](assets/51-sre2.png)  

* Error budgets are permissive. What good are the nines if you don't take them out every now and then. Error budget let's you balance reality vs reliability. 

* No budget  = No pushes(change freeze)
    - This gives customers/users a greater period of stability as they just experienced a outage. 
    - Re directing feature work to reliability work. 

* If you have the error budgets, think of when is the good time to take extra risks. When you find time and if you have a feature which is well tested but it carries a risk you have a budget to spend. 

* This is how google works and launch features or products like initially we say we are going to be launching a product and dates change because, we don't have any budget.   

* Canary release take small fraction of your typical workload. Set golden rules for Canary separately and monitor it. It's all about catching it early. 

##### Solving Reliability Fears with Site Reliability Engineering (Cloud Next '18) - Jess Frame, Ann Wallace
Source : [Youtube](https://youtu.be/ZcZtU_TiFEM)

**What is SRE ?**    

*my own thoughts* : Development teams don't manage applications once it goes to production, they just move on to make other new things. Whereas the operations team manages the application till it gets decommissioned, that's actually lot of time for few months of development. 

Mostly they're are lot of emphasis on development teams than operations team

![Reducing product lifecycle fiction](assets/51-sre3.png)  

Business to development = Agile solve this
Development to operations = Devops solves this

**Interface Devops**    

  1. Reduce organisational silos
  2. Accept failure as normal
  3. Implement gradual changes(smaller changes are easier to implement and rollback which helps in Mean time to recovery)
  4. Leveraging tooling and operations
  5. Measure everything

**SRE approach to operations**    

  1. Use data to guide decisions
  2.  Year operation like software engineering problem
  3. Write automation
  4. Use softwares to accomplish tasks fine by sysadmins
  5. Design more reliable and operable architecture from start
	 
![Class SRE implements Devops](assets/51-sre4.png)  

**Error Budgets : Key principles of SRE**
* How to measure reliability

![Availability](assets/51-sre5.png)  

![Allowed Availability Window](assets/51-sre6.png)  

**SLI/SLO/SLA**    

  * SLO = Target of SLIs aggregate over time
    - Typically equal should hold : sum( SLI met) / window >= target percentage
    - Getting an SLO is complex. At first try to keep it simple, you will later iterate through and get something solid. 

  * Error budgets
    - Budget of unreliability = 100% - availability target
    - Dev teams device how they spend the error budget. Get near the budget but don't exceed if you exceed there will be in a change freeze. 
    - Infrastructure failures eat into error budgets
    - When error budget is depleted you need to go and say you need to cut off  and not do any more releases. Eventually everyone will understand and set reasonable expectations. 

**Practices of SRE**     

  * Metrics and monitoring
    - Monitoring : Automate recording system metrics
    - Alerting : Page (human), Alert (not immediate response)
		
  * Capacity planning : Planning is vital. Should be able to predict and forecast.  See something bad rollback immediately and investigate later. Having capacity is one thing but obtaining it swiftly and integrating it is equally important. 
	
  * Change management
    - Mitigations ( progressive rollouts, rollback safely)
    - Automate this, reduce errors. 

  * Emergency response
    -  Training and support(pri & sec) is largely the success. 
    - System is more important than who
    - Postmortem should be blameless
    - Toil mangement. Check what's manual, repetitive, automatable, tactical (interrupt driven and reactive), Without enduring value, O(n) with service growth. 
	 
  * Culture
    - Operations team to get developers to automate tasks and work asking with operations team. 
    - Everybody in team should be able to code. Don't let developers to do ops work. But don't bucket the work that creates unnecessary silos. 
    - Empower SREs to enforce error budget and toil budget. 
    - SREs are the people who will know what to do during an outage. So you have to put your trust in them. 

* How to get started 
    * Start with SLO & Error budget
    * Get people who can do programming
    * SRE must be able to shed work and reduce SLOs when overloaded. 

* Ways to get help

##### DevOps Vs. SRE: Competing Standards or Friends? (Cloud Next '19) - Seth Vargo
Source : [Youtube](https://youtu.be/0UyrVqBoCAU)

* Every new line of code can bring instability to production and cause reliability problems. 
* Developers were closer to business both physically and metaphorically and operators are usually in data center and often felt their ideas being heard. 
* Developers are in agile world & Operators are in stability world

![Developers Vs. Operators](assets/51-sre7.png)  

Devops movement was all about breaking down the wall between developers & operators 

Simplest way to breaking down the barriers
  * Make them sit them in the same floor
  * Make them attend standups
  * Make developers listen to operators
    - Developers will talk or share ideas for new products
    - Operators can state the reality of the existing hardware and limitations
    - When discussion around these subjects happen in the beginning, it can save time and money. 



**Devops manifesto**    

  * Reduce organizational silos
    - Developers : People writing code
    - Operators : People making sure that code continues to run
    - Devops in pure form needs to be effectively cross functional with all teams Security, legal review, marketing, PR. Its not just Developers & Operators this most people misunderstand.
  * Accept failure as normal
    - This has to be built in the core in advance
    - Any system that is built by human is unreliable
    - Differ company to company
  * Implement Gradual Changes
    - Every implementation has to have a rollback
    - 10k lines of code is hard to review, 1k is better and 1 far better. Small, Simple  and gradual implementation is better and chances of bug is smaller. 
  * Leverage Tooling & Automation
    - Knowing tools like Chef, Puppet, Ansible, Terraform doesn't make you Devops engineer. These tools supported Devops movement. 
    - Devops has lots of work creating users, installing packages, building docker containers, monitoring, logging and alerting. All this takes time, when you have thousands of VMs, you cannot just login into a VM and do YUM UPDATE. It doesn't scale. Need to have tooling and automation. 
    - Humans are bad at repetitive work. Computers are good at it 
  * Measure Everything
    - You need have metrics to say things are going better 
    - To measure success there needs to be clear success at organization level and application level
    - There is difference between measuring everything, monitoring everything and alerting everything. 
    - Don't alert on every metric
    - Measure & Alert what matters to users like (examples : checkout page, can people put orders, is analytics working). 
	
* SRE evolved independently from Devops. Google believed SRE is the way run, build and maintain production systems at scale. 

* Devops was built by a community and SRE was built by google
    - SRE was like a secret sauce and google for a time had kept it secret and everybody was banned using the term outside of google, job posting will not have this term
    - But when google started interacting with customers and googlers started using this terms, everybody was new to the terms and nobody understood it and that point google decided this not to keep it secret. 
* Class SRE implements Devops
    - Devops is like an abstract class  or an interface in programming. It says here are the things you should do. 
    - SRE is a concrete implementation of that class. 
    - There are things in SRE which are not really in Devops interface but SRE does satisfy Devops interface 


| Devops   | SRE                               |
| :--------- | :---------------------------------------- |
| Reduce organization silos | Share ownership with developers use same set of tooling with developers. So everybody is contributing to get the job done. |
| Accept failures as Normal | SLO & Error budgets. <br/> Forcing collaboration & conversation between product teams, developers and SREs and even sales and post-sales. We also have to admit, how reliable our system can be. <br/> Blameless portmortems | 
| Implement gradual change | Move fast by making small iterative deployments. | 
| Leverage Tooling and automation | Spend time that bring long time value to your system. Think of everything that can be possibly automated. (TOIL) | 
| Measure everything | Measure even toil | 


SLIs, SLOs and SLA
  * SLI : Service Level Indicator : They are PIT/Aggregate PIT of a metric in a system. It sort should say healthy or not for that metric and SRE will define that. 
  * SLO : How much Up or Down can we have in a particular time period like in a Quarter or Half. 
  * SLA : Business agreement between consumer, customer typically based on SLOs. 

Who & Where they are involved
  * SLI : Product owners, SRE and Software engineer
  * SLO : SRE & Product owners
  * SLA : Sales, Customer, Legal and may be some Product owner involvement will be here 
 
Do remember, SLO should break first before SLA. 

Error budgets
  * Nearly impossible to find a 100% reliable system in the world. 

![Availability disruption due to other factors](assets/51-sre8.png)  

Even if you spend & create a 100% reliable system, for the end user it will be available for only 99% of time as its based other least reliable components of the system. 

How risky my service can be, it depends on many things. 
  * Fault tolerance
  * Availability 
  * Competition
  * How fast you are trying to deliver

* Acceptable risk should dictate the SLO
* To be highly reliable you need to increase the nines
* If your focus on new features and getting it out fast, you may need to decrease some nines
* For customer to trust, you system needs to be reliable. 

**What happens when error budget is depleted ?**    

You can continue deploying, your developer can continue building features but everything has to focus on reliability. They cannot ship new features until we improve reliability. Sort of everything should shift from new features to building improving reliability of the system until the budget is replenished. 

When developers ask/say this is a important feature why cant I deploy it ? Well they can deploy, but they will lose SRE support meaning developers will be taking over the support. 


Toil
  * Toil is not email, reports, meeting, travelling
  * Toil is Manual, Repetitive, Automatable, Tactical and Devoid of long term value 

Suppose you are creating a report like it takes 15mins to make and to automate it will take around 20hrs. This report is made once a year in that case its not Toil. Just document, how to do it, as it will help others. 

##### Data Management: The New Best Practice for Incident Response (Cloud Next '19) - Andre Kelly
Source : [Youtube](https://www.youtube.com/watch?v=VXqfbp_zE0c)

![Shorter Outages](assets/51-sre9.png) 

Each time when an outage occurs, the response time to resolve, it should be smaller. 

##### Google Cloud DevOps: Speed With Reliability and Security (Cloud Next '19)
Source : [Youtube](https://www.youtube.com/watch?v=cXXZ-AOCALU) : ⭐ Good things start @ 30:30

* Ben Treynor ran google SRE team for 15 years. Originally a Software engineer at Oracle when it was 400 employee company. Coined the term SRE in 2004. 
* Just found principles and practices that can be used across any services at any scale.

**SRE Practices**    

  * SLO : Balancing stability & agility 
    - SLO : You want to able to measure what your actual end-user experience is and you want to have an opinion about what performance would be sufficient for most of your users to like your product. Measure you application as your end user sees it. 
  * Error budgets
    - Goal is not perfect availability
    - Any device is not 100% reliable and communicate systems are not 100% reliable 
    - Engineering cost of 5 nines and perfect is immense and drag on feature velocity is immense. 
  * Blameless postmortem
    - You have good hiring process to identify people who are intelligent, smart, well-intentioned and despite all that something went wrong. 
    - Look at how your system works and easier for people who are looking at it to fix. 
    - Figure out, how less likely to break 
	
  * Capping and Eliminating toil
    - There is no later, there is only now. 
    - Toil is like technical debt, but easier to measure
    - There will be always features one after another which is already slightly behind
    - Toil, human work to do something, that work does not make tomorrow better, but you will have to do it again. 
    - Toil is another budget you have to manage. 
    - @Google toil is capped at 50%, you cant have team spending more than half of its time on sort of non-repeatable human actions to support various interesting features and snowflakes and so on. Rest of the time has to be spent making the service better building production infrastructure and etc. 
    - When you view it as a budget, you can ask where am I going to spend my toil budget. You can spend it on something new and hard for which you don't know how to do it automatically yet. Fraction of your development time will be spent on  deploying projects to get rid of this toil, where its now easier
    - This is a cycle. 
		
	There are two options,     

    1. Your service is not successful, you business goes under and none of this matters
    2. Your service is successful and toil typically grows roughly linearly with the size of your business. If your team is 50% occupied with toil and not doing anything to fix it and your business doubles, you will need more SREs, not a good plan. 

Toil typically involves continuous investment, but absolutely is the right path. 

You don't need new people to do SRE
  * No need new people to do SRE or Devops or these practices, you need software engineers who will be bored, if you ask them to do same thing over and over again, they should have the right mindset to say, how do I make the machine to do all this boring work. These are practices and guidances on how to do that effectively.  
  * No new tooling
  * Not just for cloud-native
	
There is no such thing as SRE Vs. Devops. SRE is a more specific implementation of general class of DevOps. Both are complimentary ideas. 

Things you can do today to implement SRE
  * Write our first SLOs and dogfood them. Don't go for the SLO that's convenient, go for SLO that customers care about.  
  * Identify our top source of toil and start a project to remove them. Just pick highest ROI, easy to fix, occupies lots of people time because it gets done a lot. Start a project to fix that. 
  * Conduct & publish a blameless postmortem on a recent outage. 
    - Where the conclusions are, we should fix the following in the system, less likely to fail, more likely to provide good diagnostic information when it does fail, make the failure less severe, make the failure shorter.  

##### SLIs, SLOs, SLAs, oh my! (class SRE implements DevOps) - Seth Vargo, Liz Fong-Jones 
* Define what availability is
* What an appropriate level of availability is
* What we are going to do incase we fail to live upto those standard (plan in case of failure)

This is communicated to everyone in the organization so we are in same page from individual contributors to vice-presidents. 

We do that defining SLO in collaboration with product owners, by agreeing in advance we are making sure there are any confusions. 

Every application has unique set of requirement that dictate how reliable does it has to be before customers no longer notice the difference. That means we can make enough room for error and enough room for features reliably. 

* **SLI** : Metrics over time such as request latency, batch throughput per second, failures per request to total number of request. Aggregated over time and apply a percentile 99th by which we can get a concrete threshold that a single number good or bad.  Eg:- 95th percentile latency of homepage requests over past 5minutes < 300ms. 

* **SLO** : Add SLI or Integrate SLI over period of time like year 99.99% to see if total amount of downtime is more or less than 9minutes. SLOs are ranges. Eg:- 95th percentile homepage SLI will succeed 99.9% over trailing year. 

* **SLA** : Business agreement between customer and service provider typically based on SLOs. Eg:- Service credits if 95th percentile homepage SLI succeeds less than 99.5% over trailing year. 

SLIs drive SLOs which inform SLAs = SLA should be more lenient than SLO so you get early warnings. 

##### Incident Management (class SRE implements DevOps) - Seth Vargo, Liz Fong-Jones 

1. Process for declaring an incident
2. Dashboard for viewing incidents
3. Database of who to contact for each kind of incidents

Depending on the scale of incidents, you need to bring in specialists from other parts of the company 

* Incident Commander(IC) : Responsible for strategic decisions and delegating roles to other responders
* Operations lead (OL) : Who has detailed idea/state of the system like running commands, grabbing log files
* Communications lead (CL) : Communicates status to public, top management and other stakeholders 
* Planning lead (PL) : Writing plan, maintaining running notes document, starting the draft of postmortem
* Logistics lead(LL) : Securing rooms, making sure people has food and water. 

For long running incidents, IC may delegate successor in different zones/regions. Sometimes due to complexity IC can give up role and can become operations lead. 

##### Risk and Error Budgets (class SRE implements DevOps) -  Seth Vargo, Liz Fong-Jones 

SLO dictates the Error budget ( SLO(99.9%) 🡪 Error Budget(43.2 Min / Month)

After exceeding error budget, product team can ask for exception from vice-president which can be given only few times a year. 

Error Budget is must for everything from Top-Bottom in the stack. This way  you can determine how much  error budget you have allocated for your dependencies and how much error budget is allocated for your developers.

![Availability & Error](assets/51-sre10.png)  

System cannot be 100% reliable because all your dependencies cannot be available 100%. 
![Where that error could occur](assets/51-sre11.png)  

* If a server fails and you are manually restarting it that time to restart will also burn error budget. 
* Doing manual tasks comes under a different budget called Toil. 

##### Toil and Toil Budgets (class SRE implements DevOps) - Seth Vargo, Liz Fong-Jones 

| Toil   | Overhead                               |
| :--------- | :---------------------------------------- |
| Running scripts, commands, restarting services | Email, Expense reports, Meetings, Travelling |

* Toil activity must be related to production service. 

* Characteristics of Toil
  - Manual
  - Repetitive
  - Automatable
  - Tactical
  - Devoid of long-term value
  - Scales linearly as service grows

* If  a operator writes down all commands to a script and executes the script instead of running the commands manually, the operator has reduced the amount of toil, since its not automated toil remains. 
* Manually carrying out task in production is toil but writing code to replace that manual action is not toil, its project work. 

Measuring Toil
  * Don't mix toil and project work
  * Account of call time as toil 
  * Survey, sample and log toil

In SRE, 'E' stands for engineering work, that's what lets our organization scale and meet the demands of all application and services we support. 

##### Managing Risks as a Site Reliability Engineer (class SRE implements DevOps)- Seth Vargo, Liz Fong-Jones

Risk Analysis
List of items that may cause an SLO Violation

* Every operations person know how systems have failed in the past and say how system can fail in the future
  - Need to figure out how often each failure is likely to happen and how severe it will be if and when if it does happen ?

![Risk analysis](assets/51-sre12.png)  

**Scenario 1 **   

There is a primary database which needs to be backed up every month which will have 120mins and during that time, it will be offline. 

Bad minutes = 120mins * 12 months * 100% of users = 1440 bad minutes / year

Error Budget = 99.5%

![Error budget](assets/51-sre13.png)  

This backup is consuming half of error budget

**Scenario 2** 

Every two weeks there is a slowness on Friday and it takes 30mins for alerts to come and 30mins to resolve. 

![Bad minutes](assets/51-sre14.png)  

* Catalog all the outages which you encounter in a year like below,

**Calculated Expected Cost**

<sup>TTD : Total Time to Detect; TTR : Total Time to Repair</sup>

![Risk list](assets/51-sre15.png)  

* Prioritize what consumes above 25% of error budget
* There is no way to mitigate all the risks. But now you have this metrics to go to key stakeholders and revisit SLO and get larger error budget. 

##### Observability of Distributed Systems (class SRE implements DevOps) - Seth Vargo, Liz Fong-Jones

* Most of the alerts in the existing system was created due to an outage in the past or to prevent an outage
* Systems need to be observable and observability breaks down to 3 points
  - Structured logs ranging from request logs to debugging logs

Metrics aggregate type data about performance of services such as (Number of queries : counter, Latency : distribution, CPU load : gauge)

![Counters, Gauges and Distribution](assets/51-sre16.png)  

* Traces could include timing and dependency details

##### Postmortems and Retrospectives (class SRE implements DevOps) - Seth Vargo, Liz Fong-Jones

* Postmortem should be machine readable format(metadata), so that you can track improvements in your Incident response management process overtime and identify meta patterns in your outages and build process or technology to prevent or mitigate incidents in the future. 

  Postmortem
    - What systems were affected ? 
    - Who were involved in responding ? 
    - How did we find out about the event ? 
    - When did we start responding ? 
    - What mitigations did we deploy ? 
	
* Use collaborative tools like Google Docs
* Records things as you go as this will help you rollback things which you had done to temporarily repair ? 
* Make sure postmortem is blameless 
	
* In distributed system, there is no single root cause to the problems, there would be more than one contributing factor. So need to write down every abnormal behavior 
	
File issues in issue tracker for each action item to make sure prioritize for future
![Filing issues](assets/51-sre17.png)  

Capture overall themes like, 
  * What went well 
  * What went poorly 
  * What did we get lucky with 
	
Incident response management dashboard reporting 
![Incidents trend](assets/51-sre18.png)  

![Incidents trend](assets/51-sre19.png)  

##### Life of an SRE at Google - JC van Winkel - Codemotion Rome 2017

Source : [Youtube](https://www.youtube.com/watch?v=7Oe8mYPBZmw)

Two nice features of Error Budgets
* Removes major source of DEV-SRE conflict
  - It's a math problem, not a opinion or power conflict
* DEV team will self-police because they are not monolithic 

Fix 1 : Common Staffing Pool 
  * One more SRE = One less developer
    - Say head count = 20( 5 SRE & 15 DEV)
    - If your service is more reliable, you need less SRE and more DEV as you want more features to push
    - If your service is not reliable, you need less DEV and more SRE to make the system reliable. 

Fix 2 : SRE team will have only software engineers ( people who know coding )
  * They speak same language DEV
  * They know what computer can do 
  * They get bored easily

Fix 3 : 50% caps on ops work
  * If ops work is more than 50%, keep DEV team oncall, they built it, they should work on keeping it reliable. 
  * SREs should work on rollout automation
  * Gives time for serious coding

Fix 4 : Keep DEV team in rotation
  * To make them aware of whats going on in production

Fix 5 : Speaking of DEV & Ops work

Fix 6 : SRE Portability
  * No requirement to stick with any project; in fact 
  * This threat is rarely executed, but it is powerful. 

Two goals for each outage :     

  * Minimize impact
  * Prevent recurrence 
    - For a oncall shift, a person cannot have more than outages or handle issues as you need to mitigate, find root cause and write postmortem

Minimize Damage    

  * No NOC ( Network Operation Center - Big room with full of monitors showing live graphs )
  * Good diagnostics 
  * Practice, Practice, Practice
    - Wheel of misfortune

##### Getting Started with SRE - Stephen Thorne, Google

What is SLO ?    

  * How well the system should behave 
  * Specifically tracking customer experience
  * If customers are happy, then the SLO is being met. 


Typical SLOs    

  * Uptime of 99.9% a month(43 minutes of downtime a month)
  * 99.99% of HTTP requests in a month succeed with a 200 OK
  * 50% of HTTP requests returned in under 300ms
  * 99% of log entries are processed in under 5 minutes


Error budget policy (some examples)    

  * No new feature launches allowed
  * Sprint planning may only pull postmortem action items from the backlog
  * DEV team must meet with SRE team daily to outline their improvements

* SRE Principle #1    
    - SRE needs SLO with consequences
* SRE Principle #2
    - SREs have time make tomorrow better than today

Shared Responsibility     

  * Dumping all current production work on a SRE team cannot work 

Regulating workload
  * Give 5% of the ops workload to DEV when SRE has more than 50% of ops work
  * Track SREs project work, if its getting completed on time
  * Analyze new production system, on-board only if they can be safely operated
  * For every problem it needs to go to developer, give pager to developer. 

Leadership buy-in
  * Without leadership buy-in it cannot work 
    - Its required error budget policy 
    - Cap on Toil 
    - Stopping a feature from going to production
  * If you don't have leadership buy-in mostly you will have to loosen your SLO

Automation
  * Eliminate toil - Don't do things over and over
  * Capacity planning - Auto scaling instead of manual forecasting
  * Fix issues automatically - Write the fix in a playbook, you can make computer do it

Site Reliability Engineering at Dropbox
  * Github : Pygerduty has analytics
  * Self-healing systems

Companies
  * LinkedIn
  * Dropbox - Github : Pygerduty has analytics


Other SRE resources
* [Google : Notes from Site Reliability Engineering Book](52-sre-reliability-engineering)
* [Understanding SRE](53-sre-references)
