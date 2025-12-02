# 2025 Thoughts and Solutions

## Opening Thoughts

This year AoC is only 12 days. I was a bit sad about loosing half the days, but I get it. The upside is that the last day is my birthday!

## Solutions

### [Day 1: Secret Entrance](https://adventofcode.com/2025/day/1)

This was a nice entry day. Just some simple math to track position on a circular track. I am, however, embarassed to admit the length of time it took me to get part 2 correct.

> [!NOTE]
> **TIL**: The formula `((n % m) + m) % m` is a common pattern to ensure you get a positive result in the range `[0, m-1]`.

#### $\textsf{\color{red}{Part 1:}}$

With the above formula in hard, part 1 was very simple. Just track the location and count how many times we hit zero.

#### $\textsf{\color{green}{Part 2:}}$

Part 2 was a bit more complicated for me. At first I thought I could do it in a direction agnostic way (and maybe you can), but I ended up getting the right answer it with direction in mind.

### [Day 2: Gift Shop](https://adventofcode.com/2025/day/2)

Today was a nice, simple pattern-finding problem. I find it mildly humourous that at this point in my life, the only time I'm ever doing any kind of real math is for Advent of Code problems.

#### $\textsf{\color{red}{Part 1:}}$

All I had to do was split the string in half and see if the two halves were the same. Easy peasy.

#### $\textsf{\color{green}{Part 2:}}$

This part was pretty straightforward as well. I just renamed the original `isRepeatingPattern` function to `isSimpleRepeatingPattern` and then wrote a new `isRepeatingPattern` function that checked all possible slice lengths up to half the string length. If any of them returned true from `isSimpleRepeatingPattern`, then I returned true from `isRepeatingPattern`.
