---
layout: page
title: Coverage obsession!
date: 2013-07-09 15:50:00
---

I have paired with a few who cannot resist not writing a unit test. They would insist writing test to cover every single line of
code<!--rm--> and wouldn't bother even if it is as dumb as an one-to-one property transformation from model to another.  I have always
wondered, what would cause such a practise? Probably some kind of obsession on following unit testing just as a practice,
without realizing the real benefit!

One interesting side effect of the same is, the test suite growing just in size and not in effectiveness (in terms of
the feedback you get and the assistance it gives you while refactoring). Have you ever been in a situation
where, fixing a bug or refactoring seems quite straight forward in terms of the code but fixing the corresponding tests
ends up to be a nightmare?, doesn't it seem like a smell?

While the above is bad, it becomes even worse when best practices like DRY (Do Not Repeat Yourselves) aren't followed, you can
easily smell it when you see the setup and assert statements repeating in every tests. I have recently realized the significance
of treating tests like your actual code and following all best practices while coding it, otherwise unit tests themselves would
quickly turn as a burden rather assistance.

To my opinion, it is ok to not write an unit test if you don't find a use for it...

Another similar syndrome is indentation/formatting obsession, quite funny... :)