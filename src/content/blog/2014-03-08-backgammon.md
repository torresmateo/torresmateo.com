---
title: "Backgammon Madness"
description: "Building a Backgammon game with AI using weight-based heuristics instead of alpha-beta pruning."
pubDate: 2014-03-19
---

Artificial Intelligence is the heart of a Player vs. PC game, and there are a lot of options to have a program *thinking*. For instance,
if you have to make a game like [Bacteria](/blog/2014-01-10-ui-design/), the obvious choice is
[Alpha-Beta pruning](http://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning).

## The Story

The assignment Fer and I had was [Backgammon](http://en.wikipedia.org/wiki/Backgammon). It's a board game with checkers and dices. The
main goal is to move your checkers from your "house" to the opponent's. In your turn you throw a pair of dices, and move the checkers forward.
If you've got the same result in both dices, you earn a double turn, moving four times.

It's actually a boring game, compared to chess, but Fer and I learned how to play, and even watched YouTube videos of the world championship.

When this assignment was given, one of the requirements was to use alpha-beta pruning for the AI. It didn't feel right to me, because adding
dices to the mix leaves you with a lot of randomness. Of course you can modify alpha-beta to deal with the randomness, but as I've said above,
there are A LOT of options, and it's part of the art of problem solving to pick the right tool for the job.

In class, I asked our teacher about this, and he didn't answer my question. I stayed after class to him again, and we had an argument about the
right algorithm to use for the game.

## The implementation

Graphically, it's the same as [Bacteria](/blog/2014-01-10-ui-design/). Even the mouse handler is 90% taken from our previous
implementation, we used color masks and sprites. [Allegro](http://alleg.sourceforge.net/) was also the library we used again.

The difference was AI. We had to learn some useful strategies for backgammon. The game has two logical stages. In the first stage, the opponent
can block your checkers, and this means a lot of computation towards avoiding that, and focusing on desirable board configurations. In the
second stage it's simply a "race", the first player to reach the opponent's "home" wins the game. We implemented a weight based heuristic for
both stages.

The first heuristic was focused in achieving good board configurations, we had points for:

* Distance to the opponent's home (low priority)
* Avoid blocked checkers (medium priority)
* Block opponent's checkers (medium priority)
* Occupy six adjacent columns (high priority)

There were other aspects, but these four are the most important. The last one was added after watching a lot of (boring) backgammon games online.
Professional players seemed to aim for a particular board configuration. When you have two or more checkers in the same column, the opponent can't
block your checkers in that column, so having six consecutive columns occupied means you own a "wall" of columns that the other player can't
pass.

The second stage has the following priorities:

* Distance to the opponent's home (high priority)
* Everything else (no priority)

Basically, it's focused on reaching the opponent's home.

## The tournament

The main goal of this implementation was to make every team challenge other's programs. It was fun, at first we won because most of our classmates'
programs weren't finished. We ended with 3 complete games (best of 3), the first two we won 2-0, and the last one (the final game of the tournament)
was our program against Rafael Arias Michel and Daniel Ruffinelli's implementation, I'll refer to them as *Rafa* and *Ruffo* from now on unless they
ask me not to, in which case I'll probably keep calling them *Rafa* and *Ruffo*.

They had a nice implementation in GTK, and if I remember correctly they had implemented Alpha-Beta Pruning. Our program won the first match, the second
one we lost! By that moment we had an audience (about 6 classmates who were interested enough to stay and watch a bunch of nerds cheering for their
own implementation of a complete boring board game). The last game was interesting, both programs made mistakes, specially at the end. We could not tell
who had the advantage until the very end.

Luckily we won :)

## Video and Code

Last, but not least, here's the video of me playing (and winning!) against my own implementation. The interface this time isn't as elaborated as in
Bacteria, but the main reasons were:

* The objective was not to make a playable PC vs Player game, we did it for completeness.
* Backgammon is boring.
* We focused on the PC vs PC tournament instead of Interface and/or Design, I think it looks OK though.
* Backgammon is boring.
* Did I mention how boring Backgammon is?

**WARNING:** It's about 4 minutes of myself playing a boring game :)

<iframe width="800" height="600" src="//www.youtube.com/embed/dKyYiN4sj7s?rel=0" frameborder="0" allowfullscreen></iframe>

and as always... the [code](https://github.com/torresmateo/Backgammon).
