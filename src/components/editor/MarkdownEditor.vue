<template>
  <div :id="editorId"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

const mdEditor = ref(null)
const editorId = Math.random().toString(36).slice(-10)
const props = defineProps({
  contentValue: {
    type: String,
    required: true
  },
  editorOptions: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['update:contentValue'])

watch(
  () => props.contentValue,
  async (newContentValue, oldContentValue) => {
    try {
      if (newContentValue !== mdEditor.value.getValue()) {
        mdEditor.value.setValue(newContentValue)
      }
    } catch (error) {
      console.log(error)
    }
  }
)

onMounted(() => {
  mdEditor.value = new Vditor(editorId, {
    after() {
      // vditor.value is a instance of Vditor now and thus can be safely used here
      mdEditor.value.setValue(props.contentValue)
    },
    placeholder: 'Please enter text...',
    cache: {
      enable: false
    },
    blur(value) {
      // 编辑器失焦后触发
      // console.log('blur', value)
      if (value !== props.contentValue) {
        emit('update:contentValue', value)
      }
    },
    ...props.editorOptions
  })
})
onUnmounted(() => {
  // 销毁mdEditor
  mdEditor.value.destroy()
})
</script>

<style scoped></style>
