export { default as createAction, getActionType } from './action';
export { default as createReducer } from './reducer';
export * from './types';
import robodux from './slice';
export {createSliceAlt} from './slice';
export default robodux;
