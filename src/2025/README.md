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
