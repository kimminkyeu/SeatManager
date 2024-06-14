import * as assertModule from 'assert';

export class Assert {
    private static _assertImpl(condition: boolean, developer: string, message?: string,) {
        /* REMOVE_IF_RELEASE:BEGIN */
        if (false === condition) {
            throw new assertModule.AssertionError({
                message: `${developer}: ${message}`,
            });
        }
        /* REMOVE_IF_RELEASE:END */
    }

    /**
     * 이 함수는 타입에서 null/undefined이 없음을 (런타임 차원에서) 단언합니다.
     * async로 데이터를 받아올 경우, 해당 데이터가 null/undefined가 아님을 단언합니다.
     * 이 방법은 runtime에서 타입을 단언하기 위한 [ (!)operator ] 대체안입니다.
     * @param value assert할 값
     * @param message throw할 message
     */
    public static NonNull<T>(value: T, developer: string, message?: string): asserts value is NonNullable<T> {
        this._assertImpl(
            (value !== null && value !== undefined),
            developer,
            message
        );
    }

    public static Never (developer: string, message?: string)  {
        this._assertImpl(
            false,
            developer,
            message,
        )
    };

    public static True (condition: boolean, developer: string, message?: string,) {
        this._assertImpl(
            (true === condition),
            developer,
            message,
        );
    };
}