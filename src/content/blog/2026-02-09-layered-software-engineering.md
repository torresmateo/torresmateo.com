---
title: "The layers of Agentic Software Engineering"
description: "Thoughts on how AI is changing software engineering"
pubDate: 2026-02-09
---

When I think back on how I used to approach building a piece of software, I was unknowingly shifting the mental task between different levels of abstraction. Now, the more I rely on AI coding assistants, the more I see the "layers" of software engineering become apparent, but also "compressed", depending on how the user likes to use the AI assistants.

Let me unpack that.

## The layers

Layers of software engineering are nothing new, as entire companies hire very specialized people to deal with specific aspects of managing the development of the product. As usual with things humans do, these layers lie on a spectrum and overlap. Here's some of them ordered from "closer to the metal" to "closer to the use case" spectrum:

- Coding and routing data between functions/objects
- Integrating components of the system (such as calling a database or a message queue)
- Designing/Choosing data structures for the system
- Designing the modular architecture of software components
- Defining the communication protocol between front and back-end (usually REST these days)
- Designing the UX for a given feature
- Scoping a feature
- Defining the use cases

There are many more, of course, especially for highly distributed software. But these are enough to illustrate the different ways in which AI assistants may help.

Let's take "Coding and routing..." as an example. Here, the SWE is very close to the metal, and it's concerned with providing the specific instructions to the machine. It's a very granular activity and the AI assistance here looks like tab-completion, as the AI operator's own attention spans the function being implemented and its calling/called functions.

If we go to the other end of the spectrum, "Defining the use cases" requires the SWE to pay attention to completely different things: "Is the feature important now?", "How is this feature valuable to the user?", "Should this feature be part of the product at all?". The granularity of these questions, and the scope of this layer are very different in nature compared to layers in the other end of the spectrum. Here we're talking about more subjective things like "value", and "user experience" compared to very easily quantifiable things like which functions would I call. AI assistance in this layer is generating plans, gherkin specs, and strategy. Tab-completion here would (in most cases) get in the way of the AI operator.

## AI operation patterns

Each of these layers will involve a very different way of interacting with the AI assistants. 

On the "close to the metal" side of the spectrum, the AI operator is very much in the driving seat, and the AI acceleration is there to expand the operator's awareness of the codebase beyond what usually fits in a human brain. In my personal experience, this offers slightly expanded capabilities in addition to things like LSPs and other deterministic tools for contextually navigating code bases.

On the "close to the use case" end of the spectrum, AI assistants have greater room for autonomy, as the artifacts are usually plans, specs, and documents that refer to the underlying software in a very high level. It's very immediate to then simply ask the AI to make the plan concrete, and have it take over the lower layers of the implementation. The AI operator is vibe-coding the software in such cases.

## To vibe or not to vibe

I don't think there's a "correct" layer for the AI operator to sit on. I personally like to be in control of what happens with the software I write, so I tend to gravitate to the "close to the metal" end of the spectrum for things I want to maintain long term.

For experiments and idea validations, however, I see myself migrating to the "close to the use case" end. Many of the things I build nowadays are vibe-coded with me paying attention to the plan more than I look at the code. If the use cases are well defined and the tests included in the plan are comprehensive enough, I'm happy to let the AI steer the code generation into a good place, and then iterate quirky UI things that it didn't one-shot. 

There's also an exploratory middle ground, where I will use the AI in the "use case" layer to only generate a plan, and when I'm happy I will go into intermediate layers where I dictate the architecture of the software and oversee the AI as a code generation entity. When I'm happy with the solution, I have a solid understanding of how the software works, and I can dive deep into the code if I have to fix something. It's a managerial point of view of the code, as I can still mentally track _where_ something in the codebase is broken from watching bugs happen in the UI or the logs.

Annoyingly, there's no universal recommendation on whether to vibe code or not. But a rule of thumb for me is to vibe the things you wouldn't have built otherwise, if only to get the AI operation muscle exercised. For the things that you want to maintain into the future, and for learning, don't vibe code, move to the "close to the metal" end of the spectrum, and embrace the speed of AI assisted coding for both engineering and learning.
