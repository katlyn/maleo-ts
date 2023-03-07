// lexer.ts
// Heavily based on lexer.lua created in Dr. Chappell's programming languages class


export enum Lexeme {
  KEY = 1,
  ID,
  NUMERIC_LITERAL,
  OP,
  PUNCTUATION,
  MAL
}

export const LexemeNames = {
  [Lexeme.KEY]: "Keyword",
  [Lexeme.ID]: "Identifier",
  [Lexeme.NUMERIC_LITERAL]: "NumericLiteral",
  [Lexeme.OP]: "Operator",
  [Lexeme.PUNCTUATION]: "Punctuation",
  [Lexeme.MAL]: "Malformed"
}

export enum State {
  DONE,
  START,
  LETTER,
  DIGIT,
  DIGDOT,
  DOT,
  PLUS,
  MINUS,
  STAR
}

function isLetter(c: string) {
  return c?.length === 1 && (
    c >= "a" && c <= "z" ||
    c >= "A" && c <= "Z"
  )
}

function isDigit (c: string) {
  return c?.length === 1 && c >= "0" && c <= "9"
}

function isWhitespace (c: string) {
  return c?.length === 1 && " \t\n\r\f".includes(c)
}

function isPrintableASCII (c: string) {
  return c?.length === 1 && c >= " " && c <= "~"
}

function isIllegal (c: string) {
  return c?.length === 1 && !isWhitespace(c) && !isPrintableASCII(c)
}

export function* lex (program: string) {
  // Index of the next character in program
  let position = 0
  // Current state of the parser state machine
  let state: State
  // Current character
  let ch = ""
  // The current lexeme so far
  let lexeme: string
  // The category of the current lexeme, set when state is set to DONE
  let category: Lexeme
  // The dispatch table of handlers
  const handlers: {[key in State]: () => void} = {
    [State.DONE]: function () {
      throw new Error("DONE state should not be handled.")
    },
    // No character has been read yet
    [State.START]: function () {
      if (isIllegal(ch)) {
        addOne()
        state = State.DONE
        category = Lexeme.MAL
      } else if (isLetter(ch) || ch === "_") {
        addOne()
        state = State.LETTER
      } else if (isDigit(ch)) {
        addOne()
        state = State.DIGIT
      } else if (ch === ".") {
        addOne()
        state = State.DOT
      } else if (ch === "+") {
        addOne()
        state = State.PLUS
      } else if (ch === "-") {
        addOne()
        state = State.MINUS
      } else if ("*/=".includes(ch)) {
        addOne()
        state = State.STAR
      } else {
        addOne()
        state = State.DONE
        category = Lexeme.PUNCTUATION
      }
    },
    // We're in an identifier or a keyword
    [State.LETTER]: function () {
      if (isLetter(ch) || isDigit(ch) || ch === "_") {
        addOne()
      } else {
        state = State.DONE
        if (["begin", "end", "print"].includes(lexeme)) {
          category = Lexeme.KEY
        } else {
          category = Lexeme.ID
        }
      }
    },
    // We're in a numeric literal and we haven't seen a decimal point
    [State.DIGIT]: function () {
      if (isDigit(ch)) {
        addOne()
      } else if (ch === ".") {
        addOne()
        state = State.DIGDOT
      } else {
        state = State.DONE
        category = Lexeme.NUMERIC_LITERAL
      }
    },
    // W're in a numeric literal, and we have seen a decimal point
    [State.DIGDOT]: function () {
      if (isDigit(ch)) {
        addOne()
      } else {
        state = State.DONE
        category = Lexeme.NUMERIC_LITERAL
      }
    },
    // We have seen a dot and nothing else
    [State.DOT]: function () {
      if (isDigit(ch)) {
        addOne()
        state = State.DIGDOT
      } else {
        state = State.DONE
        category = Lexeme.OP
      }
    },
    // We have seen a plus and nothing else
    [State.PLUS]: function () {
      if (isDigit(ch)) {
        addOne()
        state = State.DIGIT
      } else if (ch === ".") {
        if (isDigit(nextChar())) {
          addOne()
          state = State.DIGDOT
        } else {
          state = State.DONE
          category = Lexeme.OP
        }
      } else if ("+=".includes(ch)) {
        addOne()
        state = State.DONE
        category = Lexeme.OP
      } else {
        state = State.DONE
        category = Lexeme.OP
      }
    },
    // We have seen a minus and nothing else
    [State.MINUS]: function () {
      if (isDigit(ch)) {
        addOne()
        state = State.DIGIT
      } else if (ch === ".") {
        if (isDigit(nextChar())) {
          addOne()
          state = State.DIGDOT
        } else {
          state = State.DONE
          category = Lexeme.OP
        }
      } else if ("-=".includes(ch)) {
        addOne()
        state = State.DONE
        category = Lexeme.OP
      } else {
        state = State.DONE
        category = Lexeme.OP
      }
    },
    // We have seen a star, slash, or equal and nothing else
    [State.STAR]: function () {
      if (ch === "=") {
        addOne()
        state = State.DONE
        category = Lexeme.OP
      } else {
        state = State.DONE
        category = Lexeme.OP
      }
    }
  }

  // Return the current character at index position in the program.
  function currentChar () {
    return program[position]
  }

  // Return the next character, at index position + 1 in the program.
  function nextChar () {
    return program[position + 1]
  }

  // Move the current position to the next character.
  function dropOne () {
    position++
  }

  // Add the current character to the lexeme, and move to the next character
  function addOne () {
    lexeme += currentChar()
    dropOne()
  }

  // Skip whitespace and comments, moving position to the beginning of the next lexeme
  function skipToNextLexeme () {
    while (true) {
      // Skip whitespace
      while (isWhitespace(currentChar())) {
        dropOne()
      }

      // Done if there's no comments
      if (currentChar() !== "/" || nextChar() !== "*") {
        break
      }

      // Skip the remainder of the comment
      dropOne()
      dropOne()
      while (true) {
        if (currentChar() === "*" && nextChar() === "/") {
          dropOne()
          dropOne()
          break
        } else if (currentChar() === undefined) {
          // End of input reached?
          return
        }
        dropOne()
      }
    }
  }

  skipToNextLexeme()
  while (position < program.length) {
    lexeme = ""
    state = State.START
    while ((state as State) !== State.DONE) {
      ch = currentChar()
      handlers[state]()
    }
    skipToNextLexeme()
    // @ts-ignore
    yield { lexeme, category }
  }
}

export default lex
