# Test Cleanup Implementation Plan

## Phase 1: Immediate Deletions (15 tests)

### ui-primitives.test.mjs - DELETE 7 tests

```javascript
// DELETE: Lines 36-50 - "should handle window dragging"
// REASON: Incomplete - just sets CSS, doesn't test drag behavior

// DELETE: Lines 52-65 - "should handle window resizing"
// REASON: Incomplete - just sets CSS, doesn't test resize behavior

// DELETE: Lines 67-84 - "should maintain minimum window size"
// REASON: Self-validating - test contains its own logic

// DELETE: Lines 86-94 - "should bring window to front on interaction"
// REASON: Incomplete - just sets zIndex, no interaction testing

// DELETE: Lines 118-126 - "should handle button hover state"
// REASON: DOM spec test - tests .classList API, not app logic

// DELETE: Lines 152-160 - "should validate input value changes"
// REASON: Redundant with "should capture text input"

// DELETE: Lines 212-224 - "should auto-dismiss toast after timeout"
// REASON: Flaky timing test - 3.5 second timeout, machine-dependent
```

**Remaining**: 12/19 tests in ui-primitives

### journal.test.mjs - DELETE 5 tests

```javascript
// DELETE: Lines 41-52 - "should record entry timestamp"
// REASON: Flaky timing test - race condition in beforeTime/afterTime

// DELETE: Lines 101-112 - "should display entries in chronological order"
// REASON: Incomplete - only tests manual array order, not sorting logic

// DELETE: Lines 114-119 - "should highlight recent entries"
// REASON: No actual logic - doesn't define what "recent" means

// DELETE: Lines 187-197 - "should filter entries by date range"
// REASON: All entries have same timestamp - doesn't test filtering

// DELETE: Lines 221-230 - "should export journal entries as JSON"
// REASON: Language spec test - tests JSON.stringify/parse, not app logic
```

**Remaining**: 12/17 tests in journal

### file-operations.test.mjs - DELETE 4 tests

```javascript
// DELETE: Lines 64-72 - "should reset file position to origin"
// REASON: Redundant with "should update file position using transform"

// DELETE: Lines 74-80 - "should apply smooth transitions to file movement"
// REASON: Only tests CSS property - doesn't validate smoothness

// DELETE: Lines 125-129 - "should deselect file"
// REASON: DOM spec test - tests .classList.remove()

// DELETE: Lines 131-145 - "should handle multiple file selection"
// REASON: Incomplete - no event simulation, just manual class addition
```

**Remaining**: 8/12 tests in file-operations

### websocket.test.mjs - DELETE 1 test, REFACTOR 1

```javascript
// DELETE: Lines 58-77 - "should attempt reconnection on disconnect"
// REASON: Doesn't test actual reconnection logic (exponential backoff, retries)

// REFACTOR: Lines 79-96 - "should handle malformed JSON gracefully"
// ISSUE: Uses setTimeout(100ms) - timing flaky
// FIX: Use vi.useFakeTimers() or remove setTimeout dependency
```

**Remaining**: 4/5 tests in websocket

### daemon-events.test.mjs - DELETE 1 test

```javascript
// DELETE: Event Ordering section - "should handle rapid successive events"
// REASON: Mock socket is synchronous - doesn't test real rapid events
```

**Remaining**: 12/13 tests in daemon-events

### file-sync.test.mjs - DELETE 2 tests

```javascript
// DELETE: Sync Performance - "should sync large file lists efficiently"
// REASON: Performance threshold brittle - fails randomly on slow CI

// DELETE: Sync Conflict Resolution - "should log sync conflicts"
// REASON: Just pushes to array - doesn't test actual logging behavior
```

**Remaining**: 14/16 tests in file-sync

---

## Phase 2: Refactoring (5 tests)

### ui-primitives.test.mjs - KEEP with enhancements

```javascript
// CURRENT: Tests just set values manually
// NEEDED: Test actual drag/resize event handlers
// ACTION: Mock event handlers, verify they're called with correct deltas

// Suggested test:
it('should handle window dragging via events', () => {
  const window1 = document.getElementById('window-1');
  const title = window1.querySelector('.window-title');

  // Create handler that actually moves the window
  let dragHandler = (e) => {
    // This should exist in real implementation
  };

  title.addEventListener('mousedown', dragHandler);
  // Simulate actual drag with mousemove
  // Verify position changed correctly
});
```

### file-operations.test.mjs - KEEP with enhancements

```javascript
// CURRENT: "should assign unique IDs to files"
// FIX: Test ID generation, not hardcoded strings
// IMPLEMENTATION: Mock an ID generator
// VERIFY: System generates unique, non-repeating IDs

// CURRENT: "should store and retrieve file metadata"
// FIX: Test actual metadata object/structure
// IMPLEMENTATION: Test getting metadata back, not just setting attributes
// VERIFY: Metadata persists and retrieves correctly
```

### websocket.test.mjs - KEEP with improvements

```javascript
// CURRENT: "should handle malformed JSON gracefully"
// FIX: Replace setTimeout with vi.useFakeTimers()
// NEW CODE:
it('should handle malformed JSON gracefully', () => {
  vi.useFakeTimers();
  const ws = new MockWebSocket(WS_URL);
  let errorCaught = false;

  ws.onopen = () => {
    mockWSServer.clients()[0].send('{ invalid json }');
  };

  ws.onerror = () => {
    errorCaught = true;
  };

  vi.advanceTimersByTime(100);
  expect(ws.readyState).toBe(WebSocket.OPEN);
  vi.useRealTimers();
});
```

---

## Phase 3: Coverage Gaps to Fill (15 new tests)

### Missing: Real Event Handling
- Drag/drop file interactions
- Window resize event handlers
- Double-click to open
- Right-click context menu

### Missing: Backend Integration
- What happens when daemon sends FILE_CREATED?
- What happens when FILE_DELETED arrives?
- Journal entry display from backend events
- File sync after chaos events

### Missing: Error Cases
- WebSocket timeout (not just close)
- Corrupted file data in sync
- Partial event delivery
- Network latency simulation

### Missing: Edge Cases
- Empty file lists
- Very large file names/data
- Rapid file create/delete
- Concurrent operations

---

## Execution Order

```bash
# Step 1: Run current tests (baseline)
npm test -- --run
# Expected: 82 passing

# Step 2: Delete identified tests
# (Remove 15 tests from 6 files)
# Update test files by removing marked blocks

# Step 3: Verify deletions worked
npm test -- --run
# Expected: 67 passing

# Step 4: Apply refactoring
# (Fix 5 tests with fake timers, event mocks, etc.)

# Step 5: Add missing tests
# (Create 15 new tests for coverage gaps)

# Step 6: Final validation
npm test -- --run
# Expected: ~70 passing, all high-value tests
```

---

## Success Criteria

✅ **No flaky/timing tests**
✅ **No DOM spec tests** (testing browser APIs)
✅ **No redundant duplicates**
✅ **No self-validating tests**
✅ **~60-70 high-quality tests**
✅ **All business logic covered**
✅ **All error cases tested**
✅ **Real interaction simulation**
