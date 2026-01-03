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

### [Day 4: The Ideal Stocking Stuffer](https://adventofcode.com/2015/day/4)

There's just no way around brute forcing this one, is there?

#### $\textsf{\color{red}{Part 1:}}$

Just keep hashing incrementing numbers until you find one that produces a hash with five leading zeroes.

#### $\textsf{\color{green}{Part 2:}}$

Same as part 1, but look for six leading zeroes instead. I also refactored `findHashInput` to return both results at once to avoid repeating the brute-force logic.

### [Day 5: Doesn&apos;t He Have Intern-Elves For This?](https://adventofcode.com/2015/day/5)

It's interesting how the time of day one attacks these problems can affect their perceived difficulty. I plowed through part 1 pretty quickly, but attempting to solve part 2 at 11p was a struggle. I had to take a break and come back the next morning to get it done. And, of course, once I saw the solution, it was obvious.

#### $\textsf{\color{red}{Part 1:}}$

We've just got to track a few different conditions as we iterate through each string. Nothing too complex. Short circuit as soon as we know a string is naughty.

#### $\textsf{\color{green}{Part 2:}}$

At first I was trying to do the validation in a single pass, like part 1. In the end, I ended up tracking all pairs of letters and all triplets of letters as I iterated through the string. Then, after the iteration, I checked the pairs list for any pair that appears at least twice without overlapping, and the triplets list for any triplet where the first and last letters are the same. If both conditions are met, the string is nice.

### [Day 6: Probably a Fire Hazard](https://adventofcode.com/2015/day/6)

This was a day where I had interfaces set up one way (a grid of booleans) and then had to refactor to a different way (a grid of numbers) for part 2.

#### $\textsf{\color{red}{Part 1:}}$

Got everything set up with a grid of booleans to track whether each light is on or off. Then just processed each instruction to update the grid accordingly. At the end, counted the number of lights that are on.

The original implementation of `followInstructions` used a switch statement to handle the different instruction types.

#### $\textsf{\color{green}{Part 2:}}$

Refactored the grid to be a grid of numbers to track brightness levels. Updated the instruction processing logic to increment or decrement brightness as specified. At the end, summed up the total brightness of all lights.

Also refactored `followInstructions` to use a mapping of instruction types to functions, which made the code cleaner and more extensible.
