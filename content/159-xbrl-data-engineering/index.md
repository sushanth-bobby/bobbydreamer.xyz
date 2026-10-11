---
title: "Part 5: Why Reading XBRL Became a Larger Data Project"
date: 2026-10-10
lastmod: 2026-10-10
description: "How Sushanth turned BSE and NSE XBRL filings into usable shareholding and financial data, and what he learned about reporting periods, business differences, source evidence and practical design."
tags: ['kickbear', 'project-history', 'xbrl', 'data-engineering', 'learning', 'written-by-ai']
authorship: ai
---

> This is a series of blog posts written by AI while reviewing my project, its been written from a 3rd person perspective

Sushanth pursued XBRL because it provided financial information published through the exchanges. XBRL is a structured reporting format: a value comes with information describing what it measures. His reason for using it was to get closer to the original filings, rather than simply replace a broken website scraper.

MC remained useful for historical data and an independent comparison. BSE and NSE website tables also provided another view of the information. Exchange filings became the main source he wanted to understand and preserve.

He had tried extracting XBRL/XML around 2022 but found it difficult. He could not find a straightforward mapping that explained how to extract everything he needed. Understanding the source looked like a large task, and he had limited time, so he continued maintaining the existing scrapers.

In 2026, greater familiarity with AI encouraged him to try again. He initially expected it to be easier. In practice, getting the system working took almost three months.

The exchange XBRL data he worked with covered shareholding and financial results. He started with shareholding because he wanted a smaller set of information: promoter, public, HNI and mutual-fund holdings.

## Understanding BSE shareholding

The ownership data could help answer several questions:

- Had promoter ownership increased?
- Were foreign and domestic institutions moving in the same direction?
- Had a tracked investor appeared again after a gap in separate disclosure?
- Had an ownership percentage changed because the holding changed, or because the company's total shares changed?

The workflow separated collection, interpretation, analysis and display:

1. Find BSE filings and save their original XML and HTML files.
2. Extract consistent company-quarter records into DuckDB.
3. Compare the records to produce changes, events, trends and reports.
4. Prepare a Serving SQLite database for other programs to read.
5. Build the WebApp snapshot and deliver company and market views through the API.

DuckDB supported extraction and analysis; Serving SQLite held prepared results for display. Keeping the steps separate meant the analysis could use consistent records without rereading every raw filing.

## Collecting and organizing filings

Downloading had two jobs: collecting historical filings and checking for new submissions.

Extraction then turned the documents into comparable records. The records included company identity, reporting quarter, publication details, ownership categories, pledge values, disclosed holders, investor identities and declarations. The original documents stayed available for checking.

Several distinctions were important:

| Information to keep separate | Why it mattered |
|---|---|
| Company identity and display name | A name can change while the company history must stay connected. |
| Reporting quarter and publication date | A late filing still describes its original quarter. |
| Category totals and named holders | Separately disclosed names may cover only part of a category. |
| Ownership percentages and share counts | A percentage can change when total company shares change. |
| Measured pledges and declarations | A declaration alone must not be turned into a numeric pledge value. |
| Regular quarterly filings and event filings | An event filing must not silently replace the expected quarterly comparison. |

A revised filing replaced the selected record for its company and quarter. The analysis used the prepared records rather than interpreting the raw categories and names again for each report.

## Comparing ownership carefully

Quarter-on-quarter and year-on-year comparisons needed the correct earlier periods. Promoter analysis included both the promoter category total and individually named promoter entities.

Institutional categories also needed care. A domestic-institution total might already include mutual funds, insurance companies, alternative investment funds, banks and other groups. Adding the parent total to those child categories would count the same shares twice.

Foreign institutional holdings could be presented differently across reporting formats. Sometimes there was a direct total; sometimes it had to be assembled from categories that did not overlap.

Shareholding gave Sushanth confidence that he could apply a similar approach to financial XBRL. It also showed why extracting a number was only the first step: he needed to preserve its meaning.

## Reading BSE financial XBRL

Reading a document was easier than deciding what each number represented.

A financial value could carry a concept name, period, unit, scale, reporting basis and further details such as a business segment. Two values with the same name might describe different things. Values ending on the same date might cover different lengths of time.

The financial workflow therefore followed the same broad steps: download the documents, extract the facts and analyze them. The recorded collection contained 34,897 canonical HTML files, with duplicates handled and revisions preserved.

## Dates alone do not define a financial period

An XBRL fact refers to a context that describes the company, a point in time or a date range, and sometimes extra qualifiers. The program had to use that context to decide what period the fact represented.

A fourth-quarter filing could contain year-to-date information that became the full-year value. In a first-quarter filing, the quarter and year-to-date periods could describe the same span. Grouping everything by its end date would lose that difference.

## The same concept can appear more than once

One filing could use the same concept for several segments, classes or maturity groups. Storing only one value under each concept name could silently discard facts.

The extraction therefore kept a record of each occurrence in source order. It preserved the original concept name and namespace, the context and unit references, decimal information, scale, sign and raw text value. This fuller record made it possible to trace a processed value back to its place in the document.

## Different businesses need different statements

A general-company template could not describe every filer. Banks, NBFCs, life insurers and general insurers used different concepts and statement structures. Forcing them into one template could drop values or put them in the wrong place.

The pipeline adopted separate statement families: General/Ind AS, Banking, NBFC or financial services, Life Insurance and General Insurance.

A label that looked familiar was not enough to accept a mapping. The business family, period context, standalone or consolidated scope, unit and source structure also had to fit.

## Keeping the design suitable for one user

The first rebuild took about 12 hours. Sushanth felt that the design had become closer to an enterprise application than a home project. He also saw that the way he had described the task to the AI had encouraged unnecessary complexity.

He clarified that the system served one user and removed work that did not justify its cost. The lesson was to keep the evidence needed for correctness while making the process practical to run.

## Adding NSE without assuming the same format

Sushanth added NSE partly because not every company traded on both exchanges. He expected similar formats, but found differences that needed a separate downloading and parsing path.

In the NSE workflow, XML supplied the financial facts, while inline-XBRL HTML provided extra evidence. Source identification and the way interrupted runs resumed differed from BSE.

Each source needed to be interpreted on its own terms before compatible values could be compared. Treating BSE and NSE as interchangeable would have hidden useful differences.

## What the WebApp received

The WebApp received a compact Financials dataset with the statement family, period, scope, exact values, source and comparison details already prepared. FastAPI delivered structured responses, and React displayed Annual, Quarterly, Balance Sheet, Cash Flow and Ratios views.

XBRL-derived ratios were calculated before publication, stored in Financials, exposed through the API and displayed in React. The surviving evidence confirms that these views were implemented; it does not establish how frequently Sushanth used them.

Preparing the evidence beforehand kept the interface easier to understand. It could display a company view without interpreting raw filings during a request. The next article follows that interface into the modern local Kickbear WebApp.

---

*These examples describe data interpretation and research tools. They are not financial recommendations.*
