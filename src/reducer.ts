import createNextState from 'immer';

import { Action } from './types';
import { ReduceM } from './slice';

type CreateReducer<SS = any> = {
  initialState: SS;
  actions: ReduceM<SS, any>;
  slice?: string;
};
type NoEmptyArray<State> = State extends never[] ? any[] : State;

export default function createReducer<S, SS extends S = any>({
  initialState,
  actions,
  slice = '',
}: CreateReducer<NoEmptyArray<SS>>) {
  const reducer = (state = initialState, action: Action<any>) => {
    return createNextState(state, (draft) => {
      const caseReducer = actions[action.type];

      if (caseReducer) {
        return caseReducer(<NoEmptyArray<SS>>draft, action.payload);
      }

      return draft;
    });
  };

  reducer.toString = () => slice;
  return reducer;
}
