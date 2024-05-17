import * as assertModule from 'assert';

export namespace Assert {
    /**
     * 이 함수는 타입에서 null/undefined이 없음을 (런타임 차원에서) 단언합니다.
     * async로 데이터를 받아올 경우, 해당 데이터가 null/undefined가 아님을 단언합니다.
     * 이 방법은 runtime에서 타입을 단언하기 위한 [ (!)operator ] 대체안입니다.
     * @param value assert할 값
     * @param message throw할 message
     */
    export function NonNull<T>(value: T, _message?: string): asserts value is NonNullable<T> {
        // assertion signature
        if (value === null || value === undefined) {
            throw new assertModule.AssertionError({
                message: _message,
            });
        }
    }

    export const Never = (_message?: string) => {
        throw new assertModule.AssertionError({
            message: _message,
        });
    };


    export const True = (condition: boolean, _message?: string) => {
        if (condition === false) {
            throw new assertModule.AssertionError({
                message: _message,
            });
        }
    };

    /**
     * Adapted from https://github.com/sindresorhus/float-equal
     * License evidence: https://github.com/sindresorhus/float-equal/blob/master/license
     * @author Sindre Sorhus + fork contributions from Alex Birch
     * @license MIT
     */
    export const FloatEqual = (a: number, b: number, tolerance: number = Number.EPSILON): void => {
        if (a === b) {
            return;
        }

        const diff: number = Math.abs(a - b);
        if (diff < tolerance) {
            return;
        }
        if (diff <= tolerance * Math.min(Math.abs(a), Math.abs(b))) {
            return;
        }
        throw new assertModule.AssertionError({
            operator: `within ${tolerance} of`,
            expected: `${b} (difference: ${diff})`,
            actual: a,
        });
    };
}