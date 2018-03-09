<style lang="less">
    @import '../../../styles/common.less';
</style>

<template>
    <Card>
        <single-table ref="table"
                      :columns="table.columns"
                      form-title="景区维护"
                      domain-url="scenic"
                      :form-rule="form.rule"
                      :form-data="form.data"
                      :form-transform-response="formTransformResponse">
            <template slot="query-form" slot-scope="props">
            </template>

            <template slot="edit-form" slot-scope="props">
            </template>
        </single-table>
    </Card>
</template>

<script>
    import util from '@/libs/util';
    import singleTable from '@/views/my-components/single-table/single-table.vue';

    export default {
        components: {
            singleTable
        },
        data() {
            return {
                table: {
                    columns: [
                        {key: 'name', title: '景区名称'},
                        {key: 'detailAddress', title: '详细地址'},
                        {key: 'businessHours', title: '营业时间'}
                    ]
                },
                form: {
                    rule: {
                    },
                    data: {
                    }
                },
                roles: []
            }
        },
        methods: {
            formTransformResponse(response) {
                response.data.password = null;
                return response;
            }
        },
        mounted() {
            this.$refs.table.loadGrid();
        }
    };
</script>