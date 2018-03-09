<style lang="less">
    @import '../../../styles/common.less';
    @import 'single-table.less';
</style>

<template>
    <div>
        <paged-table ref="table"
                     :query-params="queryParams"
                     :domain-url="domainUrl"
                     :actions="table.actions"
                     :default-query-params="defaultQueryParams"
                     :table-transform-response="tableTransformResponse"
                     :table-transform-query-params="tableTransformQueryParams"
                     :search-able="table.searchAble"
                     :columns="columns"
                     @on-load="onLoadGrid">
            <template slot="query-form" slot-scope="props">
                <slot name="query-form" :params="props.params">

                </slot>
            </template>

            <template slot="actions">
                <Button type="primary" @click="openNewModal"> <Icon type="plus"></Icon><span>新建</span></Button>
                <slot name="actions"/>
            </template>
        </paged-table>
        <Modal v-model="form.modal"
               :title="formTitle"
               :loading="form.loading"
               :mask-closable="maskClosable"
               @on-ok="save"
               :width="modalWidth">
            <Form ref="form" :model="form.data" :rules="formRule" :label-width="labelWidth">
                <slot name="edit-form" :data="form.data"/>
            </Form>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import fold from '@/views/my-components/fold/fold.vue';
    import PagedTable from './paged-table.vue'

    export default {
        name: 'single-table',
        components: {
            fold,
            PagedTable
        },
        props: {
            columns: {
                type: Array,
                default() {
                    return [];
                }
            },
            actions: {
                type: Array,
                default() {
                    return [];
                }
            },
            domainUrl: String,
            modalWidth: Number,
            formTitle: {
                type: String,
                default: '窗口'
            },
            formRule: {
                type: Object,
                default() {
                    return {};
                }
            },
            formData: {
                type: Object,
                default() {
                    return {};
                }
            },
            queryParams: {
                type: Object,
                default() {
                    return {};
                }
            },
            defaultQueryParams: {
                type: Object,
                default() {
                    return {};
                }
            },
            formTransformResponse: {
                type: Function,
                default(response) {
                    return response
                }
            },
            tableTransformResponse: {
                type: Function,
                default(response) {
                    return response
                }
            },
            formTransformData: {
                type: Function,
                default(data) {
                    return data
                }
            },
            tableTransformQueryParams: {
                type: Function,
                default(data) {
                    return data
                }
            },
            maskClosable: {
                type: Boolean,
                default: true
            },
            labelWidth: {
                type: Number,
                default: 80
            }
        },
        data() {
            return {
                table: {
                    actions: [
                        (h, params)=> {
                            return h('Button', {
                                props: {
                                    type: 'primary',
                                    size: 'small'
                                },
                                style: {
                                    marginRight: '5px'
                                },
                                on: {
                                    click: () => {
                                        this.openEditModal(params.row);
                                    }
                                }
                            }, '修改')
                        },
                        (h, params)=> {
                            return h('Poptip',
                                {
                                    props: {
                                        confirm: true,
                                        transfer: true,
                                        title: '您确认删除这条内容吗？'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        'on-ok': () => {
                                            this.remove(params.row)
                                        }
                                    }
                                },
                                [
                                    h('Button', {
                                        props: {
                                            type: 'error',
                                            size: 'small'
                                        }
                                    }, '删除')
                                ]
                            )
                        },
                        ...this.actions
                    ],
                    searchAble: true
                },
                form: {
                    modal: false,
                    loading: true,
                    data: this.formData
                }
            }
        },
        methods: {
            remove (row) {
                util.ajax.delete(`/api/${this.domainUrl}/${row.id}`).then(() => {
                    this.form.modal = false;
                    this.$Message.success('删除成功');
                    this.loadGrid();
                });
            },
            save() {
                this.$refs.form.validate((valid) => {
                    if (valid) {
                        util.ajax.post(`/api/${this.domainUrl}`, this.formTransformData(this.form.data)).then(() => {
                            this.form.modal = false;
                            this.$Message.success('保存成功');
                            this.loadGrid();
                        }).catch((error)=>{
                            this.clearFormLoading();
                            return Promise.reject(error);
                        });
                    } else {
                        this.clearFormLoading();
                    }
                })
            },
            clearFormLoading() {
                this.form.loading = false;
                this.$nextTick(() => {
                    this.form.loading = true;
                });
            },
            openNewModal() {
                this.$refs.form.resetFields();
                this.$emit('on-new-modal-open');
                this.form.data.id = null;// 解决清空表单id不会删除问题
                this.form.modal = true;
            },
            openEditModal(row) {
                this.$emit('on-edit-modal-open');
                this.$refs.form.resetFields();
                util.ajax.get(`/api/${this.domainUrl}/${row.id}`).then((response) => {
                    response = this.formTransformResponse(response);
                    this.form.data = response.data;
                    this.form.modal = true;
                });
            },
            resetQueryForm () {
                this.$refs.table.resetQueryForm();
            },
            loadGrid ({
                          silent = false // 不触发事件
            } = {}) {
                this.$refs.table.loadGrid(silent);
            },
            clearData() {
                this.$refs.table.clearData();
            },
            onLoadGrid() {
                this.$emit('on-load');
            }
        },
        mounted() {
            if(!this.$scopedSlots['query-form']) {
                this.table.searchAble = false;
            }
        }
    };
</script>