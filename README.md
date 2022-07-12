# AsyncQueue

> 纯TypeScript 轻量级异步任务队列库。

🌰

        let asyncQueue:AsyncQueue = new AsyncQueue();
	
        // 最简洁的调用，push一个延时50毫秒的回调任务，每一个异步任务的next必须调用。
        asyncQueue.push( (next:Function)=>{
            // TODO
            setTimeout(next, 50);
        })
	
        // 传入一个params参数对象
        asyncQueue.push( (next:Function,params:any,args:any)=>{
            let _delay = params["delay"];
            console.log("params",params)
            setTimeout( ()=>{
                next( 222 );
            } , _delay );
        }, {delay:100} );

        // 通过args获取上个异步任务传递过来的值。
        asyncQueue.push( (next:Function,params:any,args:any)=>{
            let _delay = args;
            setTimeout( ()=>{
                next( "complete" );
            } , _delay );
        });
	// 同时处理多个异步任务，全部完成后，跳转下一步
	asyncQueue.pushMulti({name:"abc"}, (next:Function,params:any,args:any)=>{
            let _delay = args;
            setTimeout( ()=>{
                next( "completeA" );
            } ,  2 );
        }, (next:Function,params:any,args:any)=>{
            let _delay = args;
            setTimeout( ()=>{
                next( "completeB" );
            } , 4 );
        } );
        
	// 同时push多个任务，可以设定第三个参数，即任务执行优先级，数值越大越优先执行
	asyncQueue.push( (next:Function)=>{
            // TODO
            setTimeout(next, 50);
        },null,1)
	asyncQueue.push( (next:Function)=>{
            // TODO
            setTimeout(next, 50);
        },null,2)
	asyncQueue.push( (next:Function)=>{
            // TODO
            setTimeout(next, 50);
        },null,3)
	
        // 延时333毫秒然后执行下一步
        asyncQueue.yieldTime(333);
        
        // 设置完成时的回调函数
        asyncQueue.complete = (args)=>{
            console.log(args);
        }
        
        // 运行, 必须执行play方法才会运行
        asyncQueue.play();
      

你还可以选择当前禁止队列执行

		asyncQueue.enable = false;

也可以开启有效，它将内部判断是否自动进行下一个任务

		asyncQueue.enable = false;
		
如果当前任务始终无法执行完成（比如数据发给服务器，但服务器错误，无法获取结果），也就是next没有执行时机，可以调用step方法来强行跳过当前正在运行的任务。

     
