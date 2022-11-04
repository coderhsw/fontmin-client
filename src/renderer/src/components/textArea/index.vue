<!-- @format -->

<template>
    <div class="text-area">
        <h1 class="title">文本片段</h1>
        <textarea
            class="textarea"
            cols="30"
            rows="20"
            placeholder="输入文本或拖入txt文件进行字体子集化，输出字体只包含所选字体"
            :value="textVal"
            @input="handleInput"
            @drop="handleTxtDrop"
            @dragenter="handlerDragEnter"
            @dragleave="handlerDragLeave"
        ></textarea>
        <div class="font">
            <div
                class="drag-area"
                :class="{ 'drop-active': dropActive, active: !!fontFile }"
                @dragover="handlerDragover"
                @drop="handleDrop"
                @dragenter="handlerDragEnter"
                @dragleave="handlerDragLeave"
                @click="handleClick"
            >
                <template v-if="fontFile">
                    <div class="font-detail">
                        <p class="font-name">{{ fontFile.name }}</p>
                        <p class="cancel" @click.stop="handleCancel">取消</p>
                    </div>
                </template>
                <template v-else>将所需文字拖拽到此处</template>
            </div>
            <div class="btn" :class="{ disabled: !fontFile }" @click="generate">生成</div>
            <input ref="fileInput" class="file" type="file" accept=".ttf,.eot,.woff,.woff2,.otf" @change="inputFileChange" />
        </div>
    </div>
</template>

<script>
import { message } from 'ant-design-vue'
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'TextArea',
    components: {},
    emits: ['text-input'],
    data() {
        return {
            textVal: '',
            dropActive: false,
            fontFile: null,
            fontFamilyCache: []
        }
    },
    methods: {
        generate() {
            if (!this.fontFile) return

            if (!this.textVal) {
                message.info('请先输入需要压缩的文本')
                return
            }

            const { textVal, fontFile } = this

            window.api
                .mixSend('generateCompressedFile', { text: textVal, fontPath: fontFile.path, fontName: fontFile.name })
                .then((pack) => {
                    if (pack.body.status !== 0) {
                        message.error(pack.statusText)
                    }
                })
        },
        handleInput(event) {
            const value = event.target.value
            this.textVal = value
            this.$emit('text-input', value)
        },
        handlerDragEnter(event) {
            event.stopPropagation()
            event.preventDefault()
            this.dropActive = true
        },
        handlerDragLeave(event) {
            event.stopPropagation()
            event.preventDefault()
            this.dropActive = false
        },
        handleDrop(event) {
            event.stopPropagation()
            event.preventDefault()

            const file = event.dataTransfer.files[0]
            this.fontFile = file
            this.uploadFont(file)
        },
        handleTxtDrop(event) {
            event.stopPropagation()
            event.preventDefault()

            const file = event.dataTransfer.files[0]
            const ext = file.name.replace(/.+\./, '')

            if (!ext || ext !== 'txt') {
                message.error('请上传txt文件')
                return
            }

            window.api.mixSend('uploadTxt', { txtFile: { path: file.path, name: file.name } }).then((pack) => {
                const { content } = pack.body.data

                this.textVal = content
                this.$emit('text-input', content)
            })
        },
        handlerDragover(event) {
            event.preventDefault()
        },
        handleClick() {
            this.$refs.fileInput.click()
        },
        inputFileChange(event) {
            const file = event.target.files[0]
            this.fontFile = file
            this.uploadFont(file)
        },
        uploadFont(file) {
            window.api.mixSend('uploadFont', { fontFile: { path: file.path, name: file.name } }).then((pack) => {
                const { fontPath } = pack.body.data

                const fontFamily = file.name.replace(/\.(ttf|TTF)/, '')
                const styleData = `
                    @font-face {
                        font-family: "${fontFamily}";
                        src: url("${fontPath}");
                        font-style: normal;
                        font-weight: normal;
                    }
                `

                if (!this.fontFamilyCache.includes(fontFamily)) {
                    // 全局添加@font-face
                    const newStyle = document.createElement('style')
                    newStyle.appendChild(document.createTextNode(styleData))
                    document.head.appendChild(newStyle)
                }

                // 添加font-family
                const previewElement = document.querySelector('.preview-area')
                previewElement.style.fontFamily = fontFamily

                this.fontFamilyCache.push(fontFamily)
            })
        },
        handleCancel() {
            // 去掉font-family
            const previewElement = document.querySelector('.preview-area')
            previewElement.style.fontFamily = 'initial'
            this.fontFile = null
        }
    }
})
</script>

<style lang="less" scoped>
.text-area {
    flex: 1;
    height: 100%;
    padding: 12px;
    background-color: #eee;
    position: relative;

    .title {
        @color: rgb(4, 97, 43);
        padding-bottom: 8px;
        color: @color;
        text-align: left;
        border-bottom: 1px solid @color;
        font-size: 16px;
    }

    .textarea {
        width: 100%;
        margin-top: 10px;
        padding: 8px 0;
        border: none;
        resize: none;
    }

    .font {
        @color: rgb(184, 184, 184);
        width: 100%;
        display: flex;
        padding: 12px 20px;
        justify-content: center;
        align-items: center;
        border-top: 1px solid @color;
        position: absolute;
        left: 0;
        bottom: 0;

        .drag-area {
            height: 40px;
            line-height: 40px;
            flex: 1;
            margin-right: 12px;
            color: @color;
            border: 1px dashed @color;
            cursor: pointer;

            &.drop-active {
                border-style: solid;
                box-shadow: inset 0 0 8px 2px rgb(255, 255, 255);
            }

            &.active {
                color: #333;
            }

            &:hover {
                border-style: solid;
                box-shadow: inset 0 0 8px 2px rgb(255, 255, 255);
            }

            &:active {
                border-style: solid;
                box-shadow: inset 0 0 8px rgb(202, 202, 202);
            }

            .font-detail {
                height: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0 16px;

                .cancel {
                    height: 100%;
                    line-height: 40px;
                    color: rgb(4, 97, 43);
                    cursor: pointer;
                }
            }
        }

        .btn {
            padding: 8px 12px;
            background-color: #2c4c6d;
            color: #fff;
            cursor: pointer;

            &:hover {
                filter: brightness(1.4);
            }

            &:active {
                filter: brightness(0.8);
            }

            &.disabled {
                background-color: rgb(182, 182, 182);
                cursor: default;

                &:hover {
                    filter: none;
                }

                &:active {
                    filter: none;
                }
            }
        }

        .file {
            display: none;
        }
    }
}
</style>
