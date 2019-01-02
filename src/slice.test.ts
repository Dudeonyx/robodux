import createSlice, { createSliceAlt } from './slice';

describe('createSlice', () => {
  describe('when slice is empty', () => {
    type State = number;
    interface Actions {
      increment: never;
      multiply: number;
    }
    const { actions, reducer, selectors } = createSlice<State, Actions>({
      actions: {
        increment: (state) => state + 1,
        multiply: (state, payload) => state * payload,
      },
      initialState: 0,
    });

    it('should create increment action', () => {
      expect(actions.hasOwnProperty('increment')).toBe(true);
    });

    it('should create multiply action', () => {
      expect(actions.hasOwnProperty('multiply')).toBe(true);
    });

    it('should have the correct action for increment', () => {
      expect(actions.increment()).toEqual({
        type: 'INCREMENT',
        payload: undefined,
      });
    });

    it('should have the correct action for multiply', () => {
      expect(actions.multiply(3)).toEqual({
        type: 'MULTIPLY',
        payload: 3,
      });
    });

    describe('when using reducer', () => {
      it('should return the correct value from reducer with increment', () => {
        expect(reducer(undefined, actions.increment())).toEqual(1);
      });

      it('should return the correct value from reducer with multiply', () => {
        expect(reducer(2, actions.multiply(3))).toEqual(6);
      });
    });

    describe('when using selectors', () => {
      it('should create selector with correct name', () => {
        expect(selectors.hasOwnProperty('getState')).toBe(true);
      });

      it('should return the slice state data', () => {
        expect(selectors.getState(2)).toEqual(2);
      });
    });
  });

  describe('when passing slice', () => {
    const { actions, reducer, selectors } = createSlice({
      actions: {
        increment: (state) => state + 1,
        multiply: (state: number, payload: number) => state * payload,
      },
      initialState: 0,
      slice: 'cool',
    });

    it('should create increment action', () => {
      expect(actions.hasOwnProperty('increment')).toBe(true);
    });
    it('should create multiply action', () => {
      expect(actions.hasOwnProperty('multiply')).toBe(true);
    });

    it('should have the correct action for increment', () => {
      expect(actions.increment()).toEqual({
        type: 'cool/INCREMENT',
        payload: undefined,
      });
    });
    it('should have the correct action for multiply', () => {
      expect(actions.multiply(5)).toEqual({
        type: 'cool/MULTIPLY',
        payload: 5,
      });
    });

    it('should return the correct value from reducer', () => {
      expect(reducer(undefined, actions.increment())).toEqual(1);
    });
    it('should return the correct value from reducer when multiplying', () => {
      expect(reducer(5, actions.multiply(5))).toEqual(25);
    });

    it('should create selector with correct name', () => {
      expect(selectors.hasOwnProperty('getState')).toBe(true);
    });

    it('should return the slice state data', () => {
      expect(selectors.getState({ cool: 2 })).toEqual(2);
    });
  });

  describe('createSliceAlt when initialState is an object', () => {
    const { selectors } = createSliceAlt({
      actions: {
        setName: (state, name: string) => {
          state.name = name;
        },
        setSurname: (state, surname: string) => {
          state.surname = surname;
        },
        setMiddlename: (state, middlename: string) => {
          state.middlename = middlename;
        },
      },
      slice: 'form',
      initialState: {
        name: '',
        surname: '',
        middlename: '',
      },
    });

    const state = {
      form: {
        name: 'John',
        surname: 'Doe',
        middlename: 'Wayne',
      },
    };

    it('should create selector with correct name', () => {
      expect(selectors.hasOwnProperty('getState')).toBe(true);
    });
    it('should create sub selector with correct name', () => {
      expect(selectors.hasOwnProperty('name')).toBe(true);
    });
    it('should create sub selector with correct name', () => {
      expect(selectors.hasOwnProperty('surname')).toBe(true);
    });
    it('should create sub selector with correct name', () => {
      expect(selectors.hasOwnProperty('middlename')).toBe(true);
    });

    it('should select the state slice', () => {
      expect(selectors.getState(state)).toEqual(state.form);
    });
    it('should select the state slice name field', () => {
      expect(selectors.name(state)).toEqual('John');
    });
    it('should select the state slice surname field', () => {
      expect(selectors.surname(state)).toEqual('Doe');
    });
    it('should select the state slice middlename field', () => {
      expect(selectors.middlename(state)).toEqual('Wayne');
    });
  });

  describe('when mutating state object', () => {
    const { actions, reducer } = createSlice({
      actions: {
        setUserName: (state, payload: string) => {
          state.user = payload;
        },
      },
      initialState: { user: '' },
      slice: 'user',
    });

    it('should set the username', () => {
      expect(reducer({ user: 'hi' }, actions.setUserName('eric'))).toEqual({
        user: 'eric',
      });
    });
  });
});
