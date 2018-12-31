import { AnyAction, Action } from 'redux';

export type Reducer<S = any, A extends Action = AnyAction> = (
  state: S | undefined,
  action: A,
) => S | undefined;

export type ReducersMapObject<S = any, A extends Action = Action> = {
  [K in keyof S]: Reducer<S[K], A>
};

export type CReducer<S = any, A = any> = (
  state: S| undefined,
  payload: A,
) => S;
export type CReducer2<S = any> = (
  state: S,
) => S;

type Actions<S = any, Ax = any> = { 
  [K in keyof Ax]: CReducer<S,Ax[K]> 
};
type IActions<P = any> = { 
  [K:string]: P ;
};

type Result<A = any> = {
  actions: {
    [key in keyof A]: Object extends A[key] ? (payload?: A[key]) => A[key] : (payload: A[key]) => A[key]
  }
}

// export function test<Ax extends IActions = IActions>(
//   initState: S,
//   actions: Actions<S>,
//   slice: string,
// ): Result<any>;
export function tests<Ax extends IActions = IActions, S = any>(
  initState: S,
  actions: Actions<S,Ax>,
  slice: string = '',
): Result<Ax> {

  
  return '' as any;
}

const fdf = tests(5, {
  set: (state, payload:number)=> state + payload,
  reset: (state)=> state,
}, 'hello');

fdf.actions.set
fdf.actions.reset