
// 아직 개발중입니다.
type FabricEvent = 'modified' | 'rotating' | 'scaling';

// 아직 개발중입니다.
// event를 분리해서, 상황에 따라 서로 다른 response 행동을 하도록 하려고 합니다...

class FabricEventResponse {
    private _listners = new Map<FabricEvent, Function>;

    protected setResponse(event: FabricEvent, action: () => void) {
        this._listners.set(event, action);
    }

    public response(event: FabricEvent) {
        const action = this._listners.get(event);
        if (undefined !== action) {
            action();
        }
    }
}