export enum EventName {
  Install = 'install',
  Purchase = 'purchase',
}

export function isEventName(value: any): value is EventName {
  return Object.values(EventName).includes(value);
}
