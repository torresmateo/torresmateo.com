---
title: "Bacteria, Part 2: Gameplay, Drag & Drop and other Stuff"
description: "Implementing drag and drop interactions and AI for the Bacteria game using Allegro."
pubDate: 2014-02-04
---

This is the second part of the Bacteria development, I'll focus in gameplay, and the technique we used for implementing drag and drop
with Allegro.

## Gameplay

First, I'll give a little introduction of what gameplay is:

> Gameplay is the specific way in which players interact with a game, and in particular with video games. Gameplay is the pattern defined
> through the game rules, connection between player and the game, challenges and overcoming them, plot and player's connection with it.
> Video game gameplay is distinct from graphics, and audio elements.
> <div style="text-align:right;">&#8213;Random Dude in Wikipedia</div>

That should be clear enough.

For our game, we wanted the player to focus in the strategic part of the game, and not to deal with an uncomfortable way of interacting
with objects on the screen. In our previous games the player had to learn a bunch of "complicated" controls to do things, and it wasn't
fun to play that way.

## Drag & Drop

Since Bacteria is a board game, the intuitive way to interact with it is obviously the mouse. Here's a list of the things you can do with
any mouse:

* Move pointer.
* Click.
* Right-Click.

Pretty limited. I didn't include *scroll* in that list because (sadly) not all mice have a scroll wheel. So, handling the mouse is
not as simple as it can appear at first sight... aaaand right-clicking sucks in a board game... so... here's our new list:

* Move pointer.
* Click.

But wait!! If you think about it, there are special things about the click event, and it's all about timing. In every mouse based interface
you have more options:

* **Double-click:** Click two times, fast. It's like clicking, but if almost every time a single-click is `select`, double click is `open` or,
  in a more general way: `interact` with the double-clicked element.
* **Drag-and-Drop:** It's done by pressing on the element, moving the mouse while still pressing the mouse button, and then releasing the button
  in another area in the screen.

These options are called *gestures*. We were interested in *Drag-and-Drop*, because it's the simplest way to "move" one object over the scene.
The basic idea is click and hold one of the little bacteria, and somehow give the player the feeling that s/he is "holding" the object as long
as the mouse button is pressed. We implemented this feature by doing the following:

* **On mouse press:** Quickly swap the bacteria with a "phantom" version, useful to know the original position in the board. Also, replace the
  mouse pointer, our choice was the same pointer with a bacteria attached to it, so wherever the player moved the mouse, the bacteria seemed
  to be glued to the pointer.
* **On mouse release:** Swap the pointer image to the original (the one without the bacteria attached). If the player released in a valid cell,
  the original cell now looks like an empty cell, and the new cell now hold a bacteria. If the player released in any other place, the phantom
  version returns to be the normal bacteria.

It worked like a charm!!

Here's an image showing the empty cell, the "phantom" bacteria , the "infected" cell, and both pointers.

![Blue Bacteria](/images/blog/bacteria-part-2/blue_bacteria.png)

## Artificial Intelligence

Some words about the intelligence.

First of all, we knew absolutely NOTHING about game theory at the time, and I think we did pretty well taking that into account.

Our implementation was a tree-like decision structure. We started by assuming the enemy played the best he could, and the AI moves acted accordingly.
It's pretty clever after reading the code almost 4 years later =). It's not very hard to beat the computer with this AI, but not ultra-easy though,
it takes to think at least two moves ahead to win.

# Finally

Well... I wrote a LOT about Bacteria, and after reading it myself I decided it was long and boring, so I erased all of it and instead made a
video of myself showing what I think are the best parts of this game:

* Menus... they look AWESOME!!.
* Board Editor.
* Game.
* Instruction Pages.

It's not a long video, and I lose (in my defense, the purpose of this wasn't for me to win, but to show the features).

<iframe width="800" height="600" src="//www.youtube.com/embed/H9hrEwQNlbw?rel=0" frameborder="0" allowfullscreen></iframe>

# To be continued...

The next post is not about Bacteria. It's about Backgammon, but only the AI part, since all the rest is pretty similar to Bacteria, the interesting
part is the intelligence. I plan to make another video for that post, since it's much easier for me to show the features that way, and maybe
it's a better experience to you to actually see the interactivity and other things that can't be seen properly in still images.
