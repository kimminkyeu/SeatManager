import { v4 as uuidv4 } from 'uuid';

// Mixin type
// https://devblogs.microsoft.com/typescript/announcing-typescript-2-2/
export type Constructable = new (...args: any[]) => object;

export function WithObjectId<BC extends Constructable>(Base: BC) {

  return class extends Base {

      private readonly _objectId = uuidv4();

      public get objectId() { return this._objectId; }
  };
}