<style lang="less">
    @import '../../../styles/common.less';
    @import 'single-table.less';
</style>

<template>
    <div>
        <fold v-if="table.searchAble" @on-expand="onFoldExpand" :class="{'margin-bottom-large': expandable}" :expandable="expandable">
            <Form ref="queryForm" label-position="left" :model="table.queryParams" :label-width="80" inline>
                <slot name="query-form" :params="table.queryParams"/>
                <div class="search-btn" :class="{expanded}">
                    <Button type="primary" @click="loadGrid">查询</Button>
                    <Button type="ghost" @click="resetQueryForm">重置</Button>
                </div>
            </Form>
        </fold>
        <Row>
            <slot name="actions"/>
        </Row>
        <Row class="margin-top-medium">
            <Table :columns="table.columns" :data="table.data"></Table>
        </Row>
        <Row class="margin-top-medium">
            <Page :total="table.total"
                  @on-change="onPageChange"
                  @on-page-size-change="onPageSizeChange" show-sizer show-elevator></Page>
        </Row>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import fold from '@/views/my-components/fold/fold.vue';

    export default {
        name: 'paged-table',
        components: {
            fold
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
            url: String,
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
            tableTransformResponse: {
                type: Function,
                default(response) {
                    return response
                }
            },
            tableTransformQueryParams: {
                type: Function,
                default(data) {
                    return data
                }
            },
            searchAble: {
                type: Boolean,
                default: true
            }
        },
        data() {
            const columns = [...this.columns];
            if(this.actions.length > 0) {
                columns.push({
                    title: '操作',
                    key: 'action',
                    width: (this.actions.length * 80),
                    align: 'center',
                    render: (h, params) => {
                        return h('div', [
                            ...this.actions.map((action)=>action(h, params))
                        ]);
                    }
                })
            }
            return {
                table: {
                    columns: columns,
                    data: [],
                    total: 0,
                    currentPage: 1,
                    pageSize: 10,
                    queryParams: this.queryParams,
                    searchAble: this.searchAble,
                    url: this.url
                },
                expanded: false,
                expandable: false
            }
        },
        methods: {
            onPageChange(page) {
                this.table.currentPage = page;
                this.loadGrid();
            },
            onPageSizeChange(pageSize) {
                this.table.pageSize = pageSize;
                this.loadGrid();
            },
            onFoldExpand(expand) {
                if(this.$refs.queryForm.fields.length > 2) {
                    this.expandable = true;
                }
                if(expand) {
                    this.expanded = expand;
                    this.$refs.queryForm.fields.forEach((field, index)=>{
                        index > 1 && (field.$el.style.display = 'inline-block');
                    })
                } else {
                    this.expanded = expand;
                    this.$refs.queryForm.fields.forEach((field, index)=>{
                        index > 1 && (field.$el.style.display = 'none');
                    })
                }
            },
            resetQueryForm () {
                this.$refs.queryForm.resetFields();
                this.loadGrid();
            },
            loadGrid ({
                          silent = false // 不触发事件
                      } = {}) {
                if(!silent) {
                    this.$emit('on-load');
                }
                let url = this.table.url;
                if(!url) {
                    url = `/api/${this.domainUrl}`;
                }
                util.ajax.get(url, {
                    params: {
                        currentPage: this.table.currentPage,
                        pageSize: this.table.pageSize,
                        ...this.tableTransformQueryParams(this.table.queryParams),
                        ...this.defaultQueryParams
                    }
                }).then((response) => {
                    response = this.tableTransformResponse(response);
                    this.table.data = response.data.content;
                    this.table.total = response.data.totalElements;
                })
            },
            clearData() {
                this.table.data = [];
                this.table.total = 0;
            },
            initQueryForm() {
                this.onFoldExpand();
                this.$refs.queryForm.fields.forEach((field)=>{
                    field.$el.style.width = '30%';
                });
            }
        },
        mounted() {
            if(!this.$scopedSlots['query-form']) {
                this.table.searchAble = false;
            }
            this.initQueryForm();
        },
        watch: {
            searchAble(val) {
                this.table.searchAble = val;
            },
            url(val) {
                this.table.url = val;
            }
        }
    };
</script>