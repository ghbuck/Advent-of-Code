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

### [Day 3: Perfectly Spherical Houses in a Vacuum](https://adventofcode.com/2015/day/3)

Man… I really hope I'm not jinxing myself by saying this is easy. But it really is…

#### $\textsf{\color{red}{Part 1:}}$

Just track Santa's position as he moves around, adding each house he visits to a set. The size of the set at the end is the answer.

#### $\textsf{\color{green}{Part 2:}}$

For part two, I extracted the x/y movement logic into a helper function to share between part 1 and part 2, then tracked both Santa and Robo-Santa's positions separately, alternating which one moves based on the index of the direction being processed. Again, the size of the union of both visited sets is the answer.
