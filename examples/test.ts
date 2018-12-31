import { AnyAction, Action } from 'redux';

export type Reducer<S = any, A extends Action = AnyAction> = (
  state: S | undefined,
  action: A,
) => S;

export type ReducersMapObject<S = any, A extends Action = Action> = {
  [K in keyof S]: Reducer<S[K], A>
};

type Actions<S = any> = {
 [K in keyof S]: Reducer<S[K], A>
}
export function test<S>(initState: S,actions: any ,reducers: ReducersMapObject<S, any>): void;
export function test<S, A extends Action = AnyAction>(
  initState: S,
  actions: A,
  reducers: ReducersMapObject<S, A>,
): void {

}
