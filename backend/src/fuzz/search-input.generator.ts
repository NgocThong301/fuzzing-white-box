/**
 * Input Generators for Search Fuzzing
 * Generates various types of test inputs based on the target function's expected parameters
 */

import { SearchListingDto } from '../modules/listing/dto/listing.dto';

// Type for generated search inputs
export interface GeneratedSearchInput {
  name: string;
  input: Partial<SearchListingDto>;
  category: InputCategory;
}

export type InputCategory =
  | 'normal'
  | 'empty'
  | 'very_long'
  | 'special_chars'
  | 'unicode'
  | 'type_confusion'
  | 'sql_injection'
  | 'xss'
  | 'path_traversal'
  | 'boundary';

/**
 * Normal inputs - typical search queries
 */
const normalInputs: string[] = [
  'iphone',
  'laptop',
  'áo',
  'Canon',
  'Nike',
  'điện thoại',
  'sách giáo khoa',
  'programming',
  'math',
  'physics',
  'economics',
  'law',
  'toán',
  'văn',
  'english',
  'computer science',
  'business',
];

/**
 * Empty inputs
 */
const emptyInputs: string[] = [
  '',
  ' ',
  '\t',
  '\n',
  '\r\n',
  '   ',
  '\n\n\n',
];

/**
 * Special characters that might cause issues
 */
const specialChars = [
  "'",
  '"',
  '`',
  ';',
  '--',
  '#',
  '/*',
  '*/',
  '%',
  '_',
  '\\',
  '<',
  '>',
  '&',
  '=',
  '+',
  '-',
  '(',
  ')',
  '[',
  ']',
  '{',
  '}',
  '!',
  '@',
  '$',
  '^',
  '*',
  '|',
  '~',
  '?',
];

/**
 * SQL Injection patterns
 */
const sqlInjectionPatterns = [
  "' OR '1'='1",
  "' OR '1'='1' --",
  '" OR "1"="1',
  "'; DROP TABLE users; --",
  "1' AND '1'='1",
  "1 OR 1=1",
  "admin'--",
  "' UNION SELECT NULL--",
  "1; SELECT * FROM users",
  "' OR 1=1--",
  '" OR ""="',
  "1' OR '1'='1",
];

/**
 * XSS patterns
 */
const xssPatterns = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
  'javascript:alert(1)',
  '<iframe src="javascript:alert(1)">',
  '<body onload=alert(1)>',
  '<input onfocus=alert(1) autofocus>',
  "';alert(1);//",
  '<script>console.log(document.cookie)</script>',
  '<img src="x" onerror="fetch(\'http://evil.com\')">',
];

/**
 * Path traversal patterns
 */
const pathTraversalPatterns = [
  '../../../../etc/passwd',
  '..\\..\\..\\..\\windows\\system32',
  '....//....//....//etc/passwd',
  '/etc/passwd',
  'C:\\Windows\\System32\\config\\sam',
  '../../../..',
  '..%2F..%2F..%2Fetc%2Fpasswd',
];

/**
 * Unicode characters
 */
const unicodeInputs = [
  'áo',
  'điện thoại',
  '日本語',
  '中文',
  '한국어',
  'Русский',
  'العربية',
  'ελληνικά',
  'עברית',
  '😀',
  '🔥',
  'é',
  'ü',
  'ñ',
  'ø',
  'œ',
  'â',
  'ț',
  'ș',
  'ả',
  'ỏ',
  'ę',
  'ł',
  'ż',
  'ś',
  'ć',
  // Combining characters
  'a\u0301', // á
  'e\u0300', // è
  'o\u0302', // ô
  'a\u0308', // ä
  'u\u0306', // ư
];

/**
 * Type confusion values
 */
const typeConfusionValues: (string | number | boolean | null | undefined | object)[] = [
  null,
  undefined,
  0,
  -1,
  1,
  true,
  false,
  NaN,
  Infinity,
  -Infinity,
  '[]',
  '{}',
  'new Date()',
];

/**
 * Generate very long strings
 */
export function generateLongStrings(): { name: string; value: string }[] {
  const lengths = [100, 1000, 5000, 10000];
  const charTypes = ['a', 'á', '中文', '123', '!@#$%'];

  const results: { name: string; value: string }[] = [];

  for (const length of lengths) {
    for (const charType of charTypes) {
      results.push({
        name: `long_${length}_${charType === 'a' ? 'ascii' : charType === 'á' ? 'unicode' : charType}`,
        value: charType.repeat(length),
      });
    }
  }

  return results;
}

/**
 * Generate random special character combinations
 */
export function generateSpecialCharCombinations(): string[] {
  const results: string[] = [];

  // Single special chars
  for (const char of specialChars) {
    results.push(char);
  }

  // Combinations
  results.push("' OR '1'='1");
  results.push('"; DROP TABLE--');
  results.push("'--");
  results.push('/**/UNION');
  results.push('%%');
  results.push('__');
  results.push('\\\\');
  results.push('&&');
  results.push('||');
  results.push('==');
  results.push('!=');
  results.push('<script>');
  results.push('</script>');
  results.push('< >');
  results.push('( )');
  results.push('[ ]');
  results.push('{ }');

  // Repeated
  results.push("'".repeat(100));
  results.push('='.repeat(100));
  results.push('-'.repeat(100));

  return results;
}

/**
 * Generate boundary values for numeric fields
 */
export function generateBoundaryInputs(): Partial<SearchListingDto>[] {
  return [
    { page: 0 },
    { page: -1 },
    { page: 1 },
    { page: 999999999 },
    { limit: 0 },
    { limit: -1 },
    { limit: 1 },
    { limit: 1000 },
    { limit: 100000 },
    { minPrice: 0 },
    { minPrice: -1 },
    { minPrice: 1 },
    { maxPrice: 0 },
    { maxPrice: -1 },
    { maxPrice: 1 },
    { maxPrice: 999999999 },
    // universityId filters through major.universityId
    { universityId: 1 },
    { universityId: 999 },
    { majorId: 0 },
    { majorId: -1 },
    { majorId: 1 },
    { courseId: 0 },
    { courseId: -1 },
    { courseId: 1 },
    { categoryId: 0 },
    { categoryId: -1 },
    { categoryId: 1 },
    { q: 'a'.repeat(9999) }, // Very long search
  ];
}

/**
 * Generate all test inputs
 */
export function generateAllInputs(): GeneratedSearchInput[] {
  const inputs: GeneratedSearchInput[] = [];

  // Normal inputs
  for (const q of normalInputs) {
    inputs.push({
      name: `normal_${q}`,
      input: { q },
      category: 'normal',
    });
  }

  // Empty inputs
  for (const q of emptyInputs) {
    inputs.push({
      name: `empty_${JSON.stringify(q)}`,
      input: { q },
      category: 'empty',
    });
  }

  // Very long inputs
  for (const { name, value } of generateLongStrings()) {
    inputs.push({
      name: `long_${name}`,
      input: { q: value },
      category: 'very_long',
    });
  }

  // Special characters
  for (const q of generateSpecialCharCombinations()) {
    inputs.push({
      name: `special_${Buffer.from(q).toString('base64').slice(0, 20)}`,
      input: { q },
      category: 'special_chars',
    });
  }

  // Unicode
  for (let i = 0; i < unicodeInputs.length; i++) {
    inputs.push({
      name: `unicode_${i}`,
      input: { q: unicodeInputs[i] },
      category: 'unicode',
    });
  }

  // SQL Injection
  for (let i = 0; i < sqlInjectionPatterns.length; i++) {
    inputs.push({
      name: `sqli_${i}`,
      input: { q: sqlInjectionPatterns[i] },
      category: 'sql_injection',
    });
  }

  // XSS
  for (let i = 0; i < xssPatterns.length; i++) {
    inputs.push({
      name: `xss_${i}`,
      input: { q: xssPatterns[i] },
      category: 'xss',
    });
  }

  // Path Traversal
  for (let i = 0; i < pathTraversalPatterns.length; i++) {
    inputs.push({
      name: `path_${i}`,
      input: { q: pathTraversalPatterns[i] },
      category: 'path_traversal',
    });
  }

  // Type confusion with q field
  for (let i = 0; i < typeConfusionValues.length; i++) {
    const val = typeConfusionValues[i];
    inputs.push({
      name: `type_confusion_q_${i}`,
      input: { q: val as any } as Partial<SearchListingDto>,
      category: 'type_confusion',
    });
  }

  // Boundary values
  for (const boundaryInput of generateBoundaryInputs()) {
    inputs.push({
      name: `boundary_${JSON.stringify(boundaryInput)}`,
      input: boundaryInput,
      category: 'boundary',
    });
  }

  return inputs;
}

/**
 * Mutation functions for mutation-based fuzzing
 */
export class SearchInputMutator {
  private randomFunc: () => number;

  constructor(private seed?: number) {
    if (seed !== undefined) {
      this.randomFunc = this.createSeededRandom(seed);
    } else {
      this.randomFunc = Math.random;
    }
  }

  private createSeededRandom(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      return state / 0x7fffffff;
    };
  }

  private random(): number {
    return this.randomFunc();
  }

  /**
   * Add random characters to input
   */
  addChars(input: string, count = 5): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzáéóảủủửữừạọệỉưỡợụâêôơìờỏỏắằặềểễếệểễệảả';
    let result = input;
    for (let i = 0; i < count; i++) {
      const pos = Math.floor(this.random() * (result.length + 1));
      const char = chars[Math.floor(this.random() * chars.length)];
      result = result.slice(0, pos) + char + result.slice(pos);
    }
    return result;
  }

  /**
   * Delete random characters from input
   */
  deleteChars(input: string, count = 5): string {
    let result = input;
    for (let i = 0; i < count && result.length > 1; i++) {
      const pos = Math.floor(this.random() * result.length);
      result = result.slice(0, pos) + result.slice(pos + 1);
    }
    return result;
  }

  /**
   * Replace random characters in input
   */
  replaceChars(input: string, count = 5): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    const arr = input.split('');
    for (let i = 0; i < count && arr.length > 0; i++) {
      const pos = Math.floor(this.random() * arr.length);
      arr[pos] = chars[Math.floor(this.random() * chars.length)];
    }
    return arr.join('');
  }

  /**
   * Repeat input string
   */
  repeat(input: string, times = 2): string {
    return input.repeat(times);
  }

  /**
   * Insert special characters
   */
  insertSpecialChars(input: string, count = 3): string {
    const specials = ["'", '"', ';', '--', '/*', '*/', '<', '>', '&', '\\'];
    let result = input;
    for (let i = 0; i < count; i++) {
      const pos = Math.floor(this.random() * (result.length + 1));
      const special = specials[Math.floor(this.random() * specials.length)];
      result = result.slice(0, pos) + special + result.slice(pos);
    }
    return result;
  }

  /**
   * Mutate Unicode characters
   */
  mutateUnicode(input: string): string {
    // Replace some chars with similar Unicode lookalikes
    const replacements: Record<string, string[]> = {
      a: ['á', 'à', 'ả', 'ạ', 'ä', 'å'],
      e: ['é', 'è', 'ẻ', 'ẹ', 'ë'],
      i: ['í', 'ì', 'ỉ', 'ị', 'ï'],
      o: ['ó', 'ò', 'ỏ', 'ọ', 'ö', 'ø'],
      u: ['ú', 'ù', 'ủ', 'ụ', 'ü'],
    };

    const arr = input.split('');
    for (let i = 0; i < arr.length; i++) {
      const lower = arr[i].toLowerCase();
      if (replacements[lower] && this.random() > 0.5) {
        const alternatives = replacements[lower];
        arr[i] = alternatives[Math.floor(this.random() * alternatives.length)];
      }
    }
    return arr.join('');
  }

  /**
   * Apply multiple mutations
   */
  mutate(input: string): string {
    const mutations = [
      () => this.addChars(input, Math.floor(this.random() * 10) + 1),
      () => this.deleteChars(input, Math.floor(this.random() * 5) + 1),
      () => this.replaceChars(input, Math.floor(this.random() * 5) + 1),
      () => this.repeat(input, Math.floor(this.random() * 3) + 1),
      () => this.insertSpecialChars(input, Math.floor(this.random() * 3) + 1),
      () => this.mutateUnicode(input),
    ];

    const mutation = mutations[Math.floor(this.random() * mutations.length)];
    return mutation();
  }
}
