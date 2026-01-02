# 2015 Thoughts and Solutions

## Opening Thoughts

I'm going back and starting AoC from the beginning.

I just finished 2025, so this will be a decade long jump back in time…

## Solutions

### [Day 1: Not Quite Lisp](https://adventofcode.com/2015/day/1)

I wonder how easy the whole of the year will be compared to 2025. Because this was a breeze. It's probably going to get much harder when he starts hiding CS concepts in the puzzles (forever my weakness), but for now, this was a nice warm-up.

#### $\textsf{\color{red}{Part 1:}}$

Just de/increment a counter based on the input characters. Simple.

#### $\textsf{\color{green}{Part 2:}}$

The same as part 1, but keep track of the index and return a 1-based position when the counter hits -1.

### [Day 2: I Was Told There Would Be No Math](https://adventofcode.com/2015/day/2)

Another simple concept. Just some basic geometry.

#### $\textsf{\color{red}{Part 1:}}$

Calculate the surface area of each box plus the area of the smallest side for slack. That's it.

#### $\textsf{\color{green}{Part 2:}}$

I refactored the part 1 solution to do both steps at once, using helper functions to calculate the wrapping paper area and ribbon length for each box.
