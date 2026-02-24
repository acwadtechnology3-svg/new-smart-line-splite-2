type PickupCoords = [number, number] | null;

interface TripSelectionState {
  pickupAddress: string | null;
  pickupCoords: PickupCoords;
}

let state: TripSelectionState = {
  pickupAddress: null,
  pickupCoords: null,
};

export function setPickupSelection(address?: string | null, coords?: PickupCoords): void {
  if (address !== undefined) {
    state.pickupAddress = address;
  }
  if (coords !== undefined) {
    state.pickupCoords = coords;
  }
}

export function getPickupSelection(): TripSelectionState {
  return state;
}

export function clearPickupSelection(): void {
  state = {
    pickupAddress: null,
    pickupCoords: null,
  };
}
