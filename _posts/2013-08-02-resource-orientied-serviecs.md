---
layout: page
title: Resource oriented services
date: 2013-08-02 12:25:00
---

Service Oriented Architecture for enterprise, is somewhat like Object Orientation for code. To my opinion, it is all
about separation<!--rm-->  of concerns and standardizing the interfaces. A common mistake we tend to make while
designing the interfaces is to make them too specific to the consumers. As a result we end up with too many interfaces
that are very specific to consumers, and it would quickly turn into a nightmare in terms of maintenance.

If you agree that designing generic interfaces would solve many of the problems, the next challenge is on designing such
generic services itself. When we build enterprise applications iteratively, typically we don't get a visibility of all
the interactions between the applications and hence without such a wholistic view it is very difficult to design
services that are generic enough to serve many consumers.

One way of solving this problem is by designing resource oriented interfaces i.e, by identify resources that an application
owns (like orders, customers, fault, stock etc) and exposing operations over them as interfaces (like search, read, update,
delete etc). Still you are not completely out of the problem yet. The next challenge would be in-terms of the granularity
of information that different consumers would need. Here one might have to decide on a case to case basic to build multiple
interfaces (typically not more than two) to expose information at a different granularity. And it works better if such
interfaces are allowed to evolve in an iterative fashion but in a controlled manner.

Another common challenge is that, certain consumers would need aggregated information (say number of orders placed by customers
within a given period of time). Again if we design interfaces to expose such aggregated data, they might end up being very specific to
certain consumers. You can solve it by establishing a PUBLISH-SUBSCRIBE model, where the producer broadcasts events on
resources and consumers who are interested can consume them and perform the aggregation at their end, another option would
be to have a separate aggregation system (equipped with relevant tools and technologies) to do such aggregation.

Also I feel that, there is no need to feel constrained to proceed only with REST architecture and related technologies
to design resource oriented interfaces, provided the basic principle is not compromised.



