export class ControlWordGroup extends Array {
    public parent?: ControlWordGroup;

    public getLast() {
        if (this.length === 0) return;
        
        return this[this.length-1]
    }
}