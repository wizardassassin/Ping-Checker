export class RollingAverage {
    /** @type {number[]} */
    data;
    maxLength;
    /**
     *
     * @param {number} maxLength
     */
    constructor(maxLength) {
        this.data = [];
        this.maxLength = maxLength;
    }
    /**
     *
     * @param {number} num
     */
    addNumber(num) {
        if (this.data.length === this.maxLength) {
            this.data.shift();
        }
        this.data.push(num);
    }
    getAvg() {
        const newData = this.data.filter((x) => Number.isFinite(x));
        const avg = newData.reduce((a, b) => a + b) / newData.length;
        return {
            avg: Number(avg.toFixed(2)),
            failedPings: this.data.length - newData.length,
        };
    }
}
