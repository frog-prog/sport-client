#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use std::{env, fs};
use std::fs::File;
use std::io::Read;



// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn write_file(text: String, filename:String){
    fs::write(filename,text).expect("Ошибка при записи файла");
}
#[tauri::command]
fn read_file(filename:String){
    let mut file = File::open(filename)
        .expect("false");
    let mut data = String::new();
    file.read_to_string(&mut data)
        .expect("false");
    println!("{}", data);
}
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![write_file,read_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
