import axios from 'axios';
import env from '../../build/env';

let util = {

};
util.title = function (title) {
    title = title || '鼎骏管理系统';
    window.document.title = title;
};

const ajaxUrl = env === 'development'
    ? 'http://127.0.0.1:8080'
    : env === 'production'
        ? 'http://admin-api.djrentcar.com'
        : 'https://debug.url.com';

util.baseURL = ajaxUrl;

util.appId = env === 'development'? 'liudalvyou' : 'liudalvyou';
util.appSecret = env === 'development'? 'P@ssWord!$' : 'P@ssWord!$';

util.ajax = axios.create({
    baseURL: ajaxUrl,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// 添加请求拦截器
util.ajax.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    let token = localStorage.accessToken;

    if(util.hasLogin()) {
        config.params = {
            access_token: token,
            ...config.params
        }
    }

    return config;
}, function (error) {
    return Promise.reject(error);
});

util.hasLogin = function() {
    return !!localStorage.accessToken && new Date().getTime() < window.localStorage.expiration - 10 * 1000;
};

util.inOf = function (arr, targetArr) {
    let res = true;
    arr.forEach(item => {
        if (targetArr.indexOf(item) < 0) {
            res = false;
        }
    });
    return res;
};

util.oneOf = function (ele, targetArr) {
    return targetArr.indexOf(ele) >= 0;
};

util.showThisRoute = function (itAccess, currentAccess) {
    if (typeof itAccess === 'object' && Array.isArray(itAccess)) {
        return util.oneOf(currentAccess, itAccess);
    } else {
        return itAccess === currentAccess;
    }
};

util.getRouterObjByName = function (routers, name) {
    if (!name || !routers || !routers.length) {
        return null;
    }
    // debugger;
    let routerObj = null;
    for (let item of routers) {
        if (item.name === name) {
            return item;
        }
        routerObj = util.getRouterObjByName(item.children, name);
        if (routerObj) {
            return routerObj;
        }
    }
    return null;
};

util.handleTitle = function (vm, item) {
    if (typeof item.title === 'object') {
        return vm.$t(item.title.i18n);
    } else {
        return item.title;
    }
};

util.setCurrentPath = function (vm, name) {
    let title = '';
    let isOtherRouter = false;
    const routers = vm.$store.state.app.routers;
    routers.forEach(item => {
        if (item.children.length === 1) {
            if (item.children[0].name === name) {
                title = util.handleTitle(vm, item);
                if (item.name === 'otherRouter') {
                    isOtherRouter = true;
                }
            }
        } else {
            item.children.forEach(child => {
                if (child.name === name) {
                    title = util.handleTitle(vm, child);
                    if (item.name === 'otherRouter') {
                        isOtherRouter = true;
                    }
                }
            });
        }
    });
    let currentPathArr = [];
    if (name === 'home_index') {
        currentPathArr = [
            {
                title: util.handleTitle(vm, util.getRouterObjByName(routers, 'home_index')),
                path: '',
                name: 'home_index'
            }
        ];
    } else if ((name.indexOf('_index') >= 0 || isOtherRouter) && name !== 'home_index') {
        currentPathArr = [
            {
                title: util.handleTitle(vm, util.getRouterObjByName(routers, 'home_index')),
                path: '/home',
                name: 'home_index'
            },
            {
                title: title,
                path: '',
                name: name
            }
        ];
    } else {
        let currentPathObj = routers.filter(item => {
            if (item.children.length <= 1) {
                return item.children[0].name === name;
            } else {
                let i = 0;
                let childArr = item.children;
                let len = childArr.length;
                while (i < len) {
                    if (childArr[i].name === name) {
                        return true;
                    }
                    i++;
                }
                return false;
            }
        })[0];
        if (currentPathObj.children.length <= 1 && currentPathObj.name === 'home') {
            currentPathArr = [
                {
                    title: '首页',
                    path: '',
                    name: 'home_index'
                }
            ];
        } else if (currentPathObj.children.length <= 1 && currentPathObj.name !== 'home') {
            currentPathArr = [
                {
                    title: '首页',
                    path: '/home',
                    name: 'home_index'
                },
                {
                    title: currentPathObj.title,
                    path: '',
                    name: name
                }
            ];
        } else {
            let childObj = currentPathObj.children.filter((child) => {
                return child.name === name;
            })[0];
            currentPathArr = [
                {
                    title: '首页',
                    path: '/home',
                    name: 'home_index'
                },
                {
                    title: currentPathObj.title,
                    path: '',
                    name: currentPathObj.name
                },
                {
                    title: childObj.title,
                    path: currentPathObj.path + '/' + childObj.path,
                    name: name
                }
            ];
        }
    }
    vm.$store.commit('setCurrentPath', currentPathArr);

    return currentPathArr;
};

util.openNewPage = function (vm, name, argu, query) {
    let pageOpenedList = vm.$store.state.app.pageOpenedList;
    let openedPageLen = pageOpenedList.length;
    let i = 0;
    let tagHasOpened = false;
    while (i < openedPageLen) {
        if (name === pageOpenedList[i].name) { // 页面已经打开
            vm.$store.commit('pageOpenedList', {
                index: i,
                argu: argu,
                query: query
            });
            tagHasOpened = true;
            break;
        }
        i++;
    }
    if (!tagHasOpened) {
        let tag = vm.$store.state.app.tagsList.filter((item) => {
            if (item.children) {
                return name === item.children[0].name;
            } else {
                return name === item.name;
            }
        });
        tag = tag[0];
        if (tag) {
            tag = tag.children ? tag.children[0] : tag;
            if (argu) {
                tag.argu = argu;
            }
            if (query) {
                tag.query = query;
            }
            vm.$store.commit('increateTag', tag);
        }
    }
    vm.$store.commit('setCurrentPageName', name);
};

util.toDefaultPage = function (routers, name, route, next) {
    let len = routers.length;
    let i = 0;
    let notHandle = true;
    while (i < len) {
        if (routers[i].name === name && routers[i].children && routers[i].redirect === undefined) {
            route.replace({
                name: routers[i].children[0].name
            });
            notHandle = false;
            next();
            break;
        }
        i++;
    }
    if (notHandle) {
        next();
    }
};

util.fullscreenEvent = function (vm) {
    vm.$store.commit('initCachepage');
    // 权限菜单过滤相关
    vm.$store.commit('updateMenulist');
    // 全屏相关
};

util.transformTreeData = function (data, titleKey, defaultExpanded = true) {
    let [map, roots, node] = [{}, []];
    data.forEach((d)=>{
        if(titleKey) {
            d.title = d[titleKey];
            d.label = d[titleKey];
        }
        d.expand = defaultExpanded;
        map[d.id] = d;
        if(!d.parent || !d.parent.id) {
            roots.push(d);
        }
    });

    for(let key of Object.getOwnPropertyNames(map)) {
        node = map[key];
        if(!node.parent) {
            continue;
        }
        let parent = map[node.parent.id];
        if(!parent) {
            roots.push(node);
            continue;
        }
        parent.children = parent.children || [];
        if(!util.oneOf(node, parent.children)){
            parent.children.push(node);
        }
    }
    return roots;
}

util.bytesToSize = function (bytes) {
    if (!bytes) return '0 B';

    var k = 1024;

    var sizes = ['B','KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    var i = Math.floor(Math.log(bytes) / Math.log(k));

    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
};

util.executeGenerator = function (gen){
    var g = gen();

    function next(data){
        var result = g.next(data);
        if (result.done) return result.value;
        result.value.then(function(data){
            next(data);
        });
    }

    next();
}

util.dateToLong = function (date) {
    return date? new Date(date).getTime(): null;
}

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
util.dateFormat = function(date, fmt = 'yyyy-MM-dd') {
    var o = {
        "M+" : date.getMonth()+1,                 //月份
        "d+" : date.getDate(),                    //日
        "H+" : date.getHours(),                   //小时
        "m+" : date.getMinutes(),                 //分
        "s+" : date.getSeconds(),                 //秒
        "q+" : Math.floor((date.getMonth()+3)/3), //季度
        "S"  : date.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
}

util.dateTimeFormat = function (date, fmt = 'yyyy-MM-dd HH:mm:ss') {
    util.dateFormat(date, fmt);
}

util.dateFormatPretty = function(date) {
    var second = 1000;
    var minutes = second*60;
    var hours = minutes*60;
    var days = hours*24;
    var months = days*30;
    var myDate = date;
    var nowtime = new Date();
    var longtime =nowtime.getTime()- myDate.getTime();
    if( longtime > months*2 ) {
        return date.format("yyyy-MM-dd HH:mm:ss");
    }
    else if (longtime > months)
    {
        return "1个月前";
    }
    else if (longtime > days*7)
    {
        return ("1周前");
    }
    else if (longtime > days)
    {
        return (Math.floor(longtime/days)+"天前");
    }
    else if ( longtime > hours)
    {
        return (Math.floor(longtime/hours)+"小时前");
    }
    else if (longtime > minutes)
    {
        return (Math.floor(longtime/minutes)+"分钟前");
    }
    else if (longtime > second)
    {
        return (Math.floor(longtime/second)+"秒前");
    }else
    {
        return (longtime+" error ");
    }
};

// util.onWheel = function (ele, callback) {
//     ele.addEventListener('mousewheel', function (e) {
//         callback(e, e.wheelDelta);
//     });
//     ele.addEventListener('DOMMouseScroll', function (e) {
//         callback(e, e.detail * 40);
//     });
// };

// util.offWheel = function (ele, callback) {
//     ele.removeEventListener('mousewheel', callback)
// }

export default util;
