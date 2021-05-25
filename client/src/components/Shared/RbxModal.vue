<template>
    <el-dialog
        v-bind="$attrs"
        :visible.sync="hasTitle"
        :title="title"
    >
        <slot />
    </el-dialog>
</template>

<script>
    export default {
        props: ['title'],
        computed: {
            hasTitle: {
                get() { return Boolean(this.title) },
                set(v) { return v }
            }
        }
    }
</script>

<style>
    .el-dialog__body {
        padding: 0px 20px 10px 20px !important
    }
</style>