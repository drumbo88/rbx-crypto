<template>
    <el-table 
        ref="myTable"
        :data="tabDatas" v-show="tabDatas && tabDatas.length"
        :max-height="'400px'" style="width: 100%"
        border class="elevation-1"
        :show-summary="Boolean(tabSummary)" :summary-method="tabSummary"
        :header-cell-class-name="'primary'"
        stripe size="mini"
        highlight-current-row
        @row-click='handleRowClick'
        @selection-change='handleSelectionChange'
        >
        <el-table-column type="selection" width="55" v-if="multable">
        </el-table-column>
        <!--  user-defined columns to display -->
        <el-table-column v-for="c in columns" 
            :key="c.attr.prop" 
            v-bind="c.attr"
            >
            <template slot-scope="scope">
                <slot v-if="c.slot" 
                    :name="c.attr.prop" 
                    :row='scope.row' 
                    :value="scope.row[c.attr.prop]">
                </slot>
                <span v-else>
                    {{ scope.row[c.attr.prop] }}
                </span>
            </template>
        </el-table-column>

        <template slot="empty">
            <h3>Aguantá un toque...</h3>
        </template>
        
    </el-table>
</template>

<script>
export default {
    name: 'rbx-table',
    props: {
        tabColumns: {
            type: Array,
            required: true,
            validator: (cols) => {
                return cols.length >= 1 // the table needs at least one column 
            }
        },
        tabDatas: {
            type: Array,
            default: () => []
        },
        tabSummary: Function,
        multable: null /*{ // whether alternative 
            type: Boolean,
            default: true
        }*/
    },
    computed: {
        columns() {
            return this.headers.filter(h => h.isShow);
        },
        hiddenColumnTotal() {
            return this.headers.filter(h => !h.isShow).length;
        }
    },
    created() {
        this.headers = JSON.parse(JSON.stringify(this.tabColumns));
        this.headers = this.headers.map((c) => {
            if(c.isShow === undefined){
                this.$set(c, 'isShow', true)
            }
            return c;
        });
    },
    data() {
        return {
            headers: [],
        }
    },
    methods: {
        // click on the line 
        handleRowClick(row) {
            this.$refs.myTable.toggleRowSelection(row);
        },
        handleSelectionChange(selection) {
            this.$emit('rowSelectionChanged', selection);
        },     
    }
}
</script>

<style>
    .btns-area{
        text-align: right;
    }
    .el-table__footer td.is-leaf {
        font-weight: bold;
    }
</style>