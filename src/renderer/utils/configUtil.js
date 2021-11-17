const Store = require('electron-store');

let option={
    name:"config",//文件名称,默认 config
    fileExtension:"json",//文件后缀,默认json
    // cwd:remote.app.getPath('userData'),//文件位置,尽量不要动
//    encryptionKey:"aes-256-cbc" ,//对配置文件进行加密
    clearInvalidConfig:false, // 发生 SyntaxError  则清空配置,
}
export const store = new Store(option);


