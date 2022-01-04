



let _$uuid_count = 1;

class AsyncQueue {

    // 正在运行的任务
    _runningAsyncTask = null;

    // 任务task的唯一标识
    _queues = [];

    get queues() {
        return this._queues;
    }
    // 正在执行的异步任务标识
    _isProcessingTaskUUID = 0;

    _enable = true;
    /**
     * 是否开启可用
     */
    get enable() {
        return this._enable;
    }
    /**
     * 是否开启可用
     */
    set enable(val) {
        if (this._enable === val) {
            return;
        }
        this._enable = val;
        if (val && this.size > 0) {
            this.play();
        }
    }

    /**
     * 任务队列完成回调
     */
    complete = null;

    /**
     * push一个异步任务到队列中
     * 返回任务uuid
     */
    push(callback, params = null) {
        let uuid = _$uuid_count++;
        this._queues.push({
            uuid: uuid,
            callbacks: [callback],
            params: params
        })
        return uuid;
    }

    /**
     * push多个任务，多个任务函数会同时执行,
     * 返回任务uuid
     */
    pushMulti(param, ...callbacks) {
        let uuid = _$uuid_count++;
        this._queues.push({
            uuid: uuid,
            callbacks: callbacks,
            params: params
        })
        return uuid;
    }

    /** 移除一个还未执行的异步任务 */
    remove(uuid) {
        if (this._runningAsyncTask.uuid === uuid) {
            cc.warn("正在执行的任务不可以移除");
            return;
        }
        for (let i = 0; i < this._queues.length; i++) {
            if (this._queues[i].uuid === uuid) {
                this._queues.splice(i, 1);
                break;
            }
        }
    }
    /**
     * 队列长度
     */
    get size() {
        return this._queues.length;
    }
    /**
     * 是否有正在处理的任务
     */
    get isProcessing() {
        return this._isProcessingTaskUUID > 0;
    }
    /**
     * 队列是否已停止
     */
    get isStop() {
        if (this._queues.length > 0) {
            return false;
        }
        if (this.isProcessing) {
            return false;
        }
        return true;
    }
    /** 正在执行的任务参数 */
    get runningParams() {
        if (this._runningAsyncTask) {
            return this._runningAsyncTask.params;
        }
        return null;
    }

    /**
     * 清空队列
     */
    clear() {
        this._queues = [];
        this._isProcessingTaskUUID = 0;
        this._runningAsyncTask = null;
    }

    next(taskUUID, args = null) {
        // cc.log("完成一个任务")
        if (this._isProcessingTaskUUID === taskUUID) {
            this._isProcessingTaskUUID = 0;
            this._runningAsyncTask = null;
            this.play(args);
        } else {
            //    cc.warn("[AsyncQueue] 错误警告：正在执行的任务和完成的任务标识不一致，有可能是next重复执行！ProcessingTaskUUID："+this._isProcessingTaskUUID + " nextUUID:"+taskUUID)
            if (this._runningAsyncTask) {
                cc.log(this._runningAsyncTask);
            }
        }
    }
    /**
     * 跳过当前正在执行的任务
     */
    step() {
        if (this.isProcessing) {
            this.next(this._isProcessingTaskUUID);
        }
    }
    /**
     * 开始运行队列
     */
    play(args = null) {
        if (this.isProcessing) {
            return;
        }
        if (!this._enable) {
            return;
        }
        let actionData = this._queues.shift();
        if (actionData) {
            this._runningAsyncTask = actionData;
            let taskUUID = actionData.uuid;
            this._isProcessingTaskUUID = taskUUID;
            let callbacks = actionData.callbacks;

            if (callbacks.length == 1) {
                let nextFunc = (nextArgs = null) => {
                    this.next(taskUUID, nextArgs);
                }
                callbacks[0](nextFunc, actionData.params, args);
            } else {
                // 多个任务函数同时执行
                let fnum = callbacks.length;
                let nextArgsArr = [];
                let nextFunc = (nextArgs = null) => {
                    --fnum;
                    nextArgsArr.push(nextArgs || null);
                    if (fnum === 0) {
                        this.next(taskUUID, nextArgsArr);
                    }
                }
                let knum = fnum;
                for (let i = 0; i < knum; i++) {
                    callbacks[i](nextFunc, actionData.params, args);
                }
            }
        } else {
            this._isProcessingTaskUUID = 0;
            this._runningAsyncTask = null;
            // cc.log("任务完成")
            if (this.complete) {
                this.complete(args);
            }
        }
    }

}

module.exports = AsyncQueue;
