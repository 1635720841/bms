import { ElNotification, ElMessage } from 'element-plus'

export const orderbyzh = (list) => {
    return list.sort((a, b) => a.value.localeCompare(b.value, 'zh'))
}

export const isNull = (text, mr = '-') => {
    if (text) {
        return text ? text : mr
    } else {
        return mr
    }
}

export const findTitle = (text, List, mr = '-', name) => {
    if (text !== null && text !== undefined && text !== '') {
        const fitem = List.find((item) => (name ? item[name.value] : item.value) === text)
        return fitem ? (name ? fitem[name.label] : fitem.label) : mr
    } else {
        return mr
    }
}

export const findTitleList = (text, List, mr = '-') => {
    if (text) {
        const arr = text.split(',')
        let title = ''
        if (arr) {
            arr.forEach((a) => {
                const fitem = List.find((item) => item.value === a)
                if (fitem) {
                    title = title + fitem.label + '、'
                }
            })
        }
        title = title.slice(0, title.length - 1)
        return title ? title : mr
    } else {
        return mr
    }
}

// 获取 月 周
export function getFirstDayOfLast(field = 'week') {
    var time = null
    time = field === 'week' ? new Date().getTime() - 6 * 24 * 60 * 60 * 1000 : new Date().getTime() - 29 * 24 * 60 * 60 * 1000
    return dateYMD(time)
}

export function downloadfile(res, filename = '') {
    const content = res.data
    console.log('res :>> ', res)
    console.log('content.type', content.type)
    if (content && content.type === 'application/json') {
        const fileReader = new FileReader()
        fileReader.onload = function () {
            try {
                const resD = JSON.parse(fileReader.result)
                console.log('res>>>>>', resD)
                ElNotification({
                    title: resD.message,
                    message: resD.data,
                    type: resD.status === 200 ? 'success' : 'error',
                })
            } catch (err) {
                console.log(err)
            }
        }
        fileReader.readAsText(content)
    } else if (content && content.type === 'application/octet-stream') {
        let blob = new Blob([content], { type: `application/zip;` });
        // 获取heads中的filename文件名
        let downloadElement = document.createElement('a');
        // 创建下载的链接
        let href = window.URL.createObjectURL(blob);
        downloadElement.href = href;
        // 下载后文件名
        downloadElement.download = decodeURI(res.headers['content-disposition'].split(`filename=`)[1], 'UTF-8');
        document.body.appendChild(downloadElement);
        // 点击下载
        downloadElement.click();
        // 下载完成移除元素
        document.body.removeChild(downloadElement);
        // 释放掉blob对象
        window.URL.revokeObjectURL(href)
    } else {
        let name = ''
        if (filename) {
            name = filename
        } else {
            name = decodeURI(res.headers['content-disposition'].split(`filename*=utf-8''`)[1], 'UTF-8')
        }
        const a = document.createElement('a')
        const blob = new Blob([content], { type: res.headers['content-type'] })
        a.href = window.URL.createObjectURL(blob)
        a.download = name
        a.click()
    }
}

//获得当前日期
export function getDayString(day = 0) {
    var today = new Date()
    var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day
    today.setTime(targetday_milliseconds)
    var tYear = today.getFullYear()
    var tMonth = today.getMonth()
    var tDate = today.getDate()
    tMonth = doHandleMonth(tMonth + 1)
    tDate = doHandleMonth(tDate)
    return tYear + '-' + tMonth + '-' + tDate
}

/**获取最近一年（12个月）的月份 */
export function getMonth() {
    var now = new Date()
    now.setFullYear(now.getFullYear() - 1)
    var year = now.getFullYear()
    var month = now.getMonth() + 1
    var day = now.getDate()
    return year + '-' + month + '-' + day
}

// 处理时间成年月日
export function dateYMD(newdata) {
    const date = new Date(newdata)
    const year = date.getFullYear()
    const month = ('0' + (date.getMonth() + 1)).slice(-2)
    const day = ('0' + date.getDate()).slice(-2)
    if (year && month && day) return `${year}-${month}-${day}`
}

// 处理时间成年月日时分秒
export function dateYMDHMS(dateTimeString) {
    const dateTime = new Date(dateTimeString)
    const year = dateTime.getFullYear()
    const month = String(dateTime.getMonth() + 1).padStart(2, '0')
    const day = String(dateTime.getDate()).padStart(2, '0')
    const hours = String(dateTime.getHours()).padStart(2, '0')
    const minutes = String(dateTime.getMinutes()).padStart(2, '0')
    const seconds = String(dateTime.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export function doHandleMonth(month) {
    var m = month
    if (month.toString().length == 1) {
        m = '0' + month
    }
    return m
}