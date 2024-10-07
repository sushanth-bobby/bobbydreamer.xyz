---
title: Understanding SRE
date: 2020-11-15
description: Contains SRE References and Study materials.
tags:
  - notes
  - sre
slug: "/53-sre-references"
---

**Last updated** : 10/April/2021

Traditionally in legacy software industry which followed SDLC(Software Development Life Cycle) had very long release cycles. Simplistically to say there were two major platforms. *Development* handled all the application,  programming and adding features/functions related to the business and *Infrastructure*/*Operations* handled all the databases, network, hardware and support side of the business. These two platforms worked independently and sometimes were located in different buildings or cities like development teams were more close to business and infrastructure/operations worked near data centers. To deliver changes swiftly various methodologies were adopted and we will quickly see some of them. 

##### About Agile
In early 2000s, Agile software development methods were popularized and soon they became industry standards. Agile majorly focused on breaking product development into small increments that minimize the amount of up-front planning and design. Iterations, or sprints, are short time frames that typically last from one to four weeks. Each iteration involves a cross-functional team working in all functions: planning, analysis, design, coding, unit testing, and acceptance testing. At the end of the iteration a working product is demonstrated to stakeholders. This minimizes overall risk and allows the product to adapt to changes quickly. Goal here is to have a workable product with minmal functionality and bugs. This entire cycle will be repeated multiple times to make a full product or add new features. 

The Manifesto for Agile Software Development is based on twelve principles:
1. Customer satisfaction by early and continuous delivery of valuable software.
2. Welcome changing requirements, even in late development.
3. Deliver working software frequently (weeks rather than months)
4. Close, daily cooperation between business people and developers
5. Projects are built around motivated individuals, who should be trusted
6. Face-to-face conversation is the best form of communication (co-location)
7. Working software is the primary measure of progress
8. Sustainable development, able to maintain a constant pace
9. Continuous attention to technical excellence and good design
10. Simplicity—the art of maximizing the amount of work not done—is essential
11. Best architectures, requirements, and designs emerge from self-organizing teams
12. Regularly, the team reflects on how to become more effective, and adjusts accordingly

##### About DevOps
DevOps is a set of practices that combines software development (Dev) and IT operations (Ops). It aims to shorten the systems development life cycle and provide continuous delivery with high software quality. Several DevOps aspects came from the Agile methodology. IT performance can be measured in terms of throughput and stability. Throughput can be measured by deployment frequency and lead time for changes; stability can be measured by mean time to recover.

![DevOps](assets/53-devops1.png)  

Goals of DevOps were,
* Improved deployment frequency - Deployment frequency were increased by Continous integration and continous deployment(CI/CD) and using version control for all production artifacts. 
* Shortened lead time between fixes - Lead times were reduced by using Automated testing and version control
* Faster mean time to recovery (in the event of a new release crashing or otherwise disabling the current system) - Increased tooling on monitoring system and application health. 
* Faster time to market
* Lower failure rate of new releases

DevOps brought cultural change in the organizations where it was adopted as more and more developers, testers and operations started to collaborate frequently to deliver more changes. As DevOps is intended to be a cross-functional mode of working, developers/testers/operations shared the tools which they were using during product development lifecycles. 

1. **Coding** – code development and review, source code management tools, code merging(eg., Git, Bitbucket)
2. **Building** – continuous integration tools(e.g. Jenkins, Gitlab, Bitbucket pipelines)
3. **Testing** – continuous testing tools that provide quick and timely feedback on business risks(eg., ACCELQ, Eggplant, Parasoft, Tricentis)
4. **Packaging** – artifact repository, application pre-deployment staging(eg., npm, pip, Gradle, Maven)
5. **Releasing** – change management, release approvals, release automation(eg., IBM UrbanCode Deploy, Puppet Enterprise) 
6. **Configuring** – infrastructure configuration and management, infrastructure as code tools(e.g., Terraform, Ansible, Puppet)
7. **Monitoring** – applications performance monitoring, end-user experience.

The main practices that DevOps advocated were,   
* Reduce organization silos
* Accept failure as normal
* Implement gradual change
* Leverage automation and tooling
* Measure everything

Success of DevOps introduced various subsets like :    
* **ArchOps** : States that architectural models are first-class entities in software development, deployment, and operations.
* **TestOps** : Focuses on accelerating the practice of software testing includes test planning, managing test data, controlling changes to tests, organizing tests, managing test status, and gaining insights from testing activities to inform status and process improvements.
* **DataOps** : DataOps seeks to integrate data engineering, data integration, data quality, data security, and data privacy with operations.
* **DevSecOps** : DevSecOps is an augmentation of DevOps to allow for security practices to be integrated into the DevOps approach.
* **GitOps** : GitOps is centered around using a version control system (such as Git) to house all information, documentation, and code for a Kubernetes deployment, and then use automated directors to deploy changes to the cluster. 

##### Introducing SRE

In a system, when any features are being introduced and its benefits could be, from small to medium and to customers changes could be invisible to visible but when it breaks, if the side-effects are severe and clearly visible thats a fragile system. Banking systems or any systems having large number of customers and when being essential to society should be exact opposite of fragile, it should be between robust and durable but not too robust or durable.

* Fault-tolerant
* Servers may go "red" but services should be always green

One of the reasons, that production failures happen could be, developers have less visibility of production systems in monitoring and handling incidents.

DevOps & SRE might have originated around the same time but in different worlds like DevOps was adopted and followed by many organizations and open-source communities around the world whereas SRE was founded and practiced by only one organization in the world(ie., Google) and they called it as their *'Secret Sauce'*.

**Site Reliability Engineering (SRE)** is a discipline that incorporates aspects of software engineering and applies them to infrastructure and operations problems. The main goals are to create scalable and highly reliable software systems. 

> what happens when a software engineer is tasked with what used to be called operations    
> -- Ben Treynor, founder of Google's Site Reliability Team    

SRE role is focused on intelligent decision making in order to improve service reliability, SRE provides framework for measurement that outlines practices for monitoring for incident response and for capacity planning. SREs will have to work with different people from different teams to understand their terminologies to make their imprecise language, quantify and make competing objectives, actionable and prioritize them. Using SRE framework we can define reliability and deliver user experience in precise terms and making all the conversations we had with different teams effective and make smarter decisions.

Members of development and operations team have to ask hard questions to higher management such as *"Should we spend our time in adding new features or making systems more reliable ?"*, there will be many viewpoints from different stakeholders as everybody has different perspective but most of the time, but one notable finding is everybody till that point had assumed system is built reliably and its proven many times its not unless one builds the capability to make the system reliable. When you look at a service from a customer perspective, they will always choose reliable service over unreliable ones and reliability is the major differentiating factor between competitors.

An SRE organization's goal is keeping toil below 50% for each SRE and by doing so they make time for development and engineering tasks. **Toil** is *"the kind of work tied to running a production service that tends to be manual, repetitive, automatable, tactical, devoid of enduring value, and that scales linearly as a service grows"*, and can be thought of as the result of operational technical debt. SREs time involves both ops work (tickets, on-call & manual tasks) and development work (tooling, monitoring and automation) and over period of time ops work for each system should decrease.

**SRE Workload Lifecycle**

* 50% time in Ops and 50% time in Dev - Ideal start at the beginning
* 80% time in Ops and 20% time in Dev - Not a good state. 50% Operational threshold is crossed, so 30% of Ops work has to be shifted to development team.
* 25% time in Ops and 50% time in Dev - Ideal end state. Assuming there are no performance issues, SRE team can take new project works (or) SREs are free to transfer to other SRE teams with open headcount.

SREs main focus is to increase reliability, they do that by talking with various business stakeholders and monitoring customer usage to negotiate a realistic reliability percentage. For example, after various discussions SRE and Platform come to an availability level say 99.99% in that case below table shows how much downtime that system can have.

| Availability level | per year     | per quarter   | per month    | per week     | per day      | per hour     |
|--------------------|--------------|---------------|--------------|--------------|--------------|--------------|
| 99.99%             | 52.6 minutes | 12.96 minutes | 4.32 minutes | 60.5 seconds | 8.64 seconds | 0.36 seconds |

This permitted downtime is the Error Budget(100% - 99.99% = 0.01%) and when we have enough error budget to spend, we can use it to,
* Release new features
* Upgrade infrastructures/software upgrades
* Risky experiments

Other events/activities that eat up the Error Budget are,
* Infrastructure failures (software, hardware, database, networks, etc)
* Application downtime

When the Error budget is exhausted, development team and SRE can work on tasks which improves reliability of the application until Error budget is replenished,
* Slow down feature releases
* Prioritize postmortem items
* Automate deployment pipelines
* Improve monitoring and observability

SREs want to set precise numerical targets(99.99%) for system availability by setting **Service Level Objectives(SLO)** and going forward in any discussions we have in the future about whether the system is running reliably, any design or architectural changes we should make it a point that our system meets this SLO. 

Example of an SLO is *"99.99% of requests will be completed in 100ms"*.

SLO is based on **Service Level Indicator(SLI)** which are metrics over time such as request latency, batch throughput per second, failures per request to total number of request. Aggregated over time and apply a percentile 99th by which we can get a concrete threshold that a single number good or bad. 

Example of SLI is *95th percentile latency of homepage requests over past 5minutes < 100ms*.

A **Service Level Agreement(SLA)** is a business agreement based on SLO. In general, SLA is a contract explicitly stating the consequences of failing to achieve your defined SLOs. Example of SLA *"If 99.95% of your system requests aren't completed in 100ms, you get fined/refund."*

SLOs are always set to be more stringent than SLAs as they provide a safety buffer time to ensure that issues are addressed before the user experience becomes unacceptable. For example, you may have an agreement with your stakeholder/customer that the service will be available 99.95% of the time each month. You could then set an internal SLO where alerts activate when availability dips below 99.99%. This provides you a significant time buffer(21.6 minutes - 4.32 minutes = 17.28 minutes) to resolve the issue before violating the agreement. 

|   *  | Availability level | per year     | per quarter   | per month    | per week     | per day      | per hour     |
|------|--------------------|--------------|---------------|--------------|--------------|--------------|--------------|
| SLO  | 99.99%             | 52.6 minutes | 12.96 minutes | 4.32 minutes | 60.5 seconds | 8.64 seconds | 0.36 seconds |
| SLA  | 99.95%             | 4.38 hours   | 1.08 hours    | 21.6 minutes | 5.04 minutes | 43.2 seconds | 1.8 seconds  |


Another example, if we have 144 million transactions per day with a 99.9% uptime SLO, our combined method would give this service an SLO that defines 99.9% uptime something like this:

*"The service will be available and process requests for at least 1439 out of 1440 minutes each day. Each minute, at least 99.9% of the attempted transactions will be processed. A given minute will be considered unavailable if a system outage prevents the number of attempted transactions during that minute from being measured, unless the system outage is outside of our control."*

Using this example, we would violate this SLO if the system is down for 2 minutes (consecutive or non-consecutive) in a day, or if we fail more than 100 transactions in a minute (assuming 100,000 transactions per minute).

Do remember more nines you add to reliability, the system becomes more complex and cost to operate. 

![SRE Practices](assets/53-sre-practices.png)  


##### DevOps vs. SRE
SRE satisfies the DevOps pillars as follows:

| DevOps                          | SRE                                                                                                                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reduce organizational silos     | - SRE shares ownership with developers to create shared responsibility. <br/> - SREs use the same tools that developers use, and vice versa                                                                       |
| Accept failure as normal        | - SREs embrace risk <br/> - SRE quantifies failure and availability in a prescriptive manner using Service Level Indicators (SLIs) and Service Level Objectives (SLOs) <br/> - SRE mandates blameless postmortems |
| Implement gradual changes       | - SRE encourages developers and product owners to move quickly by reducing the cost of failure                                                                                                                |
| Leverage tooling and automation | - SREs have a charter to automate manual tasks (called *"toil"*) away                                                                                                                                           |
| Measure everything              | - SRE defines prescriptive ways to measure values <br/> - SRE fundamentally believes that systems operation is a software problem                                                                               |

**DevOpsTopologies : SRE Team (Google Model)**    

![Where SRE fits](assets/53-devops-sre-model.png)  

From above picture is not a *Venn Diagram*, some people misunderstand it is, consider it as area circles then it will be easy to understand that DevOps and SRE focus on different areas i.e., DevOps focuses on Software Development and SRE focuses on Production Management. These two subject are not competing against each other but share similar core values and have unique practices. Further note that SRE is a specific implementation of the DevOps philosophy. As DevOps is relatively silent on how to run operations at a detailed level while SRE is considerably more prescriptive in its practices. Technically to say "Class SRE implements DevOps".

DevOps focuses on improving the CI/CD pipeline, from development to delivery by establishing feedback cycles, reducing handoffs and increasing collaboration. SRE is focused on  operational infrastructure, and could be considered a silo under strict DevOps philosophy.

##### Why SRE ?
In a realistic sense, something is always/right-now failing in production ? Question is ?

1. How did you find out about the failure ? (Ops team/Social media/customer complaint)
2. What was the impact to your customers ? Not able to login, couldn't transfer money, wrong balance is getting displayed, application is slow.
3. How did the organization respond ? Deploy experts to troubleshoot the problem and how long will it take to assemble, how long will the troubleshooting analysis process will take and when will it get fixed.

Regardless of what we learn and what next steps we capture, how does the organization respond. Do we prioritize that work that our investigation uncovered. Does that work end up on our backlog or that exist only in our RCA(root cause analysis) document. If it ends up in backlog, who is responsible for prioritizing it and getting it actually done ?

SRE focuses his work to solve the last mile problem from within the organization. Starts from understanding, who the users are ? whose is using our systems ? what goals do they have ? how do we know they are progressing towards meeting those goals. SRE tries to focus the metrics from customer perspective using *"Customer User Journey"*. 

![Customer User Journey](assets/53-cuj.png)  

Using this CUJ as reference points, SRE can setup metrics that describes users experience using Service Level Indicators(SLI), Service level objectives(SLO) that states the targets for the overall health of a service and Service Level Agreements(ie., contractual obligations).

* SLI - Did the service work ? Was it fast ? Was it correct ?
* SLO - How much of the time do we need the service to work ?
* SLA - At what point, should we setup a press meet and say service is down or prepare to provision to pay fines to regulator ? (This needs to be changed, any suggestions)


##### Benefits of SRE

1. SRE focus is customer centric as it enforces to identify critical metrics should be logged and monitored from *"Customer User Journeys"* perspective. 
2. SRE role forces team and individual to spend 50% of their time in engineering, developing and automating infrastructure, so systems and applications can scale reliably. 
3. As SRE practice is operationally driven and with tools like *Error Budget* gives control mechanism to SRE to enforce that attention needs to be given to reliability than innovation or adding new features. 
4. SRE brings blameless culture to the table by enforcing teams to write blameless postmortems and accept failures as normal and it needs to be seen as a opportunity to improve the system. 


##### How to start SRE
1. Get an executive sponsor. 
    * Everything works successfully, when there is a plan. 
    * Why ? You will need top management approval before saying to a project to stop their development and focus on reliabilty, when SLO thresholds are passed. 

2. Pick one application

3. Start with *Error budgets*, define SLIs, SLOs and convince the exec, dev, and ops teams to create and stick to Error Budgets. 

4. On Alerting and Monitoring
    * Logging and monitoring metrics is good
    * Should reduce alerting
    * Focus on observability
      + Observability is the measure of how well your application's state can be understood, and how clearly inferences are drawn from that. You need to design your application in a way that it provides all the necessary information for you to know what is happening at all times.

5. Blameless culture


Just remember,
> More you communicate, less you have to assume

Below are some notes on SRE, 
* [Taken while watching youtube videos](51-sre-notes-from-youtube)
* [While reading Google SRE Book](52-sre-reliability-engineering)


##### Materials
* [SLO Cheatsheet](https://storage.googleapis.com/bobbydreamer-com-technicals/53-sre-references/%5Bshared%5D_SRE_The_Art_of_SLO_cheat_sheet.svg)
* [Art of SLOs](https://landing.google.com/sre/resources/practicesandprocesses/art-of-slos/)
  - [Art of SLOs - Handbook](https://storage.googleapis.com/bobbydreamer-com-technicals/53-sre-references/art-of-slos-handbook-a4.pdf)
  - [Art of SLOs - Slides](https://storage.googleapis.com/bobbydreamer-com-technicals/53-sre-references/art-of-slos-slides.pdf)
  - [Art of SLOs - How to](https://storage.googleapis.com/bobbydreamer-com-technicals/53-sre-references/art-of-slos-howto-a4.pdf)


##### References
* [Do you have an SRE team yet?](https://cloud.google.com/blog/products/devops-sre/how-to-start-and-assess-your-sre-journey)
* [SRE Best practices](https://landing.google.com/sre/sre-book/chapters/service-best-practices/)
* [Setting SLOs: a step-by-step guide](https://cloud.google.com/blog/products/management-tools/practical-guide-to-setting-slos)
* [Availability tables](https://landing.google.com/sre/sre-book/chapters/availability-table/)
* [20 Essential Books for Site Reliability Engineers](https://blog.catchpoint.com/2020/02/26/20-essential-books-for-site-reliability-engineers/)
* [Blameless - SRE Essentils](https://www.blameless.com/the-essential-guide-to-sre)