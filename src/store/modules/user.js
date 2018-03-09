import Cookies from 'js-cookie';

const user = {
    state: {
        loginUser: null
    },
    mutations: {
        login(state, user) {
            state.loginUser = user;
        },
        logout (state, vm) {
            Cookies.remove('user');
            localStorage.clear();
        }
    }
};

export default user;
