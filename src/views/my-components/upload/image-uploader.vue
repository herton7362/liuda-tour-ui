<style lang="less">
    @import './image-uploader.less';
</style>
<template>
    <div>
        <div class="image-upload-list" v-for="item in uploadList">
            <template v-if="item.status === 'finished'">
                <img :src="'/attachment/download/' + item.id | baseUrl">
                <div class="image-upload-list-cover">
                    <Icon type="ios-eye-outline" @click.native="handleView(item.id)" v-if="preView"></Icon>
                    <Icon type="ios-trash-outline" @click.native="handleRemove(item)"></Icon>
                </div>
            </template>
            <template v-else>
                <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
            </template>
        </div>
        <Upload
                ref="upload"
                :data="extraParam"
                :show-upload-list="false"
                :default-file-list="defaultFileList"
                :on-success="handleSuccess"
                :format="['jpg','jpeg','png']"
                :max-size="2048"
                :on-format-error="handleFormatError"
                :on-exceeded-size="handleMaxSize"
                :before-upload="handleBeforeUpload"
                :multiple="multiple"
                type="drag"
                name="attachments"
                :action="'/attachment/upload' | baseUrl"
                style="display: inline-block;width:58px;">
            <div style="width: 58px;height:58px;line-height: 58px;">
                <Icon type="camera" size="20"></Icon>
            </div>
        </Upload>
        <Modal title="图片预览" v-model="visible" :transfer="false" v-if="preView">
            <img :src="imgUrl" v-if="visible" style="width: 100%">
        </Modal>
    </div>
</template>
<script>
    import util from '@/libs/util';

    export default {
        name: 'image-uploader',
        props: {
            defaultFileList: {
                type: Array,
                default() {
                    return [];
                }
            },
            multiple: {
                type: Boolean,
                default: false
            },
            preView: {
                type: Boolean,
                default: true
            },
            onSuccess: {
                type: Function,
                default() {}
            },
            onRemove: {
                type: Function,
                default() {}
            }
        },
        data () {
            return {
                imgUrl: '',
                visible: false,
                uploadList: [],
                extraParam: {
                    access_token: localStorage.accessToken
                }
            }
        },
        filters: {
            baseUrl(val) {
                return util.baseURL + val;
            }
        },
        methods: {
            handleView (id) {
                this.imgUrl = util.baseURL + `/attachment/download/${id}`;
                this.visible = true;
            },
            handleRemove (file) {
                const fileList = this.$refs.upload.fileList;
                this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
                this.onRemove(file);
            },
            handleSuccess (res, file) {
                res.forEach((r)=>{
                    file.id = r.id;
                    file.name = r.name;
                });
                this.onSuccess(res, file)
            },
            handleFormatError (file) {
                this.$Notice.warning({
                    title: '文件类型不正确',
                    desc: '文件 ' + file.name + ' 类型不正确，请选择 jpg 或者 png 格式。'
                });
            },
            handleMaxSize (file) {
                this.$Notice.warning({
                    title: 'Exceeding file size limit',
                    desc: '文件  ' + file.name + ' 过大，不能大于 2M。'
                });
            },
            handleBeforeUpload () {
                return this.$emit('before-upload');
            }
        },
        mounted() {
            this.$refs.upload.$watch('fileList', (val)=>{
                this.uploadList = val;
            })
        }
    }
</script>