/**
 * 处理多任务并行队列处理
 */

export class AsyncParallelQueue {

    currentRunningNum = 0;
    maxRunningNum = 0;
    taskID = 0;
    tasks = [];
    results = [];
    complete:(rets:any[])=>void = null;
    handler: (param: any) => Promise<any> = null;
    
    /**
     * 
     * @param maxParallelNum  最大的并行处理数量
     */
    constructor(maxParallelNum: number = 1) {
        this.maxRunningNum = maxParallelNum;
    }

    /**
     * push 任务
     * @param tasks     任务数组参数
     * @param handler   任务调度函数，该函数需返回一个Promise
     * @param complete  执行完成回调函数
     */
    public pushTasks(tasks: any[], handler: (param: any) => Promise<any>, complete:(rets:any[])=>void ) {
        this.tasks = tasks;
        this.handler = handler;
        this.complete = complete;
        this._play();
    }

    /**
     * push 任务
     * @param tasks 任务数组参数
     * @param handler 任务调度函数，该函数需返回一个Promise
     * @returns tasks所有任务结束的Promise
     */
    public pushTasksPromise(tasks: any[], handler: (param: any) => Promise<any> ):Promise< any[]> {
        this.tasks = tasks;
        this.handler = handler;
        this._play();
        return new Promise((resolve, reject) => {
            this.complete = resolve;
        }  )
    }

    private _complete(){
        let rets = [];
        this.results.sort( (a,b)=>{
            return a.id - b.id;
        })
        this.results.forEach( (a)=>{
            rets.push(a.ret);
        } )
        this.complete && this.complete(rets);
    }

    private _play(){
        if (this.currentRunningNum === 0 && this.tasks.length === 0){
            this._complete();
            return;
        }
        while( this.tasks.length >0 && this.currentRunningNum < this.maxRunningNum ){
            this.currentRunningNum++;
            let taskID = this.taskID++;

            let dohandler = (res) => {
                this.currentRunningNum--;
                this.results.push({
                    id: taskID,
                    ret: res
                });
                this._play();
            }
            this.handler(this.tasks.shift()).then(dohandler, dohandler);
        }
    }
}
