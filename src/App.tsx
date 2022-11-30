import {useEffect, useRef, useState} from "react";
import reactLogo from "./assets/react.svg";
import {invoke} from "@tauri-apps/api/tauri";
import {open} from "@tauri-apps/api/dialog";
import {readTextFile} from "@tauri-apps/api/fs";
import "./App.css";
import Auth from "./Auth";
import Connection from "./Connection";

let ws: null | WebSocket = null;

function App() {
    const [token, setToken] = useState<string>("0|s");
    const [path, setPath] = useState<string>(".")
    const [authorized, setAuthorized] = useState<boolean>(false);
    const [tokenValid, setTokenValid] = useState<boolean>(false);
    const [authorizationFailed, setAuthorisationFailed] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [id, setId] = useState<string>("");
    const [isVerifying, setIsVerifying] = useState<boolean>(true);
    const [isConnected, setIsConnected] = useState<boolean>(false);

    useEffect(() => {
        let tokenStored = localStorage.getItem('token');
        let pathStored = localStorage.getItem('path');
        if (tokenStored !== null && tokenStored !== undefined) {
            setToken(tokenStored);
        }
        if (pathStored !== null && pathStored !== undefined) {
            setToken(pathStored);
        }
        setIsVerifying(true)
        fetch('https://live-scout.c.roky.rocks/api/verifyToken', {
            method: "GET",
            headers: {
                'Authorization': 'Bearer ' + token
            }
        }).then((response) => response.json())
            .then((result) => {
                if (result !== false) {
                    setToken(result.token)
                    setTokenValid(true)
                    setAuthorized(true)
                    localStorage.setItem('token', result.token)
                } else {
                    localStorage.setItem('token', "0|s")
                    setToken("0|s")
                    setTokenValid(false)
                    setAuthorized(false)
                }
                setIsVerifying(false)
            })
    }, []);
    const logout = async () => {
        if (isConnected) {
            disconnect()
        }
        fetch('https://live-scout.c.roky.rocks/api/logout', {
            method: "GET",
            headers: {
                'Authorization': 'Bearer ' + token
            }
        }).then((result) => {
            if (result.status === 200) {
                setToken("0|s")
                localStorage.setItem('token', "0|s")
                setTokenValid(false)
                setAuthorized(false)
            }
        })
    }
    const getFilePath = async () => {
        const selectedPath = await open({
            multiple: false,
            directory: true,
            title: "Выберите путь записи файлов",
            defaultPath: path
        });
        if (!selectedPath) {
            return;
        }
        if (!Array.isArray(selectedPath)) {
            console.log(selectedPath)
            setPath(selectedPath);
            localStorage.setItem('path', selectedPath);
        }
    };
    const emailChange = (email: string) => {
        setEmail(email);
    }
    const passwordChange = (password: string) => {
        setPassword(password);
    }
    const idChange = (id: string) => {
        const re = /^[0-9\b]+$/;
        if (id === '' || re.test(id)) {
            setId(id);
        }
    }
    const auth = async () => {
        fetch('https://live-scout.c.roky.rocks/api/auth', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                password: password,
                email: email
            })
        }).then((response) => response.json())
            .then((result: authResult) => {
                if (result !== false) {
                    setToken(result.token);
                    localStorage.setItem('token', result.token);
                    setAuthorisationFailed(false);
                    setTokenValid(true);
                    setAuthorized(true);
                } else {
                    setToken("0|s");
                    localStorage.setItem('token', "0|s");
                    setAuthorisationFailed(true);
                    setTokenValid(false);
                    setAuthorized(false)
                }
            })
    }

    const connect = async () => {
        console.log(token);
        if (id.length > 0) {
            ws = new WebSocket('wss://live-scout.c.roky.rocks/websocket', token + '|' + id);
            ws.onclose = () => {
                ws = null;
                setIsConnected(false);
                console.log('ws',ws);
            }
            ws.onopen = () => {
                setIsConnected(true)
            }
            ws.onmessage = (event) => {
                console.log(path);
                invoke('write_file', {text: event.data, filename: path + '/match_statistics.json'})
            }
        }
    }
    const disconnect = () => {
        ws?.close();
    }
    const renderFunc = () => {
        if (isVerifying) {
            return <div>Проверка токена...</div>
        }
        if (!authorized || !tokenValid || authorizationFailed) {
            return (<Auth
                authFunc={auth}
                email={email}
                setEmail={emailChange}
                password={password}
                setPassword={passwordChange}
                authorisationFailed={authorizationFailed}
            />)
        }
        return (<Connection
            isConnected={isConnected}
            connectionFunc={connect}
            disconnectionFunc={disconnect}
            id={id} setId={idChange}
            fileChoose={getFilePath}
            logout={logout}
        />)
    }
    return (
        <div className="container">
            <h1>Live-scout</h1>
            {renderFunc()}
        </div>
    );
}

export default App;
