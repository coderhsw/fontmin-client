<template>
    <div class="ui-wrap">
        <TextArea @text-input="textInput"></TextArea>
        <Previewer :text="textVal"></Previewer>
    </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import Previewer from './components/previewer/index.vue'
import TextArea from './components/textArea/index.vue'

export default defineComponent({
    components: {
        Previewer,
        TextArea
    },
    setup() {
        const textVal = ref('')

        const textInput = (value) => {
            textVal.value = value
        }

        return {
            textVal,
            textInput
        }
    }
})
</script>

<style lang="less" scoped>
.ui-wrap {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}
</style>
