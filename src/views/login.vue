<style lang="less">
    @import './login.less';
</style>

<template>
    <div class="login" @keydown.enter="handleSubmit">
        <div class="login-con">
            <Card :bordered="false">
                <p slot="title">
                    <Icon type="log-in"></Icon>
                    欢迎登录
                </p>
                <div class="form-con">
                    <Form ref="loginForm" :model="form" :rules="rules">
                        <FormItem prop="userName">
                            <Input v-model="form.userName" placeholder="请输入用户名">
                            <span slot="prepend">
                                    <Icon :size="16" type="person"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem prop="password">
                            <Input type="password" v-model="form.password" placeholder="请输入密码">
                                <span slot="prepend">
                                    <Icon :size="14" type="locked"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem>
                            <Button @click="handleSubmit" type="primary" long>登录</Button>
                        </FormItem>
                    </Form>
                </div>
            </Card>
        </div>
    </div>
</template>

<script>
import util from '../libs/util';
import AdminApi from '../libs/admin-api';
import Cookies from 'js-cookie';
export default {
    data () {
        return {
            clients: [],
            form: {
                userName: 'admin',
                password: '123456'
            },
            rules: {
                userName: [
                    { required: true, message: '账号不能为空', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '密码不能为空', trigger: 'blur' }
                ],
                client: [
                    { required: true, message: '请选择应用', trigger: 'change' }
                ]
            }
        };
    },
    methods: {
        loadClients() {
            util.ajax.get('/oauthClient').then((response)=>{
                this.clients = response.data;
            })
        },
        handleSubmit () {
            this.$refs.loginForm.validate((valid) => {
                if (valid) {
                    AdminApi.login({
                        appId: util.appId,
                        appSecret: util.appSecret,
                        username: this.form.userName,
                        password: this.form.password
                    }).then((response)=>{
                            Cookies.set('user', this.form.userName);
                            this.$store.commit('setAvator', 'http://www.dldjshop.com/attachment/download/2c911f2460a044dc0160e4464d790002');
                            this.$store.commit('setAccessToken', response.data);
                            window.location.reload();
                        })
                        .catch((error)=>{
                            if(error.response.status === 406) {
                                this.$Message.warning('用户名或者密码错误');
                            }
                            return Promise.reject(error);
                        });
                }
            });
        }
    },
    mounted() {
        this. loadClients();
    }
};
</script>

<style>

</style>
