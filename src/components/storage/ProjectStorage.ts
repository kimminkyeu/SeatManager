
// store all drawing object. ( one for single drawboard project )
// this uses local storage for file data.
// (1) if exported, Converter saves local storage data to JSON.
// (2) if JSON imported, Converter converts JSON to Editor Storage data (which is local storage)
// (3) if submited, Converter saved local storage data to JSON, then send HTTP POST Request.

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API

import { v4 as uuidv4 } from 'uuid';

export namespace TW {

    interface Persistable {
        export(): void
        import(): void
    }

    // base class
    abstract class _Storage implements Persistable {
        abstract export(): void;
        abstract import(): void;
    }
   
    // TODO: LocalStorage에 저장하는 방식으로 나중에 추가.

    // Single project storage.
    // user can have multiple project storage. 
    // *** But in this version, User can have only one project... *** 
    class InMemoryStorage<T> extends _Storage {

        private storage: Map<string, T> = new Map();

        public save2 = () => {

        }

        public save(id: string, object: T) {
            this.storage.set(id, object);
        }

        public deleteById(id: string) {
            this.storage.delete(id);
        }

        public toJSON(): string {
            return JSON.stringify(Object.fromEntries(this.storage));
        }

        public override export(): void {
            // ...
        }

        public override import(): void {
            // ...
        }

    }

    class Storage {

    }


}
