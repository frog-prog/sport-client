import "./App.css";


type ConnectionProps = {
    connectionFunc:()=>void,
    disconnectionFunc:()=>void,
    fileChoose:()=>void,
    logout:()=>void,
    isConnected:boolean,
    id:string,
    setId:(value:string)=>void,
}
function Connection({connectionFunc,id,setId,disconnectionFunc,isConnected,fileChoose,logout}:ConnectionProps) {
    return (
        <div>
            <input
                id="token-input"
                placeholder="Id"
                disabled={isConnected}
                value={id}
                onInput={(e)=>setId(e.currentTarget.value)}
            />
            <button type="button" onClick={() => {
                console.log('isCon',isConnected);
                if(!isConnected){
                    connectionFunc()
                }
                else{
                    disconnectionFunc()
                }
            }}>
                {isConnected ? 'Отключиться' : 'Подключиться'}
            </button>
            <button type="button" disabled={isConnected} onClick={()=>fileChoose()}>
                Выбор папки
            </button>
            <button type="button" onClick={()=>logout()}>
                Выйти
            </button>
        </div>
    );
}

export default Connection;
