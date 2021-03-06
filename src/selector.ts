interface Hash {
  [key: string]: any;
}

export function createSelector<State extends Hash, SliceState>(
  slice: string,
): (state: State) => SliceState {
  if (!slice) {
    return (state: State) => <any>state;
  }
  return (state: State) => state[slice];
}
export function createSelectorAlt<State extends Hash, SliceState>(
  slice: string,
): (state: State) => SliceState {
  if (!slice) {
    return (state: State) => <any>state;
  }
  return (state: State) => {
    if (!state.hasOwnProperty(slice)) {
      throw new Error(`${slice} was not found in the given State,
      This selector was either called with a bad state argument or
      an incorrect slice name was given when instantiating the parent reducer,
      check for spelling errors`);
    }
    return state[slice];
  };
}
export function createSubSelector<State extends Hash, SliceState>(
  slice: keyof State,
  subSlice: keyof SliceState,
): (state: State) => SliceState[keyof SliceState] {
  if (!slice) {
    return (state: State) => state[subSlice as keyof State];
  }
  return (state: State) => {
    if (!state.hasOwnProperty(slice)) {
      throw new Error(`${slice} was not found in the given State,
      This selector was either called with a bad state argument or
      an incorrect slice name was given when instantiating the parent reducer,
      check for spelling errors`);
    }
    return (<SliceState>(<unknown>state[slice]))[subSlice];
  };
}

export function createSelectorName(slice: string) {
  if (!slice) {
    return 'getState';
  }

  return camelize(`get ${slice}`);
}
export function createSubSelectorName(slice: string, subSlice: string) {
  if (!slice) {
    return camelize(`get ${subSlice}`);
  }

  return camelize(`get ${slice} ${subSlice}`);
}

// https://stackoverflow.com/a/2970667/1713216
function camelize(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
      return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
    })
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '');
}
