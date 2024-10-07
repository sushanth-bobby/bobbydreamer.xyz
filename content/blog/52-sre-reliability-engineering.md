---
title: Notes - Google Site Reliability Engineering Book
date: 2020-11-15
description: Notes taken while reading SRE Book
tags:
  - notes
  - sre
slug: "/52-sre-reliability-engineering"
---

Below are notes/points/paragraphs which seemed important to me while reading [Google SRE Book](https://landing.google.com/sre/sre-book/chapters/introduction/). This book is written by various authors from google and in this book they shared their experience of building SRE teams and google products and how they collaborated in making it. 

Books starts with a saying 
> Hope is not a strategy
> -- Benjamin Treynor Sloss, Vice President, Google Engineering, founder of Google SRE

##### Chapter 1 - Introduction 
* Development team want to launch new products and features
* Ops team wants to make sure service doesn't break
* Usually service outage are caused by some kind of change or a new configuration
* Googles rules of thumb is SRE should spend less than 50% of time in Ops and more in development. 
* SREs workloads need to be measured to see where most of the time is spent, if an SRE spends more time in handling Ops work, that workload need to be shifted to development team or more people needed to be added to handle this high Ops work, so SREs workload can be balanced. This redirection ends when Ops workload drop back to 50% or less. This provides an effective feedback mechanism, guiding developers to build systems that don't need manual intervention. 

Notes : 
* need for better documentation on how issues are resolved, it would easier in that case when the workload is transferred to development team

* Characterization of SRE work, 
  - Rapid innovation and making system run themselves and enough to repair itself 
  - In hiring, an SRE will have same skills as engineers hired for development but bar for an SRE is set so high in terms of coding, system engineering, new ideas for automation, only few can be recruited. 
  - SRE team is responsible for the availability, latency, performance, efficiency, change management, monitoring, emergency response, and capacity planning of their service(s).
  - SRE doesn't typically get involved in constructing SLAs as they are tied to business and products. SRE are more involved in defining SLI and helping to avoid SLO getting triggered.  

* SRE team would require strong management support to take decision to stop relases for rest of the quarter due to error budgets being depleted. 

* Postmortems is must for all incidents regardless they are oncall in called-out or not. Full RCA(Root cause analysis) must be specified and on solution and instructions on how to address it next time. And most importantly it must be blame-free and goal should be exposing faults and applying engineering to fix these faults. 

* 100% is a wrong reliability target for a system. What is the right reliability target for the system ? Need to be asked. Following should be taken into considerations : 
1. What level of availability will the users be happy with, given how they use the product?
1. What alternatives are available to users who are dissatisfied with the product's availability?
1. What happens to users' usage of the product at different availability levels?

* Once the availability target is established, error budget is minus the availability target. A service that's 99.99% available is 0.01% unavailable. That permitted 0.01% unavailability is the service's error budget. We can spend the budget on anything we want, as long as we don't overspend it.

* Error budget is spent by launching new features. Ideally, we need to spend error budget by taking risks inorder to launch quickly. 

* The use of an error budget resolves the structural conflict of incentives between development and SRE. SRE's goal is no longer "zero outages"; rather, SREs and product developers aim to spend the error budget getting maximum feature velocity. This change makes all the difference. An outage is no longer a "bad" thing—it is an expected part of the process of innovation, and an occurrence that both development and SRE teams manage rather than fear.

* Monitoring : a system that requires a human to read an email and decide whether or not some type of action needs to be taken in response is fundamentally flawed. Instead, software should do the interpreting, and humans should be notified only when they need to take action.

* Alerting : Three types of alerting
1) Alerting : Take action immediately(Email alerts are very limited value for real-time alerting but great for informational purpose)
2) Tickets : Action not immediate/System cannot handle automatically handle the situation
3) Logging : No need to look at this info, its just for diagnostic purposes. 

Emergency Response : The most relevant metric in evaluating the effectiveness of emergency response is how quickly the response team can bring the system back to health—that is, the MTTR.

* Humans add latency. Even if a given system experiences more actual failures, a system that can avoid emergencies that require human intervention will have higher availability than a system that requires hands-on intervention.

* When humans are necessary, we have found that thinking through and recording the best practices ahead of time in a "playbook" produces roughly a 3x improvement in MTTR as compared to the strategy of "winging it." The hero jack-of-all-trades on-call engineer does work, but the practiced on-call engineer armed with a playbook works much better. 

* Change management : Nearly 70% outages are caused due to changes. Best practices in this domain use automation to accomplish the following:

  * Implementing progressive rollouts
  * Quickly and accurately detecting problems
  * Rolling back changes safely when problems arise

##### Chapter 2 - The production Environment at Google. 
* Google terminology
* Data center topology
* About Borg. Protocol Buffers(protobufs : data is 10 times smaller and transfer is 20 to 100 times faster.)

##### Chapter 3 : Embracing risks 
* In SRE, we manage service reliability largely by managing risk. Our goal is to explicitly align the risk taken by a given service with the risk the business is willing to bear. We strive to make a service reliable enough, but no more reliable than it needs to be. That is, when we set an availability target of 99.99%,we want to exceed it, but not by much: that would waste opportunities to add features to the system, clean up technical debt, or reduce its operational costs. In a sense, we view the availability target as both a minimum and a maximum. The key advantage of this framing is that it unlocks explicit, thoughtful risktaking.

* Expressing service risk availability in terms of nines. 99.999%. Each additional nine corresponds to an order of magnitude improvement toward 100% availability. 
  Example : Time-based availability 
  availability = uptime / (uptime + downtime)

  Here eg:- 99.99% means in a year system can be down up to 52.56 minutes. 

  Above time-based metric can be used as an example but its not meaningful other than that scenario. At Google, we define availability in terms of the request success rate.

  Aggregate availability = successful requests / total requests 

  For example, a system that serves 2.5M requests in a day with a daily availability target of 99.99% can serve up to 250 errors and still hit its target for that given day.

  << See how availability needs to be seen, as a whole in perspective of a company or by each application >>

* Risk tolerance : SREs must work with business owners to turn business goals into explicit objectives which we can engineer. Mostly the business goals are about performance and reliability.

  There are many factors to consider when assessing the risk tolerance of services, such as the following:

  * What level of availability is required?
  * Do different types of failures have different effects on the service?
  * How can we use the service cost to help locate a service on the risk continuum?
  * What other service metrics are important to take into account?

* Target level of availability, usually depends on the function it provides and how the service is positioned in the marketplace. The following list includes issues to consider:

  - What level of service will the users expect?
  - Does this service tie directly to revenue (either our revenue, or our customers' revenue)?
  - Is this a paid service, or is it free?
  - If there are competitors in the marketplace, what level of service do those competitors provide?
  - Is this service targeted at consumers, or at enterprises?

  In determining the availability target for each service, we ask questions such as:

  - If we were to build and operate these systems at one more nine of availability, what would our incremental increase in revenue be?
  - Does this additional revenue offset the cost of reaching that level of reliability?

  To make this trade-off equation more concrete, consider the following cost/benefit for an example service where each request has equal value:

  - Proposed improvement in availability target: 99.9% → 99.99%
  - Proposed increase in availability: 0.09%
  - Service revenue: $1M
  - Value of improved availability: $1M * 0.0009 = $900
  
  In this case, if the cost of improving availability by one nine is less than $900, it is worth the investment. If the cost is greater than $900, the costs will exceed the projected increase in revenue.

* Motivation for Error Budgets : Tensions between product development teams and SREs. Product development performance is largely evaluated on product velocity, which creates an incentive to push new code as quickly as possible. Meanwhile, SRE performance is (unsurprisingly) evaluated based upon reliability of a service, which implies an incentive to push back against a high rate of change.

* Canary duration and size
It's a best practice to test a new release on some small subset of a typical workload, a practice often called canarying. How long do we wait, and how big is the canary?

* Forming Your Error Budget : The error budget provides a clear, objective metric that determines how unreliable the service is allowed to be within a single quarter. This tells how much risk to allow. 

* Product management defines an SLO of how much uptime a service can have in the quarter. When Monitoring team gives the actual uptime. The difference between these two numbers is the "budget" of how much "unreliability" is remaining for the quarter. As long as there is error budget remaining—new releases can be pushed.

* As long as the system's SLOs are met, releases can continue. If SLO violations occur frequently enough to expend the error budget, releases are temporarily halted while additional resources are invested in system testing and development to make the system more resilient, improve its performance, and so on. Even if the outage is caused by network outage, it will eat your error budget as everyone shares the responsibility for the uptime. 

##### Chapter 4 - Service Level Objective(SLO)
* Service level indicators (SLIs), objectives (SLOs), and agreements (SLAs) provide basic metrics that matter. 

* SLI : A quantitative measure of a level of service. Some common SLIs are request latency, error rate, availability, durability. 

* SLO : SLO could be a target value measured by SLI metric (or) it can also be a range. Setting an SLO could inturn motivate you to write your frontend with low-latency behaviors of various kinds or to buy certain kinds of low-latency equipment. If SLOs are met 100% of time, it would reduce innovation

* SLA : SLAs are agreements which when not met one can impose penalty and this penalty could be financial or in other forms(). An easy way to tell the difference between an SLO and an SLA is to ask "what happens if the SLOs aren't met?": if there is no explicit consequence, then you are almost certainly looking at an SLO.  

* Services tend to fall in few broad categories and here are some SLI relevant to that category
  - UI System : Availability, latency and throughput. In other words: Could we respond to the request? How long did it take to respond? How many requests could be handled?

  - Storage systems : latency, availability and durability. How long does it take to read or write data? Can we access the data on demand? Is the data still there when we need it?

  - Big data systems : throughput and E2E latency. In other words: How much data is being processed? How long does it take the data to progress from ingestion to completion? 

* Control Measures : SLIs and SLOs are crucial elements in the control loops used to manage systems:

  1. Monitor and measure the system's SLIs.
  2. Compare the SLIs to the SLOs, and decide whether or not action is needed.
  3. If action is needed, figure out what needs to happen in order to meet the target.
  4. Take that action.
  For example, if step 2 shows that request latency is increasing, and will miss the SLO in a few hours unless something is done, step 3 might include testing the hypothesis that the servers are CPU-bound, and deciding to add more of them to spread the load. Without the SLO, you wouldn't know whether (or when) to take action.

##### Chapter 5 : Elminating Toil 
* what is toil? Toil is the kind of work tied to running a production service that tends to be manual, repetitive, automatable, tactical, devoid of enduring value, and that scales linearly as a service grows. Not every task deemed toil has all these attributes.

* At least 50% of each SRE's time should be spent on engineering project work that will either reduce future toil or add service features. Feature development typically focuses on improving reliability, performance, or utilization, which often reduces toil as a second-order effect.

Notes :
* Work survey can be conducted to know how much operational work are handled in their day to day life by developers and administrators. 

* Engineering work is novel and intrinsically requires human judgment. It produces a permanent improvement in your service, and is guided by a strategy. It is frequently creative and innovative, taking a design-driven approach to solving a problem—the more generalized, the better. Engineering work helps your team or the SRE organization handle a larger service, or more services, with the same level of staffing.

* Typical SRE activities fall into the following approximate categories:
  * Software Engineering - All automation works and related documentation works. 
  * System Engineering - Infrastructure upgrades which are one-time activity 
  * Toil - running a service manually 
  * Overhead - Administrative work not tied directly to running a service. Examples include hiring, HR paperwork, team/company meetings, bug queue hygiene, snippets, peer reviews and self-assessments, and training courses.

Why too much toil is bad ? 
* Career stagnation
* burnout and boredom and discontent.
* Slows progress

##### Chapter 6 : Monitoring and Distributed Systems 
* Monitoring and Alerting should tell if system is broken or about to break. 
* Paging a human is expensive as it would interupt his workflow. 
* Every page that happens today distracts a human from improving the system for tomorrow

* In SRE team of 10-12 members, 2 members primary assignment is to build and maintain monitoring systems. 

* Monitoring systems should address two questions, i) Whats broken ii) Why ?

* in a multi-tiered system, one person's symptom is another person's cause.

* When debugging, white-box monitoring is essential.

* The Four Golden Signals, if a monitoring system is programmed to page a human even when one signal is triggered, service can be decently covered. 
  - Latency : The time it takes to service a request. It's important to distinguish between the latency of successful requests and the latency of failed requests.

  - Traffic : A measure of how much demand is being placed on your system

  - Errors : The rate of requests that fail, either explicitly

  - Saturation : How "full" your service is. saturation can be supplemented with higher-level load measurement: can your service properly handle double the traffic, handle only 10% more traffic

* Distributing the histogram boundaries approximately exponentially (0-10ms, 10-30ms, 30-100ms) is often an easy way to visualize the distribution of your requests.

* If your monitoring goal calls for high resolution but doesn't require extremely low latency, you can reduce these costs by performing internal sampling on the server, then configuring an external system to collect and aggregate that distribution over time or across servers.

As Simple as Possible, No Simpler, keep following in mind, 
  - The rules that catch real incidents most often should be as simple, predictable, and reliable as possible.
  - Data collection, aggregation, and alerting configuration that is rarely exercised (e.g., less than once a quarter for some SRE teams) should be up for removal.
  - Signals that are collected, but not exposed in any prebaked dashboard nor used by any alert, are candidates for removal.

##### Chapter 7 : The Evolution of Automation at Google
Consistency is in many ways the primary value of automation. 

* Faster repairs : If automation runs regularly and successfully enough, the result is a reduced mean time to repair (MTTR) for those common faults.

* A Hierarchy of Automation Classes
1) No automation
Database master is failed over manually between locations.

2) Externally maintained system-specific automation
An SRE has a failover script in his or her home directory.

3) Externally maintained generic automation
The SRE adds database support to a "generic failover" script that everyone uses.

4) Internally maintained system-specific automation
The database ships with its own failover script.

5) Systems that don't need any automation
The database notices problems, and automatically fails over without human intervention.

##### Chapter 8 : Release Engineering 
* Release engineers should have solid understanding of source code management, complilers, build configuration languages, automated build tools, package managers and installers. Their skills should include deep knowledge of multiple domains: development, configuration management, test integration, system administration, and customer support.

* Self-service model : In order to work at scale, teams must be self-sufficient. Product development teams control and run their own release processes. Release processes can be automated to the point that they require minimal involvement by the engineers

* High Velocity : We have embraced the philosophy that frequent releases result in fewer changes between versions. This approach makes testing and troubleshooting easier.

* Hermetic Builds : Build tools must allow us to ensure consistency and repeatability.

**Enforcement of Policies and Procedures**    

Several layers of security and access control determine who can perform specific operations when releasing a project. Gated operations include:

  - Approving source code changes—this operation is managed through configuration files scattered throughout the codebase
  - Specifying the actions to be performed during the release process
  - Creating a new release
  - Approving the initial integration proposal (which is a request to perform a build at a specific revision number in the source code repository) and subsequent cherry picks
  - Deploying a new release
  - Making changes to a project's build configuration

Almost all changes to the codebase require a code review, which is a streamlined action integrated into our normal developer workflow. 

* Continous build development 
  - Discusses two internal tools used by google ( Rapid, Blaze )
  - Blaze : Build tool, input is a program and language of your chose and output is expected respective output file like JAR for java. 
  - Branching : Major project don't merge with mainline. Bugfixes are submitted to the mainline which are cherry-picked and applied to the branch. 
  - Testing : Continous test system runs unit tests against the code that is submitted in the mainline. Allowing to detect build and test failures quickly. 
  - Packaging : Software is distributed to our production machines via the Midas Package Manager

##### Chapter 9 : Simplicity
* SREs work to create procedures, practices, and tools that render software more reliable. 
* SRE's experience has found that reliable processes tend to actually increase developer agility: rapid, reliable production rollouts make changes in production easier to see.
* Boring is a desirable property of a code running in production. 
* Minimize complexity in systems. 
* Routinely remove dead code, build bloat(bigger s/w tend to get slower as new features are added to it) detection into all levels of testing, scrutinize code so that it actually drives business goals. 
* SRE perspective: every line of code changed or added to a project creates the potential for introducing new defects and bugs. A smaller project is easier to understand, easier to test, and frequently has fewer defects.

> perfection is finally attained not when there is no longer more to add, but when there is no longer anything to take away. > - Antoine de Saint Exupery

* Write simple APIs 
* Modularity : Loose coupling should be the rules of thumb that applies to distributed systems. 
* In data formats google uses Protocol Buffer which is backward and forward compatible. 

PART III : Practices 
SRE run services which are operated by internal/external customers and they are responsible for health of these services. SREs activities include : 
* Developing monitoring systems 
* Planning capacity 
* Responding to incidents 
* Ensuring root causes of outages are addressed 

![SRE Hierarchy](sreh.jpeg "SRE Hierarchy")

* Monitoring : Way to tell the service is even working 
* Incident response : Its a tool we use to achieve our larger mission 
* Postmortem and Root cause analysis : Blameless postmortem culture is the first step in understanding what went wrong. Tracking outages helps SRE team to keep track of incidents and actions taken in response. 
* Testing : Once we understand what tends to go wrong, our next step is attempting to prevent it. Test cases should be built around it to test limitations. 
* Capacity Planning : Should have automated tools for capacity planning and we should utilitse capacity properly which we have estimated. 
* Development : One of the key aspects of Google's approach to Site Reliability Engineering is that we do significant large-scale system design and software engineering work within the organization. Eg: Distributed Cron System which can scale whole datacenter and beyond, Data Processing Pipelines from one-shot MapReduce jobs running periodically to systems that operate in near real-time.
* Product : Finally a reliable product launches at scale.

##### Chapter 10 : Practical Alerting from Time-Series Data
* Monitoring systems should be designed to aggregate signals and prune outliers. Being alerted for single-machine failure is unacceptable. 
* Monitoring systems should alert for high-leel service objectives but needs to retain granualrity to inspect individual components as needed. 

* Borgmon is the googles internal monitoring tool(Prometheus shares many similarities). 
* Borgmon facilitates mass collection of metrics and can collect from other Borgmon, aggregating and summarizing information and discarding some strategically at each level.
* From experience Borgmon team has found that alerts can "flap" ( toggle their stsate quickly ), so borgmon rules allow a minimum duration for which the alerting rule must be true before the alert is sent (intermediate state is pending). First time when the rule is triggered it will be in pending state and second time its fired it will be firing state. This firing is handled by alert manager.  

* Two types of alerts (Page-worth send to on-call, sub-critical send to ticket queues)

* White-box monitoring has few downsides, it does not give full picture of the system being monitored. 
  - You are not aware of what users see 
  - You see only the queries that arrive at the target. 
  - the queries that never make it due to the DNS error are invisible. 
  - Queries that got lost due to server crash never make a sound. 
  - Solution : Prober, which runs protocol check against target and reports success or failure message to AlertManager or Borgmon. 

##### Chapter 11 : Being On-call 
* On-call engineers are the guardians of production systems
* On-call engineer should respond according to time agreed to by the team. Typical values are 5mins for user-facing or otherwise highly time-critical services, and 30 minutes for less time-sensitive systems.
* Response times are related to desired service availability, as demonstrated by the following simplistic example: if a user-facing system must obtain 4 nines of availability in a given quarter (99.99%), the allowed quarterly downtime is around 13 minutes

* SRE managers have the responsibility of keeping the on-call workload balanced and sustainable across quantity and quality.

* strive to invest at least 50% of SRE time into engineering: of the remainder, no more than 25% can be spent on-call, leaving up to another 25% on other types of operational, nonproject work.

* During on-call shift, an engineer should have sufficient time to deal with any incidents and follow-up activities such as writing postmortems. Let's define an incident as a sequence of events and alerts that are related to the same root cause and would be discussed as part of the same postmortem. 

* We've found that on average, dealing with the tasks involved in an on-call incident—root-cause analysis, remediation, and follow-up activities like writing a postmortem and fixing bugs—takes 6 hours. 

* It follows that the maximum number of incidents per day is 2 per 12-hour on-call shift.

* Modern research identifies two distinct ways of thinking that an individual may, consciously or subconsciously, choose when faced with challenges: 

  - Intuitive, automatic, and rapid action
  - Rational, focused, and deliberate cognitive functions

When one is dealing with the outages related to complex systems, the second of these options is more likely to produce better results and lead to well-planned incident handling.

* Engineers who are on on-call shouldn't be stressed out as incident can put significant pressure on the engineer and can damage the well-being and can prompt to make incorrect choices that can put availability of service in danger. 

* The ideal methodology in incident management strikes the perfect balance of taking steps at the desired pace when enough data is available to make a reasonable decision while simultaneously critically examining your assumptions.

* Most important on-call resources are : 
    - Clear escalation paths
    - Well-defined incident-management procedures
    - A blameless postmortem culture

* Ideally, symptoms of operational overload should be measurable, so that the goals can be quantified (e.g., number of daily tickets < 5, paging events per shift < 2).

* All paging alerts should also be actionable.

* Sometimes operational overload is not under the control of SRE team. It could be due to a new change brought by development team made system noisy and less reliable. In extreme cases, SRE teams may have the option to "give back the pager"—SRE can ask the developer team to be exclusively on-call for the system until it meets the standards of the SRE team in question. This situation shouldn't happen frequently. 

* Being on-call on a quiet system for long time can lead to confidence issue, both in terms of overconfidence and under confidence as knowledge gaps are discovered only when incident occurs. 

##### Chapter 12 : Effective Troubleshooting
* Formally, we can think of the troubleshooting process as an application of the hypothetico-deductive method given a set of observations about a system and a theoretical basis for understanding system behavior, we iteratively hypothesize potential causes for the failure and try to test those hypotheses.

Process of trouble shooting
![Troubleshooting](tbs.jpeg "Troubleshooting")

* Ineffective troubleshooting are because of a lack of deep system understanding.
  - Looking at symptoms that aren't relevant
  - misunderstanding the meaning of system metrics.
  - Coming up with wildly improbable theories about what's wrong
  - latching on to causes of past problems, reasoning that since it happened once, it must be happening again.
  - Hunting down spurious correlations that are actually coincidences or are correlated with shared causes.

* Remember, your first response to an outage shouldn't be about finding the root cause quickly as possible. Instead, your course of action should be to make the system work as well as it can under the circumstances. This may entail emergency options, such as diverting traffic from a broken cluster to others that are still working, dropping traffic wholesale to prevent a cascading failure, or disabling subsystems to lighten the load. Stopping the bleeding should be your first priority; you aren't helping your users if the system dies while you're root-causing.

* This realization is often quite unsettling and counterintuitive for new SREs, particularly those whose prior experience was in product development organizations.

* Novice pilots are taught that their first responsibility in an emergency is to fly the airplane [Gaw09]; troubleshooting is secondary to getting the plane and everyone on it safely onto the ground. This approach is also applicable to computer systems.

* While you are examining during troubleshooting, you need to be able know what each component is doing in order to understand whether or not its behaving correctly. During examining monitoring systems are good place to start. Graphing time-series and operations on time-series can be an effective way to understand the behavior of specific pieces of a system and find correlations that might suggest where problems began. 

* Logging is also invaluable tool in debugging. Ability to change verbosity level on the fly without restarting the process.  

* Simplifying debugging : Components in a system should have well-defined interfaces and perform known transformations from their input to their output. Then you have to look at their data flow connections between components. Injecting known test data in order to check that the resulting output is expected (a form of black-box testing) at each step can be especially effective during probing and debugging faster. 

* There are also other techniques for debugging like Dividing and conquering, this is well suited for data processing pipelines. Bisection techniques splits the system in half and examines communication paths between components on one side and the other. 

* Negative results should not be ignored or discounted. Realizing you're wrong has much value: a clear negative result can resolve some of the hardest design questions.

* Start to write postmortem, once you've found the factors that caused the problem, it's time to write up notes on what went wrong with the system, how you tracked down the problem, how you fixed the problem, and how to prevent it from happening again. 

* Make troubleshooting easier by Building observability—with both white-box metrics and structured logs—into each component from the ground up

##### Chapter 13 : Emergency Response
* It is important for an organization how engineers respond to emergencies. A proper response takes preparation and periodic, pertinent, hands-on training.

* SREs break our systems, watch how they fail, and make changes to improve reliability and prevent the failures from recurring. Most of the time, these controlled failures go as planned, and the target system and dependent systems behave in roughly the manner we expect. We identify some weaknesses or hidden dependencies and document follow-up actions to rectify the flaws we uncover. However, sometimes our assumptions and the actual results are worlds apart.

* Every incidents should have listing like i) What went well ii) What we learned 

* Some examples on 
  - Test-Induced Emergency
  - Change-Induced Emergency
  - Process-Induced Emergency

* All Problems Have Solutions. If you can't think of a solution, cast your net farther. Involve more of your teammates, seek help, do whatever you have to do, but do it quickly.

* Very importantly, once the emergency has been mitigated, do not forget to set aside time to clean up, write the postmortem and dont' repeat it. 

* Ask big open-ended questions and test and know how systems will react and when you have a solution, think about could the person sitting next to you do the same. 

* When it comes to failures, theory and reality are two very different realms. Until your system has actually failed, you don't truly know how that system, its dependent systems, or your users will react. Don't rely on assumptions or what you can't or haven't tested.

##### Chapter 14 : Managing Incidents
* If you haven't gamed out your response to potential incidents in advance, principled incident management can go out the window in real-life situations.

* Do remember, when incidents are unmanaged, issues can spiral out into bigger problem.

* Roles in incident management 
  - Incident Commander : holds the high-level state about the incident.commander holds all positions that they have not delegated. 
  - Ops lead & team : Work close to commander and operations team should be the only group modifying the system during an incident.
  - Communication : Public face of the incident task force. Their duties most definitely include issuing periodic updates to the incident response team and stakeholders (usually via email), and may extend to tasks such as keeping the incident document accurate and up to date.
  - Planning : The planning role supports Ops by dealing with longer-term issues, such as filing bugs, ordering dinner, arranging handoffs, and tracking how the system has diverged from the norm so it can be reverted once the incident is resolved.

* Best Practices for Incident Management
  - Prioritize.Stop the bleeding, restore service, and preserve the evidence for root-causing.
  - Prepare.Develop and document your incident management procedures in advance, in consultation with incident participants.
  - Trust.Give full autonomy within the assigned role to all incident participants.
  - Introspect.Pay attention to your emotional state while responding to an incident. If you start to feel panicky or overwhelmed, solicit more support.
  - Consider alternatives.Periodically consider your options and re-evaluate whether it still makes sense to continue what you're doing or whether you should be taking another tack in incident response.
  - Practice. Use the process routinely so it becomes second nature.
  - Change it around.Were you incident commander last time? Take on a different role this time. Encourage every team member to acquire familiarity with each role.

##### Chapter 15 : Postmortem Culture: Learning from Failure
* Postmortems should be blameless. A blamelessly written postmortem assumes that everyone involved in an incident had good intentions and did the right thing with the information they had.

* Blameless culture originated in the healthcare and avionics industries where mistakes can be fatal. These industries nurture an environment where every "mistake" is seen as an opportunity to strengthen the system.

* It is important to define postmortem criteria, so everyone know when postmortem is necessary. The triggers could include, 
  - Outages, user-visible downtime 
  - Data loss 
  - Release rollback
  - Traffic rerouting 
  - Resolution time above threshold 
  - Issue/Problem which had been identified manually and incident was raised. 

* Postmortems are mostly written for incidents with large impact, so they miss small frequent impacts which are out of their scope or have poor cost/benefit ratio but could have large horizontal impact. 

* Writing a postmortem is not punishment—it is a learning opportunity for the entire company.

* The primary goals of writing a postmortem are to ensure
  1. incident is documented 
  2. contributing root cause(s) are well understood
  3. effective preventive actions are put in place to reduce the likelihood and/or impact of recurrence

* Postmortem workflow tool should have following features, 
  - Real time collaboration 
  - Open commenting and Annotation system 
  - Email notifications 

* Postmortems should be reviewed for completeness, 
  - Was key incident data collected for posterity?
  - Are the impact assessments complete?
  - Was the root cause sufficiently deep?
  - Is the action plan appropriate and are resulting bug fixes at appropriate priority?
  - Did we share the outcome with relevant stakeholders?

* After reviews, postmortems can be published within internal teams, mailing lists. 

* No postmortem should be left incomplete or unreviewed. In regular meetings it should be checked to close out any ongoing discussions. 


##### Chapter 16 : Tracking outages 
* Improving reliability over time is only possible if you start from a known baseline and can track progress.
* Outalator is a internal google outage tracker which passively receies all alerts sent by our monitoring systems. Allows to annotate, group and analyze this data. One of the feature is combining multiple alerts into a single entity. Features include tagging, most commonly used tags are "cause" and "action". Eg: "cause:network". Also provides cross team visibility on incidents. 
* In weekly meetings, its useful to ask these questions, 
  - How many alerts per on-call shift does this team get?
  - What's the ratio of actionable/nonactionable alerts over the last quarter?
  - Which of the services this team manages creates the most toil?
* Escalator : Google has a internal tool which tracks whether human has acknowledged a notification, if no acknowledgement is received with in a particular configured interval, the system escalates to the next destination ( From primary on-call to secondary on-call ). Its easy to integrate with existing workflows without requiring any change in user behaviour. 

##### Chapter 17 : Testing for Reliability
* One key responsibility of Site Reliability Engineers is to quantify confidence in the systems they maintain. 
  - Past reliability can be measured by historic monitoring data. 
  - Future reliability quantified by mkaing predictions based on past system behaviour. 
* The Mean Time to Repair (MTTR) measures how long it takes the operations team to fix the bug, either through a rollback or another action. This includes repair time and any testing time. Clock doesn't stop till the system is fully functional/repaired.

*  Mean time between failures (MTBF), which measures the the average time a system or component is working properly. The metric is used to track both the availability and reliability of a product. The higher the time between failure, the more reliable the system. The goal is to keep this metric high. 

* Types of software testing 
  - Traditional testing : Testing is performed in test system. Traditional testing begins with
    + Unit testing : Assess separable units(class/function) for the expected behaviour
    + Integration testing : Individual tests are assembled to larger units and verify that it functions correctly. 
    + System testing : End to End testing is performed comes in many flavours. 
      * Smoke tests :Testing of critical behaviour 
      * Performance test : Ensures over time, that system shouldn't degrade performance or become too expensive in term of storage or memory or response shouldn't increase. 
      * Regression tests : Test the system against bugs which the system had earlier encountered and making them as test cases to make sure those same bugs don't creep back into the system. 
  - Production testing : Testing is performed in live system. Production tests are essential for reliable production service, they are also known as black-box testing. 
  
* Rollouts often happen in stages, using mechanisms that gradually shuffle users around, in addition to monitoring at each stage to ensure that the new environment isn't hitting anticipated yet unexpected problems.

* Stress test : Most often components don't gracefully degrade. Engineers use stress tests to find the limits on a web service. Stress test answer questions such as : 
  - How full can a database get before writes start to fail?
  - How many queries a second can be sent to an application server  before it becomes overloaded, causing requests to fail?

* Canary tests : a subset of servers are upgraded to a new version or configuration, monitored for any unexpected behaviours. If anything is found, the modified servers are reverted to know good state. Canary is a sort of a production test where a new code is introduced to production to less traffic. 

* Usually SREs join the team in the middle, so its good to start with questions as below, 
  - Can you stack-rank the components of the system you're testing by any measure of importance?
  - Are there particular functions or classes that are absolutely mission-critical or business-critical? For example, code that involves billing is a commonly business-critical.
  - Which APIs are other teams integrating against?

* Document all reported bugs as test cases. 

* Foundation of strong testing is versioned source control that runs tests every time code is submitted, it buids required infrastructre and software and runs tests and report when test fails to test engineer. 

* Bazel is a internal google tool for performing precise testing. When a change is made to a file, Bazel only rebuilds the part of the software that depends on that file instead of running all the tests at every submit. Bazel runs only tests for submitted code as a result, tests execute cheaper and faster.

* To preform testing at scale, SRE build scalable test tools to perform some of the following, 
  - Retrieving and propagating database performance metrics
  - Predicting usage metrics to plan for capacity risks

* The role of SRE generally includes writing systems engineering tools

##### Chapter 18 : Software Engineering in SRE 
* SRE @Google have developed many tools, to solve internal problems and use cases related to keeping production running. The majority of these tools are related to the overall directive of maintaining uptime and keeping latency low, but take many forms

* SRE know the breadth and depth of google production which allows engineers to design and create software for scalability, graceful degradation during failure and s/w with ability to easily interface with other infrastructure or tools.

* one of SRE's guiding principles is that "team size should not scale directly with service growth."

* Majority of software development within SRE begin as a side project to solve a problem and eventually the product may branch off into one of several possible directions. 

* S/W development projects within SRE provide career development opportunities for SREs and they will be able to balance between on-call work and can provide job satisfaction for engineers 

* Auxon is Google's implementation of an intent-based capacity planning and resource allocation solution.
  - The basic premise of this approach is to programmatically encode the dependencies and parameters (intent) of a service's needs, and use that encoding to autogenerate an allocation plan that details which resources go to which service, in which cluster. If demand, supply, or service requirements change, we can simply autogenerate a new plan in response to the changed parameters, which is now the new best distribution of resources.
  - Precursors to intent : For example, imagine user-facing service Foo, which depends upon Bar, an infrastructure storage service. Foo expresses a requirement that Bar must be located within 30 milliseconds of network latency of Foo. This requirement has important repercussions for where we place both Foo and Bar, and intent-driven capacity planning must take these constraints into account.
  - Requirements might be specified as a request like, "My service must be N + 2 per continent" or "The frontend servers must be no more than 50 ms away from the backend servers." Auxon collects this information either via a user configuration language or via a programmatic API, thus translating human intent into machine-parseable constraints.

* Approximation technique : Don't focus on perfection and purity of solution, especially if the bounds of the problem aren't well known. Launch and iterate. When using approximation technique to help speed development, it's important to undertake the work in a way that allows the team to make future enhancements and revisit approximation.

* As with any product, SRE developed s/w also need to be designed with knowledge of its user and requirements. Real success of SRE developed project is in the buy-in across the organization. SRE need to raise awareness or interest about their product by giving presentation or email announcement. They would also require senior management support. SRE teams also need to plan about adoption support that they will need to give other teams who are adopting their product. 

* Do remember, It takes a long time to build credibility for your software development efforts, but only a short time to lose credibility due to a misstep.

##### Chapter 19 : Load Balancing at the Frontend
<<Did not find anythng related to SRE, may need to revisit>> 

##### Chapter 20 : Load Balancing in the Datacenter
<<Did not find anythng related to SRE, may need to revisit>> 

##### Chapter 21 : Handling Overload 
<<Did not find anythng related to SRE, may need to revisit>> 

##### Chapter 22 : Addressing Cascading Failures
<<Did not find anythng related to SRE, may need to revisit>> 

##### Chapter 23 : Managing Critical State: Distributed Consensus for Reliability
<<Did not find anythng related to SRE, may need to revisit>> 

##### Chapter 24 : Distributed Periodic Scheduling with Cron
<<Did not find anythng related to SRE, may need to revisit>> 

##### Chapter 28 : Accelerating SREs to On-Call and Beyond

Successful SRE teams are built on trust—in order to maintain a service consistently and globally, you need to trust that your fellow on-callers 
* know how your system works
* can diagnose atypical system behaviors
* and are comfortable with reaching out for help
* and can react under pressure to save the day.

* Keep learning linear, cumulative and orderly. 

* Training and permission/access in the system are tied together. As they finish training and assessment, they get more acess("powerups")

* Learning by doing, reverse engineering products and asking questions on how it is done and comparing solutions. 

* Improv Artists : SREs shouldnt be too procedural, they need to analytical, during outage/incident, they need to zoom out and look for different approaches. 

* Five Practices for Aspiring On-Callers
  - A Hunger for Failure: Reading and Sharing Postmortems
  - Disaster Role Playing : Have them participate in Wheel of Misfortune, Walk the plank and game master. These team building and games provide great insight on how incidents are handled and give great learning experiences. 
  - Break Real Things, Fix Real Things : Mini Disaster recoveries. 
  - Documentation as Apprenticeship : on-call learning checklist
  - Shadow On-Call Early and Often : This is the live experience a new on-caller can get and a great front-row seat to learning. Before making the newbie primary on-call, reverse shadowing can be done as well. 

##### Chapter 29 - Dealing with Interrupts
* The concept of flow state143 is widely accepted and can be empirically acknowledged by pretty much everyone who works in Software Engineering, Sysadmin, SRE, or most other disciplines that require focused periods of concentration. Being in "the zone" can increase productivity, but can also increase artistic and scientific creativity. Achieving this state encourages people to actually master and improve the task or project they're working on. Being interrupted can kick you right out of this state, if the interrupt is disruptive enough. You want to maximize the amount of time spent in this state.

* SRE when on-call shouldn't be working on any development projects. But when the ticket count is 0, the person should take on other works like clean-up or updating documentation. 

##### Chapter 30 - Embedding an SRE to Recover from Operational Overload
* To relieve the team, temporarily an additional SRE will be transferred to the overloaded team. This SRE observes the team's daily routine and makes recommendations to improve their practices. This consultation gives the team a fresh perspective on its routines that team members can't provide for themselves.

* Newly embedded SRE will be following below approach in the new team to reduce the overload. 
  - Phase 1: Learn the Service and Get Context
    + Your job while embedded with the team is to articulate why processes and habits contribute to, or detract from, the service's scalability. Remind the team that more tickets should not require more SREs
    + Identify the Largest Sources of Stress
    + Identify knowledge gaps 
    + Team shouldn't ignore problems because they believe "the next big thing", the new software or next version will solve all their problems. 
    + Identify common alerts that aren't diagnosed by either the dev team or SREs  
  -  Phase 2: Sharing Context
    + lay the groundwork for improvement through best practices like postmortems and by identifying sources of toil and how to best address them.
  - Phase 3: Driving Change
    + Team health is a process. Start with the basics like making the team write SLO which will help the team from moving from reactive ops work to healthy long term SRE focus. 
    + Dont simply fix their issues instead assist them in finding useful work, help them build and review their code changes.  

##### Chapter 31 - Communication and Collaboration in SRE
* SRE teams have tremendous diversity as team is made up of people from systems engineering, architectural skills, s/w engineering, project management and they collaborate with various teams like infrastructure, service teams and horizontal product teams. 

* SRE teams serve two masters : Infrastructure teams and product development teams and SRE relationship has to be very strong as they are held responsible for performance of those systems but the reporting lines are different. 

* In SRE teams, communication & collaboration is crucial as how data flow around production, data should flow in reliable ways from one interested party to another.  

* Production meetings are to increase general awareness among everyone who cares, and to improve the operation of the service(s). In this meeting there will be talks in detail about the operational performance of the service, and relate that operational performance to design, configuration, or implementation, and make recommendations for how to fix the problems.

* Production meetings are held daily and SRE teams rotate chair in these meetings as it makes everyone in the team they have a stake in the service. This rotation also improves skills. 

* Sample prodution meeting [agenda](https://landing.google.com/sre/sre-book/chapters/production-meeting/)

* Techniques for Working Effectively
  - Singleton project fails unless the individual is gifted
  - To accomplish anything you pretty much need multiple people. 
  - In general, good SRE work calls for excellent communication skills when you're working outside the boundary of your purely local team. SREs need to have great written communication skills.

* Example of Project Viceroy on how collabortion helped complete the monitoring dashboard framework project. 

* Things to remember, 
  - You should only develop projects cross-site when you have to, but often there are good reasons to have to. The cost of working across sites is higher latency for actions and more communication being required; the benefit is—if you get the mechanics right—much higher throughput. The standard "divide and conquer" strategy helps in splitting up components and individual teams at different sites can work on them.  

  - Motivated contributors are valuable, but not all contributions are equally valuable. Make sure project contributors are actually committed

  - As projects develop, they usually grow, think carefully about the project structure. The project leaders are important: they provide long-term vision for the project and make sure all work aligns with that vision and is prioritized correctly. You also need to have an agreed way of making decisions, and should specifically optimize for making more decisions locally if there is a high level of agreement and trust.

   - Standards are important. Coding style guidelines are a good start. Discuss on the norms and argue, debate on it fully then pick a solution, document it and move on

  - Ultimately, there's no substitute for in-person interaction, if thats not possible. Organize team summits, meetups so that all members of the team can interact in person.

##### Chapter 32 - The Evolving SRE Engagement Model
* When SRE is engaged during the earliest stages of design, the time to onboard is lowered and the service is more reliable "out of the gate," usually because we don't have to spend the time unwinding suboptimal design or implementation.

* A Production Readiness Review is considered a prerequisite for an SRE team to accept responsibility for managing the production aspects of a service. 
  - Review verifies if the service meets accepted standards of production setup and operational readiness. 

* SRE is concerned with several aspects of a service, which are collectively referred to as production. These aspects include the following:

  - System architecture and interservice dependencies
  - Instrumentation, metrics, and monitoring
  - Emergency response
  - Capacity planning
  - Change management
  - Performance: availability, latency, and efficiency

* For some services, SRE can't provide full-fledged support, in that case, SRE team recommends other options like, 
  - Development guide 
  - Best practices 
  - Solutions & Recommendations 
  - Consultations : Developers can engage with SRE team any time. 

Other SRE resources
* [Taken while watching youtube videos](51-sre-notes-from-youtube)
* [Understanding SRE](53-sre-references)
