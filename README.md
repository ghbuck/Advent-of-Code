# Advent of Code

Here are my attempts to have some nerdy, winter celebratory fun.

## AoC Guidelines Compliance

The code in this repository follows the [automation guidelines on the /r/adventofcode community wiki](https://www.reddit.com/r/adventofcode/wiki/faqs/automation/).

- **Only inputs requested:** The only requests this code makes against adventofcode.com is to download puzzle input.
- **Requests are throttled:** Requests are made no more frequently than once per minute.
- **Inputs are cached:** Inputs are locally cached so that any given input is only requested once. If the user wishes to download an input again, the must delete the relevant cache file.
- **Inputs are not saved in GitHub:** As proprietary information, they are downloaded and cached in `./input`, which is excluded in `.gitignore`
- **User-Agent Header:** The `User-Agent` header in `getRequestHeaders()` is set to me

## Commands

```bash
npm start -- [RunParams]
npm run newday -- [RunParams]
npm run session -- [AoC.com session cookie value]
npm run lint
npm run format
```

## RunParams

```bash
  -y \d{4}   --year \d{4}    The year to run (default: current year)
  -d \d{1,2} --day \d{1,2}   The day to run (default: current day num)
  -p \d      --part \d       The solution to run (defaults to 'all')
  -t         --test          Flag to run with the test data
```

## Further Info

### Finding session id

The session id is a cookie value set by logging into <https://adventofcode.com>. Open the developer tools of your browser to find, and then copy/paste the value into the `npm run session` command.

### Linting and formatting

You can run these commands separately, but I've added [lint-staged](https://www.npmjs.com/package/lint-staged) as a dev dependency so for any files you stage it will run both commands before committing. If there are any errors thrown it will disallow committing until rectified. (This is where running the lint command manually comes in handy)
