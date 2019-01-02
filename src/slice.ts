import createAction from './action';
import createReducer from './reducer';
import {
  createSelector,
  createSubSelector,
  createSelectorAlt,
} from './selector';
import { Action } from './types';

/* type Reduce<State, Payload> = (state: State, payload: Payload) => State | undefined | void;

interface ReduceMap<State> {
  [key: string]: Reduce<State, AnyAction>;
}


interface ICreate<State, Actions> {
  slice?: string;
  actions: { [key in keyof Actions]: Reduce<State, Actions[key]> };
  initialState: State;
} */

export type ActionReducer<SS = any, A = any> = (
  state: SS,
  payload: A,
) => SS | void | undefined;

export type ActionReducerWithSlice<SS = any, A = any, S = any> = (
  state: SS,
  payload: A,
  _FullState: S,
) => SS | void | undefined;

export type Reducer<SS = any, A = Action> = (
  state: SS | undefined,
  payload: A,
) => SS;

type ActionsObj<SS = any, Ax = any> = {
  [K in keyof Ax]: ActionReducer<SS, Ax[K]>
};
type ActionsObjWithSlice<SS = any, Ax = any, S = any> = {
  [K in keyof Ax]: ActionReducerWithSlice<SS, Ax[K], S>
};

type ActionsAny<P = any> = {
  [Action: string]: P;
};

export interface ReduceM<SS> {
  [Action: string]: ActionReducer<SS, Action>;
}
type Result<A extends ActionsAny = ActionsAny, SS = any, S = SS> = {
  slice: SS extends S ? '' : keyof S;
  reducer: Reducer<SS, Action>;
  selectors: { getState: (state: S) => SS };
  actions: {
    [key in keyof A]: Object extends A[key]
      ? (payload?: any) => Action
      : A[key] extends never
      ? () => Action
      : (payload: A[key]) => Action<A[key]>
  };
};

type ResultAlt<A = any, SS = any, S = SS> = {
  slice: SS extends S ? '' : keyof S;
  reducer: Reducer<SS, Action>;
  selectors: SS extends {}
    ? ({ [key in keyof SS]: (state: S) => SS[key] } & {
        getState: (state: S) => SS;
      })
    : {
        getState: (state: S) => SS;
      };
  actions: {
    [key in keyof A]: Object extends A[key]
      ? (payload?: any) => Action
      : A[key] extends never
      ? () => Action
      : (payload: A[key]) => Action<A[key]>
  };
};

type InputWithSlice<SS = any, Ax = ActionsAny, S = any> = {
  initialState: SS;
  actions: ActionsObjWithSlice<SS, Ax, S>;
  slice: keyof S;
};
type InputWithoutSlice<SS = any, Ax = ActionsAny> = {
  initialState: SS;
  actions: ActionsObj<SS, Ax>;
};
type InputWithOptionalSlice<SS = any, Ax = ActionsAny, S = any> = {
  initialState: SS;
  actions: ActionsObjWithSlice<SS, Ax, S>;
  slice?: any;
};
// type NoEmptyObject<S> = Object extends S ? { [slice: string]: any } : S;

const allCapsSnakeCase = (string: string) =>
  string
    .replace(/(\w)([A-Z])/g, '$1_$2')
    .replace(/(\w)/g, (w) => w.toUpperCase());

const actionTypeBuilder = (slice: string) => (action: string) =>
  slice ? `${slice}/${allCapsSnakeCase(action)}` : allCapsSnakeCase(action);

export default function create<
  SliceState,
  Actions extends ActionsAny,
  State extends {}
>({
  actions,
  initialState,
  slice,
}: InputWithSlice<SliceState, Actions, State>): Result<
  Actions,
  SliceState,
  State
>;
export default function create<SliceState, Actions extends ActionsAny>({
  actions,
  initialState,
}: InputWithoutSlice<SliceState, Actions>): Result<Actions, SliceState>;

export default function create<SliceState, Actions extends ActionsAny, State>({
  actions,
  initialState,
  slice = '',
}: InputWithOptionalSlice<SliceState, Actions, State>) {
  const { actionMap, reducer } = makeActionMapAndReducer<
    SliceState,
    ActionsObjWithSlice<SliceState, Actions>,
    Actions
  >(actions, slice, initialState);
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
  SliceState,
  Actions extends ActionsAny,
  State extends {}
>({
  slice,
  actions,
  initialState,
}: InputWithSlice<SliceState, Actions, State>): ResultAlt<
  Actions,
  SliceState,
  State
>;
export function createSliceAlt<SliceState, Actions extends ActionsAny>({
  actions,
  initialState,
}: InputWithoutSlice<SliceState, Actions>): ResultAlt<Actions, SliceState>;

export function createSliceAlt<
  SliceState,
  Actions extends ActionsAny,
  State = undefined
>({
  slice = '',
  actions,
  initialState,
}: InputWithOptionalSlice<SliceState, Actions, State>) {
  const { actionMap, reducer } = makeActionMapAndReducer<
    SliceState,
    ActionsObjWithSlice<SliceState, Actions>,
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
  const selectors = {
    getState: createSelector<State, SliceState>(slice),
  };
  return selectors;
}

function makeSelectorsAlt<SliceState, State>(
  slice: string,
  initialState: SliceState,
) {
  const getState = {
    getState: createSelectorAlt<State, SliceState>(slice),
  };
  let initialStateKeys: (keyof SliceState)[] = [];
  if (typeof initialState === 'object' && !Array.isArray(initialState)) {
    initialStateKeys = <any>Object.keys(initialState);
  }
  const otherSelectors = initialStateKeys.reduce<
    { [key in keyof SliceState]: (state: State) => SliceState[key] }
  >(
    (map, key) => {
      map[key] = createSubSelector<State, SliceState>(
        slice as keyof State,
        key,
      );
      return map;
    },
    {} as any,
  );
  const selectors = {
    ...getState,
    ...otherSelectors,
  };
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
    (map as any)[createActionType(<string>action)] = actions[action];
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
      const type = createActionType(<string>action);
      (<any>map)[action] = createAction(type);
      return map;
    },
    {} as any,
  );
  return actionMap;
}
