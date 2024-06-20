import * as assertModule from 'assert';

export class Assert {
    private static _assertImpl(condition: boolean, developer: string, message?: string,) {
        if (false === condition) {
            throw new assertModule.AssertionError({
                message: `${developer}: ${message}`,
            });
        }
    }

    public static NonNull<T>(value: T, developer: string, message?: string): asserts value is NonNullable<T> {
        /* REMOVE_IF_RELEASE:BEGIN */
        this._assertImpl(
            (value !== null && value !== undefined),
            developer,
            message
        );
        /* REMOVE_IF_RELEASE:END */
    }

    public static Never (developer: string, message?: string)  {
        /* REMOVE_IF_RELEASE:BEGIN */
        this._assertImpl(
            false,
            developer,
            message,
        )
        /* REMOVE_IF_RELEASE:END */
    };

    public static True (predicate: boolean | (() => boolean), developer: string, message?: string,): asserts predicate {
        /* REMOVE_IF_RELEASE:BEGIN */
        const condition = (typeof predicate === 'boolean') ? predicate : predicate();
        this._assertImpl(condition, developer, message);
        /* REMOVE_IF_RELEASE:END */
    };
}