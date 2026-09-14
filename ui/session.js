// The presentation uses the same state and commands as the deterministic engine.
import { createInitialState, applyAction } from '../src/engine.js';
export * from '../src/engine.js';

export function createSession({ initialState = createInitialState(), random = Math.random } = {}) {
  let state = structuredClone(initialState);
  return {
    snapshot: () => structuredClone(state),
    dispatch(action) {
      const result = applyAction(state, action, { random });
      state = result.state;
      return structuredClone(result);
    }
  };
}
