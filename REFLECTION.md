# I like finding loopholes.

*My reflection on A Hacker’s Mind by Bruce Schneier*

*AIPI 590: Explainable AI*

This is the reading-only version of **Mind the Loophole**. See [the README](README.md) to run the three experiments.

## What surprised me about the book

I really liked this book. I tend to look for ways to outsmart a system, so I recognized a lot of the thinking Schneier describes. When I find a shortcut that works, I usually feel pretty good about it. It was satisfying to read a book that took that way of thinking seriously.

What surprised me was how much hacking happens in places I hadn’t thought about. Schneier describes financial and political systems where people can follow the rules and still get around what those rules were supposed to accomplish.

The finance and virus examples especially surprised me. I hadn’t connected them through the idea of hacking before. That was probably the biggest thing I got from the book: realizing how much of this had been happening around me without me noticing.

## The experiments

**The perfect score.** In the first game, you get points for submitting notes. Reading and writing a new note takes more energy than copying one, but both earn the same points. One original and four copies get you to 100. The fix removes points for copies, which reveals another problem: you can no longer reach the target, even if you spend all your energy learning.

I’d be tempted to copy the note because it’s the fastest way to win. That’s why I wanted both numbers on the screen: getting 100 points looks a lot less impressive when I can also see how little I learned.

**The unequal loophole.** The second game has a shared fund with a limit of 20 credits per account. If you can afford extra accounts, you can claim the whole fund. Changing the limit to 20 per person stops that, assuming the system can identify who owns each account.

I usually picture someone finding a loophole because they’re clever. In this game, I know the loophole either way. I just can’t afford to use it without the extra money. That changes how I feel about the result.

**The pressure test.** The third experiment applies the same pressure to a system over ten rounds. With repair off, the same weakness keeps causing damage. With repair on, the system builds up a defense after each hit. The earlier damage remains.

I think hacking can make a system stronger, but I’m assuming somebody fixes what went wrong. Turning repair off makes that assumption pretty obvious. The system keeps taking damage from the same problem.

I made up these examples and numbers to show the ideas. They aren’t predictions of how a real system would behave.

## I still think hacking is useful

I still think hacking is good overall. Systems need to be tested, and I like people who are willing to question rules that everyone else accepts. If nobody tries something unexpected, a weakness can sit there for years. I don’t think the answer is to discourage people from looking.

The part that complicates that for me is who gets to benefit. Schneier’s discussion of powerful people exploiting systems made me think about how different that is from the lone hacker I tend to imagine. I’m less impressed by someone winning if they can afford a whole team to find loopholes while everyone else has to live with the result.

## The connection to Explainable AI

The scoring game helped me connect the book to AIPI 590. I can explain exactly why the player got 100 points: the system counted five submissions. There’s no mystery in the calculation. It’s just counting something that doesn’t tell us much about learning.

That seems relevant when we explain an AI model’s output. Knowing which inputs affected a prediction can help us see what the model is doing. We still have to decide whether those inputs make sense for the task. If a model treats the number of submitted notes as evidence of learning, I’d want to try repeated notes and see what happens. An explanation would be useful partly because it tells me where to look for that kind of problem.

I kept coming back to the idea that pressure makes diamonds. I still like that comparison, but the repair experiment shows what I’m leaving out when I say it. Pressure only helps this system if it can respond. And if the people who benefit from a loophole don’t want it fixed, I can’t assume that response will happen.

## Why I made this in code

I wanted to do more than describe the examples. The games let me try the shortcut, see the result, and change the rule myself. I can get a high score without learning much, or take most of a fund without breaking its rules. Being able to switch between the original rule and the fix makes the problem easier for me to understand.

I’m still going to enjoy finding a shortcut. This book made me more interested in who else is using one, and what it costs the rest of us.
