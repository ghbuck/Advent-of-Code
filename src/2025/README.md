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

### [Day 3: Lobby](https://adventofcode.com/2025/day/3)

I enjoyed this one. Though admittedly, I took longer on part 2 than I probably should have just because I was trying to be clever?

#### $\textsf{\color{red}{Part 1:}}$

I got this one pretty quickly. I just did a hard coded check of savedBatteries[0] and savedBatteries[1] while iterating through the bank numbers.

```typescript
const calcMaxJoltage_part1 = (powerBanks: number[][]): number => {
  return powerBanks.reduce((total, bank) => {
    const maxIndex = bank.length - 1

    const bankMaxValues: number[] = bank.reduce((savedBatteries, currentBattery, index) => {
      if (currentBattery > savedBatteries[0] && index !== maxIndex) {
        savedBatteries = [currentBattery, 0]
      } else if (currentBattery > savedBatteries[1]) {
        savedBatteries[1] = currentBattery
      }

      return savedBatteries
    }, Array<number>(2).fill(0))

    return total + Number(bankMaxValues.join(''))
  }, 0)
}
```

#### $\textsf{\color{green}{Part 2:}}$

When I got to part 2, I realized I'd be duplicating a lot of code if I copy/pasted part 1 and modified it. So I tried to be clever and make a more generic function that could handle both parts. I ended up with this (I removed the explanatory comments for brevity):

```typescript
const calcMaxJoltage = (powerBanks: number[][], numBatteriesToSave: number): number => {
  return powerBanks.reduce((total, bank) => {
    const maxBankIndex = bank.length - 1

    const bankMaxValues: number[] = bank.reduce((savedBatteries, currentBattery, index) => {
      const numRemainingBatteries = maxBankIndex - index

      let checkIndex = Math.max(0, (numBatteriesToSave - numRemainingBatteries) - 1)

      for (checkIndex; checkIndex < savedBatteries.length; checkIndex++) {
        if (currentBattery > savedBatteries[checkIndex]) {
          const numberToRemove = numBatteriesToSave - checkIndex
          const replaceArray = [currentBattery, ...Array<number>(numberToRemove - 1).fill(0)]

          savedBatteries.splice(checkIndex, numberToRemove, ...replaceArray)

          break
        }
      }

      return savedBatteries
    }, Array<number>(numBatteriesToSave).fill(0))

    return total + Number(bankMaxValues.join(''))
  }, 0)
}
```

I feel pretty good about the implementation. It's a single-pass, efficient solution that works for both parts.

### [Day 4: Printing Department](https://adventofcode.com/2025/day/4)

#### $\textsf{\color{red}{Part 1:}}$

#### $\textsf{\color{green}{Part 2:}}$

### [Day 5: Cafeteria](https://adventofcode.com/2025/day/5)

This was a really fun, quick one. The overlapping ranges tripped me up at first, but once I realized the issue it all fell into place nicely.

#### $\textsf{\color{red}{Part 1:}}$

I tried, at first, having only looked at the test input, to use a `Set<number>` to store the ranges. When I got a `RangeError: Set maximum size exceeded`, my hopes of `set.has(id)` evaporated.

So I just did a good old fashioned `dataSet.ranges.some(([start, end]) => id >= start && id <= end)`, which worked fine.

#### $\textsf{\color{green}{Part 2:}}$

Then, when reading about part 2 and realizing that I would need to find the count of all unique fresh ids, I knew I would have to consolidate the overlapping ranges first. Reducing the differences of ends to starts of the ranges was straightforward enough.

Once I did that, however, it meant I could use a binary search for part 1. So I went back and modified part 1 to do so.

I have to say, seeing a sub 1ms runtime for part 1 was very satisfying!

### [Day 6: Trash Compactor](https://adventofcode.com/2025/day/6)

Most of the time I love automatic whitespace trimming, but today… not so much. I usually open the example and input files to see what I'm working with, and since today we were dealing with fixed-width columns, the trimming that I wasn't paying attention to bit me in the ass.

#### $\textsf{\color{red}{Part 1:}}$

This part was super easy. Just interate over the data `[col][row]` and perform the operation listed in the last row. Simple.

#### $\textsf{\color{green}{Part 2:}}$

Part two would have been simple as well, if not for the aforementioned whitespace trimming. I had the logic nailed down, but couldn't understand why I was only a few numbers off each time. [smdh]

I'm also not a huge fan of having to parse the input two times, but my tired brain just didn't want to have to refactor part 1 to handle the changes needed for part 2.

> _Ed: In reading a coworker's implementation I saw they used a grid (or understood that what we were doing to was gridding…). I may refactor and see if that speeds things up or cleans up my implementation._

### [Day 12: Christmas Tree Farm](https://adventofcode.com/2025/day/12)

I fell off the wagon for a few days. Work and life got crazy, so I'm trying to catch up. Definitely lost the company tournament, but oh well.

#### $\textsf{\color{red}{Part 1:}}$

I definitely had some help with this one from Claude. Anytime I get into recursions and backtracking I tend to get a bit lost. But with a nudge in the right direction I was able to get it working pretty quickly.

I do have to note this interesting tidbit [from a coworker](https://github.com/rjwut/advent/blob/8d8bbc058202aa004115496b3dbd6b5eb130e616/src/solutions/2025/day-12.js#L8-L29):

>  I wasted a lot of time working on an algorithm for packing in the presents, until I discovered
>  four things:
>
>  1. I realized that I could filter out some cases simply by computing the total area of the
>     presents to be put in a region, and if that exceeds the area of the region itself, it won't
>     fit.
>  2. I decided that maybe I should look at my input, and discovered that all the presents fit in a
>     3x3 square, not just the ones in the sample input.
>  3. I then realized that if subdividing the region into 3x3 cells resulted in at least one cell
>     for each present, it was guaranteed that there would be enough space, and I'd only have to do
>     the more laborious fitting algorithm for any that did have enough area but did not have enough
>     3x3 cells.
>  4. The last discovery was: there _weren't_ any cases that would require the fitting algorithm;
>     all cases in the actual input were properly accounted for already.
>
>  So all the work I did on a fitting algorithm was unnecessary: I just needed to check whether
>  there was enough room to tile sufficient 3x3 cells into the region for the presents.
>
>  There's no way that was an accident, especially considering that it wouldn't have worked one of
>  the test cases. Mr. Wastl did this on purpose, the sneaky little elf. My OCD tendencies are
>  annoyed by this, but I don't know if they're annoyed enough to try to get the fitting algorithm
>  I was working on across the finish line.
