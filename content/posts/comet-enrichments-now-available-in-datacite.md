+++
date = "2026-05-28"
draft = false
title = "COMET Enrichments Now Available in DataCite"
slug = "comet-enrichments-now-available-in-datacite"
authors = ["Dione Mentis"]
categories = ["Results & Impact"]
tags = ["Round-tripping"]
media = "/images/blog/comet-enrichments-now-available-in-datacite/comet-to-datacite-pipeline-diagram.jpg"
featured = true
+++

One of the key elements of the [COMET Model](https://www.cometadata.org/comet-model/) is enabling round-tripping: the flow of open metadata enrichments into the systems that maintain and disseminate scholarly metadata. Round-tripping is important because it prevents enrichment work from fragmenting across the ecosystem. For the first time, provenanced community enrichments are now available directly from a PID provider—through [DataCite’s new enrichments API features](https://support.datacite.org/docs/metadata-enrichments)—showcasing round-tripping in a live production system.

<!--more-->

## Which enrichments are included?

COMET’s [first pilot project](https://doi.org/10.82461/m8a8-m211) matched preprints from the arXiv repository (registered with DataCite DOIs) to their corresponding published articles (registered with Crossref DOIs) in various journals. The resulting dataset—over 850,000 new preprint-to-article connections—fills a gap in the scholarly record, enabling a better understanding of the research timeline and its impact.

Following the release of [ROR’s updated matching strategy](https://doi.org/10.71938/zz90-g810), COMET and DataCite embarked on a project to [match author affiliations to ROR IDs in DataCite](https://doi.org/10.82461/q6gh-3c48). The enriched dataset includes over 20 million matches across 5,812,774 unique DOIs in the `affiliation` field of Creators (as of April 2026).

## How does the enrichment service work?

The diagram below shows DataCite’s current enrichment pipeline. DataCite ingests an enriched data file from COMET that contains a record of each enrichment. It includes provenance metadata connecting each enrichment to both its contributors and the resources that the enrichment was derived from, such as project documentation and related datasets.

Enrichments are stored in a separate datastore so that their application is additive, allowing granular comparisons to the metadata submitted by DOI record owners.

![Four-lane workflow diagram showing how a COMET enrichment record flows through the DataCite enrichments pipeline into the metadata store, then out via the DataCite REST API.](/images/blog/comet-enrichments-now-available-in-datacite/comet-to-datacite-pipeline-diagram.svg)  

For a walkthrough of the pipeline, view the [22 April COMET Community Meeting recording](https://www.youtube.com/watch?v=Uds5RPFyAVU&t=1620s). To find out more about DataCite’s metadata enrichments service and how to use the API endpoint, visit the [support documentation on metadata enrichments](https://support.datacite.org/docs/metadata-enrichments).

## How can I give feedback?

This is a new service, so what the community flags now will directly inform its next round of features. Share your feedback through DataCite’s [survey](https://form.typeform.com/to/Ektmjgg3) or join the discussion on the [open request for comments](https://github.com/datacite/datacite-suggestions/discussions/236). 

