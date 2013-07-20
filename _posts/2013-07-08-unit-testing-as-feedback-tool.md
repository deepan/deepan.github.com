---
layout: page
title: Can I develop a little quicker with unit tests?
date: 2013-06-30 18:31:00
---

My favorite use case of unit testing is to use it as a feedback tool while coding. I am primarily into
web development and in my world<!--rm-->, to see my code in action it takes to perform quite a few actions including
compiling my code, creating an executable, starting the web server, deploying the executable to the server, launching the
application within a web browser, navigating to the corresponding page/section and finally i get to validate the few
lines of code that I just coded. Quite a long feedback loop isn't it ?

That's exactly why I would prefer to write an unit test mocking out everything else which I am not interested in and use it
to quickly validate my code...