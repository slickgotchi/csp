export class Timer {
    private _prev_ms: number;
    private _curr_ms: number;
    private _dt_ms: number | undefined;

    get dt_ms() {
        if (this._dt_ms === undefined) {
            throw new Error('Timer get(): tick() was not called before accessing property: dt_ms');
        }
        return this._dt_ms;
    }
    
    constructor() {
        this._prev_ms = Date.now();
        this._curr_ms = Date.now();
        this._dt_ms = -1;
    }

    tick() {
        this._curr_ms = Date.now();
        this._dt_ms = this._curr_ms - this._prev_ms;
        this._prev_ms = this._curr_ms;
    }

}