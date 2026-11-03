import { EventEmitter } from 'events';

class OrderEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __orderEventEmitter: OrderEventEmitter | undefined;
}

export const orderEvents: OrderEventEmitter =
  global.__orderEventEmitter || new OrderEventEmitter();

if (!global.__orderEventEmitter) {
  global.__orderEventEmitter = orderEvents;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function notifyNewOrder(order: any) {
  try {
    orderEvents.emit('new-order', order);
  } catch (err) {
    console.error('Error emitting new order event:', err);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function notifyOrderUpdated(order: any) {
  try {
    orderEvents.emit('order-updated', order);
  } catch (err) {
    console.error('Error emitting order update event:', err);
  }
}
