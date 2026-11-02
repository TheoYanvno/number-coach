# Number Coach

**▶ [Play it live](https://theoyanvno.github.io/number-coach/)**

A guess-the-number game with a coach. The computer picks a number from 1 to 100 and says higher or lower after each guess, and the coach grades every guess against the best possible one, explains the grade, and writes a report at the end.

| Grade | Means |
|---|---|
| **Best** | The middle of what's still possible: rules out half, whatever the answer |
| **Good** | Rules out at least a third |
| **Risky** | Near the edge of the range, so it might teach you very little |
| **Wasted** | Already ruled out by an earlier answer |

The best strategy is binary search, which never needs more than 7 guesses for 1 to 100.

## How it's built

- All the game state lives in one `game` object, changed only by `makeMove()`
- `rateGuess()` compares each guess with `bestGuess()` (the middle of the range), judging the worst case
- `render()` draws the whole page from the state after every move
- The end-of-game report is built from the saved moves: guesses vs the target, accuracy, and one tip

## Run it

Open `index.html` in a browser, or use VS Code's Live Server.

---

Built with help from AI coding tools, as part of my learning and portfolio.
