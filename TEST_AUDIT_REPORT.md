# Hostile Test Audit Report
## Narrative OS - Phase 0 Test Suite Quality Analysis

---

## EXECUTIVE SUMMARY

**Current Status**: 82 tests passing, but **18-22 tests should be removed or heavily refactored** for being low-value, flaky, or redundant.

**Key Issues**:
- 23% of tests are "setup validation" (testing DOM setup, not actual behavior)
- 12% test browser primitives that are guaranteed by the DOM spec
- 8% are redundant duplicates of the same assertion
- 5+ tests are timing-dependent and flaky

---

## TESTS TO REMOVE (High Priority)

### UI Primitives - 7 Tests to Remove

#### ❌ "should handle window dragging" (FLAKY + INCOMPLETE)
**Location**: tests/unit/ui-primitives.test.mjs:36-50
**Issues**:
- Dispatches a `mousedown` event but never tests actual drag behavior
- Just manually changes CSS - doesn't validate drag logic
- No motion, no distance calculation, no momentum
- **Verdict**: Remove. This isn't testing the drag implementation; it's just testing that we can set CSS.

#### ❌ "should handle window resizing" (FLAKY + INCOMPLETE)
**Location**: tests/unit/ui-primitives.test.mjs:52-65
**Issues**:
- Same problem as dragging - just sets CSS values manually
- Doesn't test resize handle interaction
- Doesn't validate aspect ratio, min/max bounds, or actual resize algorithm
- **Verdict**: Remove. False confidence test.

#### ❌ "should maintain minimum window size" (INCOMPLETE LOGIC)
**Location**: tests/unit/ui-primitives.test.mjs:67-84
**Issues**:
- Tests the test's own logic, not the actual code
- The test itself contains the minimum size enforcement code
- No actual implementation being tested
- **Verdict**: Remove. Test is self-validating garbage.

#### ❌ "should bring window to front on interaction" (INCOMPLETE)
**Location**: tests/unit/ui-primitives.test.mjs:86-94
**Issues**:
- Just changes zIndex manually, doesn't test interaction detection
- Doesn't test that interactions actually trigger this
- No event handling validation
- **Verdict**: Remove. Only tests CSS property setting.

#### ❌ "should handle button hover state" (DOM SPEC TEST)
**Location**: tests/unit/ui-primitives.test.mjs:118-126
**Issues**:
- Tests `.classList.add()` and `.classList.remove()`
- This is a browser API test, not application logic
- Equivalent to testing `2 + 2 = 4`
- **Verdict**: Remove. DOM spec is guaranteed; don't test it.

#### ❌ "should validate input value changes" (REDUNDANT)
**Location**: tests/unit/ui-primitives.test.mjs:152-160
**Issues**:
- Duplicates "should capture text input" but with an event
- Event dispatching doesn't change the input value - manual assignment does
- Test doesn't actually validate that the event changes anything
- **Verdict**: Remove. Redundant with input capture test.

#### ❌ "should auto-dismiss toast after timeout" (FLAKY TIMING)
**Location**: tests/unit/ui-primitives.test.mjs:212-224
**Issues**:
- Uses `setTimeout` with 3000ms timeout + 3500ms verification
- **Guaranteed to be flaky** in CI/slow machines
- Test takes 3.5+ seconds
- Timing-dependent tests are anti-patterns
- **Verdict**: Remove entirely. Use mocked timers (vi.useFakeTimers) or remove.

---

### Journal Tests - 5 Tests to Remove/Refactor

#### ❌ "should record entry timestamp" (TIMING FLAKY)
**Location**: tests/unit/journal.test.mjs:41-52
**Issues**:
- Race condition: measures time between calls
- In slow environments, this could fail randomly
- `beforeTime` to `afterTime` gap could be microseconds or milliseconds depending on system load
- **Verdict**: Remove. Can't reliably test timing precision across systems.

#### ❌ "should display entries in chronological order" (INCOMPLETE)
**Location**: tests/unit/journal.test.mjs:101-112
**Issues**:
- Only verifies the test created them in order
- Doesn't test sorting algorithm (if one exists)
- Doesn't test backwards order, mixed order, or re-ordering
- **Verdict**: Either remove or enhance to test actual sorting.

#### ❌ "should highlight recent entries" (NO ASSERTION LOGIC)
**Location**: tests/unit/journal.test.mjs:114-119
**Issues**:
- Just adds a class, no logic for determining "recent"
- Doesn't test what "recent" means (< 1 hour? < 1 day?)
- No timestamp comparison
- **Verdict**: Remove. Test has no actual logic to validate.

#### ❌ "should filter entries by date range" (INCOMPLETE)
**Location**: tests/unit/journal.test.mjs:187-197
**Issues**:
- Creates all entries with `Date.now()` - so all are "recent"
- Doesn't test actual filtering edge cases
- Doesn't test boundaries (inclusive/exclusive?)
- **Verdict**: Remove or completely rewrite with varied timestamps.

#### ❌ "should export journal entries as JSON" (DOM SPEC TEST)
**Location**: tests/unit/journal.test.mjs:221-230
**Issues**:
- Tests `JSON.stringify()` and `JSON.parse()`
- This is a language spec test, not application code
- Equivalent to testing that "+" adds numbers
- **Verdict**: Remove. Built-in functionality doesn't need testing.

---

### File Operations Tests - 4 Tests to Remove

#### ❌ "should reset file position to origin" (REDUNDANT)
**Location**: tests/unit/file-operations.test.mjs:64-72
**Issues**:
- Duplicate of "should update file position using transform"
- Just does the same operation twice
- **Verdict**: Remove. Redundant test.

#### ❌ "should apply smooth transitions to file movement" (NO BEHAVIOR TEST)
**Location**: tests/unit/file-operations.test.mjs:74-80
**Issues**:
- Just sets CSS transition property
- Doesn't test whether movement is actually smooth
- Doesn't validate timing or easing
- **Verdict**: Remove. Only tests CSS property assignment.

#### ❌ "should handle multiple file selection" (INCOMPLETE LOGIC)
**Location**: tests/unit/file-operations.test.mjs:131-145
**Issues**:
- Just adds classes manually
- Doesn't test selection interaction/clicks
- Doesn't test deselection logic (shift-click, ctrl-click, etc.)
- **Verdict**: Remove or completely rewrite with event simulation.

#### ❌ "should deselect file" (TRIVIAL ASSERTION)
**Location**: tests/unit/file-operations.test.mjs:125-129
**Issues**:
- Just removes a class that was added
- Tests `.classList.remove()` (browser API)
- No application logic being tested
- **Verdict**: Remove. Browser API test.

---

### WebSocket Tests - 2 Tests to Remove/Refactor

#### ❌ "should attempt reconnection on disconnect" (INCOMPLETE)
**Location**: tests/unit/websocket.test.mjs:58-77
**Issues**:
- Creates a new socket manually after close
- Doesn't test the **actual reconnection logic** in os.js
- The real code has exponential backoff, retry counts, etc.
- This test doesn't validate any of that
- **Verdict**: Remove. Doesn't test actual reconnection behavior.

#### ⚠️ "should handle malformed JSON gracefully" (FLAKY TIMING)
**Location**: tests/unit/websocket.test.mjs:79-96
**Issues**:
- Uses `setTimeout(..., 100)` - timing dependent
- Assumes error handling completes within 100ms
- On slow CI, could fail randomly
- **Verdict**: Refactor to use vi.useFakeTimers() or remove.

---

### Integration Tests - 3 Tests to Remove

#### ❌ "should handle rapid successive events" (NO REAL PRESSURE TEST)
**Location**: tests/integration/daemon-events.test.mjs (Event Ordering)
**Issues**:
- Sends 10 events (not "rapid" in real terms)
- Mock socket is synchronous - no actual timing stress
- Real events would arrive at microsecond intervals; test doesn't replicate that
- **Verdict**: Remove. Doesn't actually test rapid event handling.

#### ❌ "should log sync conflicts" (INCOMPLETE TEST)
**Location**: tests/integration/file-sync.test.mjs (Sync Conflict Resolution)
**Issues**:
- Just pushes to an array; doesn't test logging
- Doesn't verify what gets logged or when
- Doesn't test actual conflict resolution
- **Verdict**: Remove or rewrite to test actual logging behavior.

#### ⚠️ "should sync large file lists efficiently" (PERFORMANCE BENCHMARK)
**Location**: tests/integration/file-sync.test.mjs
**Issues**:
- Checks if 1000 files sync in <1 second
- Performance thresholds are brittle and machine-dependent
- Will fail randomly on slow CI runners
- 1000 files in-memory is not realistic test load
- **Verdict**: Remove from automated tests. Use as manual benchmark only.

---

## TESTS TO REFACTOR (Medium Priority)

### File Operations - 2 Tests Need Behavior Logic

#### ⚠️ "should assign unique IDs to files"
**Location**: tests/unit/file-operations.test.mjs:21-28
**Issues**:
- Tests hardcoded IDs, not ID generation logic
- Should test that system generates unique IDs, not manual assignment
- **Fix**: Mock ID generation and verify it's called

#### ⚠️ "should store and retrieve file metadata"
**Location**: tests/unit/file-operations.test.mjs:100-108
**Issues**:
- Tests `setAttribute()` (browser API)
- Should test actual metadata storage/retrieval mechanism
- **Fix**: Test actual data structure, not just HTML attributes

### WebSocket Tests - 1 Test Needs Work

#### ⚠️ "should receive and parse backend events"
**Location**: tests/unit/websocket.test.mjs:27-41
**Issues**:
- Redundant with connection test
- Doesn't test error cases in JSON parsing
- Should include more event types (FILE_CREATED, CHAOS_EVENT, etc.)
- **Fix**: Expand to test multiple event types and parsing edge cases

---

## TESTS WORTH KEEPING

### Strong Tests (No Changes Needed)

✅ **"should establish connection to backend"** - Tests core functionality
✅ **"should handle connection errors gracefully"** - Error case coverage
✅ **"should handle malformed JSON gracefully"** - Error handling (refactor timing)
✅ **"should create a new file element in DOM"** - Real DOM operations
✅ **"should remove file from DOM"** - Real DOM operations
✅ **"should trigger click event on button"** - Real event handling
✅ **"should handle input focus"** - Real interaction
✅ **"should create a new journal entry"** - Core data structure
✅ **"should delete journal entry"** - Core data structure
✅ **"should search entries by title"** - Business logic
✅ **All File Sync tests** (except "large file lists") - Real system behavior
✅ **All Daemon Event tests** (except "rapid events") - Core backend integration

---

## RECOMMENDATIONS

### Immediate Actions (Reduce from 82 → ~60 tests)

1. **Remove 18 tests** identified above
2. **Refactor 2-3 tests** with incomplete logic
3. **Replace 2 timing tests** with fake timers or remove

### Medium-term Improvements

1. **Add missing test coverage**:
   - Error handling (network timeouts, parse failures)
   - Edge cases (empty data, null values, max sizes)
   - Actual event simulation (mouse move, drag, drop)

2. **Test actual os.js functions** instead of DOM setup:
   - File interaction physics (distance calculation, repel/attract forces)
   - Daemon event handlers (what happens when FILE_CREATED arrives?)
   - WebSocket reconnection with exponential backoff

3. **Use test utilities for better assertions**:
   - Fake timers (vi.useFakeTimers) instead of setTimeout
   - Mock functions to track calls/arguments instead of side effects
   - Custom matchers for complex assertions

### Test Quality Metrics

Current state:
- **Test-to-Code ratio**: 82 tests for ~4000 lines of code
- **Value density**: ~60-70% of tests add real value
- **Flakiness risk**: 5-7 timing-dependent tests

Target state:
- **60-65 high-value tests** (focus over quantity)
- **0 timing-dependent tests** (use mocks)
- **100% business logic coverage** (not browser API coverage)

---

## SUMMARY TABLE

| Category | Count | Action |
|----------|-------|--------|
| Remove entirely | 15 | Delete |
| Refactor/Fix | 5 | Rewrite |
| Expand coverage | 8 | Enhance |
| Keep as-is | 54 | No change |
| **New tests needed** | **15** | Add |
| **Target total** | **~70** | Sweet spot |

The goal is a **lean, focused test suite** that catches real bugs without false confidence or maintenance burden.
