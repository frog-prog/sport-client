import {useRef, useState} from "react";
import reactLogo from "./assets/react.svg";
import {invoke} from "@tauri-apps/api/tauri";
import "./App.css";


type AuthProps = {
    authFunc:()=>void,
    authorisationFailed:boolean,
    email:string,
    setEmail:(value:string)=>void,
    password:string,
    setPassword:(value:string)=>void,
}
function Auth({authFunc,email,password,setEmail,setPassword,authorisationFailed}:AuthProps,) {
    return (
        <div>
            <input
                id="token-input"
                placeholder="Email"
                value={email}
                onInput={(e)=>setEmail(e.currentTarget.value)}
            />
            <input
                id="id-input"
                placeholder="Пароль"
                value={password}
                onInput={(e)=>setPassword(e.currentTarget.value)}
            />
            {authorisationFailed ? 'Неверный логин или пароль':null}
            <button type="button" onClick={() => authFunc()}>
                'Авторизоваться'
            </button>
        </div>
    );
}

export default Auth;
