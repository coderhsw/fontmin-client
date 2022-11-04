<!-- @format -->

<template>
    <div class="previewer">
        <p class="title">示例文字，请在左侧输入文本片段</p>
        <div ref="previewArea" class="preview-area"></div>
    </div>
</template>

<script>
export default {
    name: 'Previewer',
    components: {},
    props: {
        text: String
    },
    data() {
        return {
            defaultText:
                '望江南·超然台作<br/>春未老，风细柳斜斜。<br/>试上超然台上看，半壕春水一城花。<br/>烟雨暗千家。<br/>寒食后，酒醒却咨嗟。<br/>休对故人思故国，且将新火试新茶。<br/>诗酒趁年华。'
        }
    },
    watch: {
        text(newVal) {
            if (!newVal) {
                this.createDefaultText()
            } else {
                this.createText(newVal)
            }
        }
    },
    mounted() {
        this.createDefaultText()
    },
    methods: {
        createDefaultText() {
            this.$refs.previewArea.innerHTML = this.defaultText
        },
        createText(value) {
            this.$refs.previewArea.innerText = value
        }
    }
}
</script>

<style lang="less" scoped>
.previewer {
    flex: 1;
    height: 100%;
    text-align: left;
    padding: 12px 16px;

    .title {
        margin-bottom: 20px;
        color: rgb(136, 136, 136);
    }

    .preview-area {
        font-size: 20px;
    }
}
</style>
