# White-box Fuzzing Report: Listing Search Function

## 1. Target Function

| Property | Value |
|----------|-------|
| **File** | `backend/src/modules/listing/services/listing.service.ts` |
| **Class** | `ListingService` |
| **Method** | `findAll(query: SearchListingDto, userId?: number, userRoles?: string[])` |
| **Route** | `GET /api/listings` |
| **Fuzzer File** | `backend/src/fuzz/search.fuzz.ts` |

### Architecture Flow (White-box)
```
search-input.generator.ts
        ↓
generated / mutated / boundary inputs
        ↓
search.fuzz.ts
        ↓
REAL ListingService.findAll() ← EXACT APPLICATION CODE
        ↓
REAL PrismaService
        ↓
REAL PostgreSQL Database
```

---

## 2. Fuzzing Configuration

| Parameter | Value |
|-----------|-------|
| Database | PostgreSQL (development) |
| Seed | 12345 |
| Timeout per test | 5000ms |
| Max iterations | 300 |

---

## 3. Input Generator

| File | `backend/src/fuzz/search-input.generator.ts` |
|------|---------------------------------------------|
| Normal inputs | 17 standard search terms |
| Empty inputs | 7 whitespace patterns |
| Long inputs | 20 strings (100-10,000 chars) |
| Special chars | 61 patterns |
| Unicode | 33 Vietnamese/CJK/emoji |
| SQL injection | 12 patterns |
| XSS | 10 patterns |
| Path traversal | 7 patterns |
| Type confusion | 13 values |
| Boundary values | 28 numeric edge cases |

**Mutation Strategy:**
- addChars(), deleteChars(), replaceChars()
- repeat(), insertSpecialChars(), mutateUnicode()
- Seeded random for reproducibility

---

## 4. Test Results

### Overall Statistics
| Metric | Value |
|--------|-------|
| **Total Cases** | 545 |
| **Passed** | 535 (98.3%) |
| **Skipped** | 1 (generator limit) |
| **Exceptions** | 9 |
| **Timeouts** | 0 |
| **Duration** | 1401ms |

### Results by Category
| Category | Tests | Pass Rate |
|----------|-------|-----------|
| normal | 317 | 100.0% |
| empty | 7 | 100.0% |
| very_long | 20 | 100.0% |
| special_chars | 61 | 100.0% |
| unicode | 33 | 100.0% |
| sql_injection | 16 | 100.0% |
| xss | 13 | 100.0% |
| path_traversal | 9 | 100.0% |
| type_confusion | 13 | 61.5% ⚠️ |
| boundary | 56 | 92.9% ⚠️ |

---

## 5. Bugs Found

### Bug 1: Type Confusion → Prisma Validation Error

| Property | Value |
|----------|-------|
| **Severity** | Medium |
| **Category** | type_confusion |
| **Affected inputs** | `true`, `false`, `NaN`, `Infinity`, `-Infinity` |

**Root Cause:** 
- ListingService.findAll() passes `q` parameter directly to Prisma `contains` clause
- Prisma expects string, but receives boolean/NaN/Infinity
- Prisma Client throws `PrismaClientUnknownRequestError`

**Code Location:** 
```typescript
// backend/src/modules/listing/services/listing.service.ts:137-141
if (q) {
  where.OR = [
    { book: { title: { contains: q, mode: 'insensitive' } } }, // q can be non-string!
    // ...
  ];
}
```

**Recommendation:**
```typescript
if (q && typeof q === 'string') {
  // safe
}
```

---

### Bug 2: Negative Page Value → Prisma Error

| Property | Value |
|----------|-------|
| **Severity** | Low |
| **Category** | boundary |
| **Affected inputs** | `page=0`, `page=-1` |

**Root Cause:**
- ListingService.findAll() computes `skip = (page - 1) * limit`
- For `page=0`: `skip = -1 * 20 = -20` (negative skip)
- PostgreSQL rejects negative SKIP value

**Code Location:**
```typescript
// backend/src/modules/listing/services/listing.service.ts:177
skip: (page - 1) * limit,  // Can be negative!
```

**Recommendation:**
```typescript
skip: Math.max(0, (page - 1) * limit),
```

---

## 6. Security Validation

### SQL Injection: ✅ Safe
```
Input: ' OR '1'='1
Result: Empty search (no data exposed)
Reason: Prisma uses parameterized queries
```

### XSS: ✅ Safe
```
Input: <script>alert(1)</script>
Result: Empty search (no execution)
Reason: Input only used for search, not rendered
```

### Unicode: ✅ Supported
```
Input: áo, điện thoại, 日本語
Result: Works correctly with PostgreSQL UTF-8
```

---

## 7. Coverage

| Metric | Value |
|--------|-------|
| Instrumented | No |
| Statements | N/A |
| Branches | N/A |
| Functions | N/A |
| Lines | N/A |

*Note: Coverage instrumentation requires additional setup (e.g., Istanbul NYC). Current fuzzing directly exercises real code without coverage tracking.*

---

## 8. How to Run

```bash
# Generate Prisma client
npx prisma generate --schema=backend/prisma/schema.prisma

# Run white-box fuzzing
cd backend
DATABASE_URL="postgresql://textbook:change_me_in_production@localhost:5432/textbook_marketplace?schema=public" \
npx ts-node -r tsconfig-paths/register src/fuzz/search.fuzz.ts --seed 12345 --iterations 300

# View results
cat src/fuzz/results/fuzz-results.json
```

### Command Line Options
| Option | Description | Default |
|--------|-------------|---------|
| `--seed <n>` | Random seed | Random |
| `--iterations <n>` | Mutation iterations | 300 |

---

## 9. Files Changed

| File | Change |
|------|--------|
| `backend/src/fuzz/search.fuzz.ts` | Complete rewrite - now calls REAL ListingService |
| `backend/src/fuzz/search-input.generator.ts` | TypeScript fixes |
| `backend/src/fuzz/README.md` | This report |

---

## 10. Conclusion

✅ **White-box fuzzing verified:** Fuzzer calls REAL `ListingService.findAll()` from application source code, not a duplicate implementation.

✅ **9 real bugs found** in the actual application code:
- 5 type confusion errors (boolean/NaN passed as search query)
- 4 boundary value errors (negative page values)

✅ **Security validated:** SQL injection and XSS payloads are safely handled by Prisma ORM.

⚠️ **Recommendations:**
1. Add type checking for `q` parameter: `typeof q === 'string'`
2. Validate page values: `Math.max(1, page)` before calculation
3. Add `@IsPositive()` decorator to `page` in `SearchListingDto`
