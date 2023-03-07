import { lexer } from "./index"

const program = "a"
console.log(Array.from(lexer(program)))
// for (const lexeme of lexer(program)) {
//   console.log({ ...lexeme, category: LexemeNames[lexeme.category] })
// }
