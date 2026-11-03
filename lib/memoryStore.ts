import { ICategory, IProduct, ISupplier, ICoupon, IOrder } from '@/types';

class MemoryStore {
  public categories: ICategory[] = [];
  public products: IProduct[] = [];
  public suppliers: ISupplier[] = [];
  public coupons: ICoupon[] = [];
  public orders: IOrder[] = [];
}

declare global {
  // eslint-disable-next-line no-var
  var __memoryStore: MemoryStore | undefined;
}

const memoryStore = global.__memoryStore || new MemoryStore();
if (!global.__memoryStore) {
  global.__memoryStore = memoryStore;
}

export default memoryStore;
