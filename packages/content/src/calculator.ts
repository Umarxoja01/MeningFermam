/** Oddiy arifmetik formulalar. Kod, funksiya va obyektga murojaat bajarilmaydi. */
export const FORMULA_MAX_LENGTH = 200;
export const FORMULA_MAX_TOKENS = 100;

export class FormulaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FormulaError";
  }
}

type Token = { kind: "number"; value: number } | { kind: "variable"; value: string } | { kind: "symbol"; value: string };
const forbiddenKeys = new Set(["__proto__", "prototype", "constructor"]);

function finite(value: number): number {
  if (!Number.isFinite(value)) throw new FormulaError("Hisob natijasi juda katta yoki noto‘g‘ri.");
  return value;
}

function tokenize(formula: string): Token[] {
  if (!formula.trim()) throw new FormulaError("Hisoblash formulasi kiritilmagan.");
  if (formula.length > FORMULA_MAX_LENGTH) throw new FormulaError(`Formula ${FORMULA_MAX_LENGTH} belgidan oshmasligi kerak.`);
  const tokens: Token[] = [];
  let offset = 0;
  while (offset < formula.length) {
    if (/\s/.test(formula[offset]!)) { offset += 1; continue; }
    const rest = formula.slice(offset);
    const number = /^(?:\d+(?:\.\d*)?|\.\d+)/.exec(rest);
    const variable = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest);
    if (number) {
      tokens.push({ kind: "number", value: finite(Number(number[0])) });
      offset += number[0].length;
    } else if (variable) {
      tokens.push({ kind: "variable", value: variable[0] });
      offset += variable[0].length;
    } else if ("+-*/()".includes(formula[offset]!)) {
      tokens.push({ kind: "symbol", value: formula[offset]! });
      offset += 1;
    } else {
      throw new FormulaError("Formulada faqat sonlar, maydon kalitlari va + − × ÷ ( ) ishlatiladi.");
    }
    if (tokens.length > FORMULA_MAX_TOKENS) throw new FormulaError("Formula juda murakkab.");
  }
  return tokens;
}

/** Son qaytaradi; xatoda FormulaError. O‘zgaruvchilar faqat berilgan obyektning o‘z maydonlaridan olinadi. */
export function evaluateFormula(formula: string, variables: Readonly<Record<string, number>>): number {
  const tokens = tokenize(formula);
  let cursor = 0;
  const symbol = (value: string) => tokens[cursor]?.kind === "symbol" && tokens[cursor]?.value === value;
  const syntax = () => new FormulaError("Formulaning yozilishida xato bor. Qavs va amallarni tekshiring.");

  function primary(): number {
    const token = tokens[cursor];
    if (!token) throw syntax();
    if (symbol("+")) { cursor += 1; return primary(); }
    if (symbol("-")) { cursor += 1; return finite(-primary()); }
    if (symbol("(")) {
      cursor += 1;
      const value = expression();
      if (!symbol(")")) throw syntax();
      cursor += 1;
      return value;
    }
    cursor += 1;
    if (token.kind === "number") return token.value;
    if (token.kind === "variable") {
      if (forbiddenKeys.has(token.value) || !Object.prototype.hasOwnProperty.call(variables, token.value)) {
        throw new FormulaError(`“${token.value}” hisoblash maydoni topilmadi.`);
      }
      const value = variables[token.value];
      if (typeof value !== "number") throw new FormulaError("Hisoblash maydoniga son kiriting.");
      return finite(value);
    }
    throw syntax();
  }

  function product(): number {
    let value = primary();
    while (symbol("*") || symbol("/")) {
      const divide = symbol("/");
      cursor += 1;
      const right = primary();
      if (divide && right === 0) throw new FormulaError("Nolga bo‘lish mumkin emas. Qiymatni o‘zgartiring.");
      value = finite(divide ? value / right : value * right);
    }
    return value;
  }

  function expression(): number {
    let value = product();
    while (symbol("+") || symbol("-")) {
      const subtract = symbol("-");
      cursor += 1;
      const right = product();
      value = finite(subtract ? value - right : value + right);
    }
    return value;
  }

  const result = expression();
  if (cursor !== tokens.length) throw syntax();
  return finite(result);
}
