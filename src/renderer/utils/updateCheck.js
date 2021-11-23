import { dialog, shell} from 'electron'
// import db from '~/main/apis/core/datastore'
import {checkUpdateApi,downloadUrl} from "../api/api";
import { lt } from 'semver'
const version = require("../../../package.json").version

export function checkUpdate() {
    // const version = "0.0.0.1";
    checkUpdateApi().then(res => {
        const latest = res.data.version || res.data.name
        const result = compareVersion2Update(version, latest)
        if (result) {
            dialog.showMessageBox({
                type: 'info',
                title: '发现新版本',
                buttons: ['Yes', 'No'],
                message: `发现新版本${latest}，更新了很多功能，是否去下载最新的版本？`,
                // checkboxLabel: '以后不再提醒',
                // checkboxChecked: false
            }).then(res => {
                if (res.response === 0) { // if selected yes
                    shell.openExternal(downloadUrl)
                }
                // db.set('settings.showUpdateTip', !res.checkboxChecked)
            })
        } else {
            const options = {
                type: 'info',
                title: '检查更新',
                message: "当前为最新版本",
                buttons: ['确认'],
                icon: `${__static}/logo.png`
            }
            dialog.showMessageBox(options).then(r => {})
        }

    }).catch((err) => {
        console.log(err)

    });
}

const compareVersion2Update = (current, latest) => {
    try {
        // if (latest.includes('beta')) {
        //     const isCheckBetaUpdate = db.get('settings.checkBetaUpdate') !== false
        //     if (!isCheckBetaUpdate) {
        //         return false
        //     }
        // }
        console.log(current + " ==== " + latest)
        return lt(current, latest)
    } catch (e) {
        return false
    }
}