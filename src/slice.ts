import createAction from './action';
import createReducer from './reducer';
import {
  createSelector,
  createSelectorName,
  createSubSelectorName,
  createSubSelector,
  createSelectorAlt,
} from './selector';
import { Action } from './types';
import { AnyAction } from 'redux';

/* type Reduce<State, Payload> = (state: State, payload: Payload) => State | undefined | void;

interface ReduceMap<State> {
  [key: string]: Reduce<State, AnyAction>;
}


interface ICreate<State, Actions> {
  slice?: string;
  actions: { [key in keyof Actions]: Reduce<State, Actions[key]> };
  initialState: State;
} */

type ActionReducer<S = any, A = any> = (
  state: S | undefined,
  payload: A,
) => S | void | undefined;
// type CReducer2<S = any> = (state: S) => S;
type Reducer<S = any, A = any> = (state: S | undefined, payload: A) => S;

type ActionsObj<S = any, Ax = any> = {
  [K in keyof Ax]: ActionReducer<S, Ax[K]>
};

type ActionsAny<P = any> = {
  [K: string]: P;
};
interface ReduceM<S> {
  [key: string]: ActionReducer<S, AnyAction>;
}
type Result<A = any, S = any, SS = S> = {
  slice: string;
  reducer: Reducer<S, AnyAction>;
  selectors: { [x: string]: (state: SS) => S };
  actions: {
    [key in keyof A]: Object extends A[key]
      ? (payload?: any) => Action
      : A[key] extends never
        ? () => Action
        : (payload: A[key]) => Action<A[key]>
  };
};
type Input<S = any, Ax extends ActionsAny = ActionsAny> = {
  initialState: S;
  actions: ActionsObj<S, Ax>;
  slice?: string;
};
type Input0<S = any, Ax extends ActionsAny = ActionsAny> = {
  initialState: S;
  actions: ActionsObj<S, Ax>;
};

const actionTypeBuilder = (slice: string) => (action: string) =>
  slice ? `${slice}/${action}` : action;

type NUC<SX> = SX extends undefined ? any : SX;
export default function create<
  SliceState = any,
  Stat = undefined,
  Actions extends ActionsAny = ActionsAny
>({
  actions,
  initialState,
}: Input0<SliceState, Actions>): Result<Actions, SliceState>;

export default function create<
  SliceState = Stat,
  Stat = undefined,
  Actions extends ActionsAny = ActionsAny
>({
  slice,
  actions,
  initialState,
}: Input<SliceState, Actions>): Result<Actions, SliceState, NUC<Stat>>;

export default function create<
  SliceState = Stat,
  Stat = undefined,
  Actions extends ActionsAny = ActionsAny
>({ actions, initialState, slice = '' }: Input<SliceState, Actions>) {
  const { actionMap, reducer } = makeActionMapAndReducer<
    SliceState,
    ActionsObj<SliceState, Actions>,
    Actions
  >(actions, slice, initialState);
  type State = Stat extends undefined ? SliceState : Stat;
  const selectors = makeSelectors<SliceState, State>(slice);

  return {
    actions: actionMap,
    reducer,
    slice,
    selectors,
  };
}
//#region
export function createSliceAlt<
  State = SliceState | { [key: string]: any | SliceState },
  SliceState = any,
  Actions extends ActionsAny = ActionsAny
>({ slice = '', actions, initialState }: Input<SliceState, Actions>) {
  const { actionMap, reducer } = makeActionMapAndReducer<
    SliceState,
    ActionsObj<SliceState, Actions>,
    Actions
  >(actions, slice, initialState);
  const selectors = makeSelectorsAlt<SliceState, State>(slice, initialState);
  return {
    actions: actionMap,
    reducer,
    slice,
    selectors,
  };
}

function makeSelectors<SliceState, State>(slice: string) {
  const selectorName = createSelectorName(slice);
  const selectors = {
    [selectorName]: createSelector<State, SliceState>(slice),
  };
  return selectors;
}

function makeSelectorsAlt<SliceState, State>(
  slice: string,
  initialState: SliceState,
) {
  const selectorName = createSelectorName(slice);
  const selectors = {
    [selectorName]: createSelectorAlt<State, SliceState>(slice),
  };
  if (typeof initialState === 'object' && !Array.isArray(initialState)) {
    const initialStateKeys = Object.keys(initialState) as (keyof SliceState)[];
    initialStateKeys.reduce((map, key) => {
      const subSelectorName = createSubSelectorName(slice, key as string);
      map[subSelectorName] = createSubSelector<State, SliceState>(
        slice as keyof State,
        key,
      );
      return map;
    }, selectors);
  }
  return selectors;
}
//#endregion
function makeActionMapAndReducer<SliceState, Ax, Actions>(
  actions: Ax,
  slice: string,
  initialState: SliceState,
) {
  const actionKeys = Object.keys(actions) as (keyof Ax)[];
  const createActionType = actionTypeBuilder(slice);
  const reducer = makeReducer<SliceState, Ax>(
    actionKeys,
    createActionType,
    actions,
    initialState,
    slice,
  );
  const actionMap = makeActionMap<Ax, Actions>(actionKeys, createActionType);
  return { actionMap, reducer };
}

function makeReducer<SliceState, Ax>(
  actionKeys: (keyof Ax)[],
  createActionType: (action: string) => string,
  actions: Ax,
  initialState: SliceState,
  slice: string,
) {
  const reducerMap = actionKeys.reduce<ReduceM<SliceState>>((map, action) => {
    (map as any)[createActionType(action as string)] = actions[action];
    return map;
  }, {});
  const reducer = createReducer<SliceState>({
    initialState,
    actions: reducerMap,
    slice,
  });
  return reducer;
}

function makeActionMap<Ax, Actions>(
  actionKeys: (keyof Ax)[],
  createActionType: (s: string) => string,
) {
  const actionMap = actionKeys.reduce<
    {
      [key in keyof Actions]: Object extends Actions[key]
        ? (payload?: any) => Action
        : Actions[key] extends never
          ? () => Action
          : (payload: Actions[key]) => Action<Actions[key]>
    }
  >(
    (map, action) => {
      const type = createActionType(action as string);
      (map as any)[action] = createAction(type) as any;
      return map;
    },
    {} as any,
  );
  return actionMap;
}
