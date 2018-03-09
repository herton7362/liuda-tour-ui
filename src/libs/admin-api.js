import axios from 'axios';
import env from '../../build/env';
import util from "./util";
import qs from 'qs';

let api = {}

const ajaxUrl = env === 'development'
    ? 'http://admin-api.djrentcar.com'
    : env === 'production'
        ? 'http://admin-api.djrentcar.com'
        : 'http://admin-api.djrentcar.com';

api.ajax = axios.create({
    baseURL: ajaxUrl,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// 添加请求拦截器
api.ajax.interceptors.request.use(function (config) {
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

// 添加响应拦截器
api.ajax.interceptors.response.use((response) => {
    // 对响应数据做点什么
    return response;
}, (error) => {
    // 对响应错误做点什么
    if(500 === error.response.status) {
        this.$Message.error('系统内部错误，请联系系统管理员');
    } else if(406 === error.response.status) {
        this.$Message.warning(error.response.data.message);
    } else if(401 === error.response.status) {
        router.push({
            name: 'error-403'
        });
    } else if(403 === error.response.status) {
        router.push({
            name: 'error-403'
        });
    }
    return Promise.reject(error);
});

api.login = function({appId, appSecret, username, password}) {
    let a = api.ajax.post('/login', qs.stringify({appId, appSecret, username, password}), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    console.log(a)
    return a
}

api.refreshToken = function () {
    return api.ajax.post(
        `/refresh/token?appId=${util.appId}&appSecret=${util.appSecret}&refreshToken=${window.localStorage.refreshToken}`)
}

api.getUserInfo = function () {
    return api.ajax.get('/user/info');
}

api.getAdminMenus = function () {
    return api.ajax.get('/api/admin/menus', {
        params: {
            _: new Date().getTime()
        }
    })
}

export default api;