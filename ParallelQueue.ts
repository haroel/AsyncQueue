/*
 * @Author: ihowe
 * @Date: 2022-07-12 16:23:54
 * @Email: ihowe@outlook.com
 * @Description:  
 * 按指定的并行数同时执行多个任务 
 */

export class ParallelQueue<T> {

    private _taskIndex = 0;
    private _finishCount = 0;
    private _tasks: Array<T> = null;
    private _workers: Array<number> = [];
    private _handler: (taskIndex: number, taskItem: T, workerIndex: number, next: () => void) => void = null;

    /**
     * 所有任务执行完成回调
     */
    public complete: Function = null;

    constructor(workerNum: number) {
        for (let i = 0; i < workerNum; i++) {
            this._workers.push(i);
        }
    }
    /**
     * 执行任务
     * @param tasks 
     * @param handler 
     * @returns 
     */
    public play(tasks: Array<any>, handler: (taskIndex: number, taskItem: T, workerIndex: number, next: () => void) => void, complete:Function = null) {
        if (this._taskIndex > 0) {
            console.log(" ParallelQueue play : 已经有任务正在进行")
            return;
        }
        this._taskIndex = 0;
        this._finishCount = 0;
        this._tasks = tasks;
        this._handler = handler;
        this.complete = complete;
        this._doWork();
    }
    /**
     * 任务执行完成回调
     */
    private _finishWork() {
        this._taskIndex = 0;
        this._finishCount = 0;
        this._handler = null;
        this._tasks = null;
        this.complete && this.complete();
    }
    /**
     * 执行具体任务
     * @returns 
     */
    private _doWork() {
        if (this._taskIndex === this._tasks.length) {
            return;
        }
        if (this._workers.length > 0) {
            let i = this._taskIndex++;
            if (i < this._tasks.length) {
                let worker = this._workers.pop(); // 从Workers队列尾部取一个
                let next = () => {
                    ++this._finishCount;
                    this._workers.push(worker); // 回收worker
                    if (this._finishCount === this._tasks.length) {
                        return this._finishWork()
                    }
                    this._doWork();
                }
                this._handler(i, this._tasks[i], worker, next);
            }
            this._doWork()
        }
    }
}
