<template>
  <v-container fluid>
    <v-data-iterator
      :items="items"
      :items-per-page.sync="itemsPerPage"
      :page.sync="page"
      :search="search"
      :sort-by="sortBy"
      :custom-sort="sortIterator"
      :sort-desc="sortDesc"
      hide-default-footer
    >
      <template v-slot:header>
        <v-toolbar
          dark
          color="blue darken-3"
          class="mb-1"
        >
          <v-text-field
            v-model="search"
            clearable
            flat
            solo-inverted
            hide-details
            prepend-inner-icon="mdi-magnify"
            label="Search"
          ></v-text-field>
          <template v-if="$vuetify.breakpoint.mdAndUp">
            <v-spacer></v-spacer>
            <v-select
              v-model="sortBy"
              flat
              solo-inverted
              hide-details
              :items="fields"
              :item-value="'propName'"
              prepend-inner-icon="mdi-sort"
              label="Sort by"
            ></v-select>
            <v-spacer></v-spacer>
            <v-btn-toggle
              v-model="sortDesc"
              mandatory
            >
              <v-btn
                large
                depressed
                color="blue"
                :value="false"
              >
                <v-icon>mdi-arrow-up</v-icon>
              </v-btn>
              <v-btn
                large
                depressed
                color="blue"
                :value="true"
              >
                <v-icon>mdi-arrow-down</v-icon>
              </v-btn>
            </v-btn-toggle>
          </template>
        </v-toolbar>
      </template>

      <template v-slot:default="props">
        <v-row>
          <v-col
            v-for="(item, pos) in props.items"
            :key="item.symbol"
            cols="12"
            sm="12"
            md="6"
            lg="6"
          >
            <v-card>
              <v-card-title class="subheading font-weight-bold">
                #{{ pos + 1 }} - {{ item.symbol }}
              </v-card-title>

              <v-divider></v-divider>

              <v-list dense>
                <v-list-item
                  v-for="(field, index) in cardFields"
                  :key="index"
                >
                  <v-list-item-content :class="{ 'blue--text': sortBy === field.propName }">
                    {{ field.text }}:
                  </v-list-item-content>
                  <v-list-item-content
                    class="align-end"
                    :class="{ 'blue--text': sortBy === field.propName }"
                  >
                    {{ item[field.toStr]() }}
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <template v-slot:footer>
        <v-row
          class="mt-2"
          align="center"
          justify="center"
        >
          <span class="black--text">
            <u>Since:</u> {{ firstTimeStr }} | <u>Last update:</u> {{ lastTimeStr }} | 
          </span>
          <span class="grey--text">Items per page</span>
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                dark
                text
                color="primary"
                class="ml-2"
                v-bind="attrs"
                v-on="on"
              >
                {{ itemsPerPage }}
                <v-icon>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="(number, index) in itemsPerPageArray"
                :key="index"
                @click="updateItemsPerPage(number)"
              >
                <v-list-item-title>{{ number }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-spacer></v-spacer>

          <span
            class="mr-4
            grey--text"
          >
            Page {{ page }} of {{ numberOfPages }}
          </span>
          <v-btn
            fab
            dark
            color="blue darken-3"
            class="mr-1"
            @click="formerPage"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn
            fab
            dark
            color="blue darken-3"
            class="ml-1"
            @click="nextPage"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-row>
      </template>
    </v-data-iterator>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
  export default {
    name: 'MarketTopChanges',
    props: ['mins', 'limit', 'symbol', 'coin', 'base'],
    data: () => ({
      itemsPerPageArray: [4, 8, 12],
      search: '',
      filter: {},
      sortDesc: false,
      page: 1,
      itemsPerPage: 4,
      sortBy: null,
      fields: [
        { text: 'Symbol', propName: 'symbol' },
        { text: 'Price (BTC)', propName: 'price', toStr: 'priceStr' },
        { text: 'Last change', propName: 'lastChangeValue', isMethod: true, toStr: 'lastChangeStr', sorted: true },
        { text: 'Total change', propName: 'totalChangeValue', isMethod: true, toStr: 'totalChangeStr' },
        //{ text: 'Total change', type: 'percent', prop: 'totalChangeStr' },
      ],
      items: [],
      symbols: {
        // <time>: [ { symbol: SYM1, price: 1234, changes: [{ time: <prevTime>: perc: 5.2, ... }, ... ] }, { symbol: SYM2, ... }, ...]
      },
      firstTime: null,
      lastTime: null,
      lastCoin: null,
      intervalId: null
    }),
    /* SYMBOL: COIN-BASE
          ABC = XXX-ABC : 1 Base * Coins
         -ABC = XXX-ABC : 1 Base * Coins
         ABC- = ABC-XXX : 1 Coin * Bases
      ABC-DEF = ABC-DEF : 1 Symbol
    */
    created () {
      for (let i=0; i < this.fields.length; i++) {
        let field = this.fields[i]
        field.order = i
        if ('sorted' in field) 
          this.sortBy = field.propName
        if (!('toStr' in field)) 
          field.toStr = field.propName 
      }
      this.getData()
      // El setInterval solo funciona cuando llamo a un method (no sé por qué °_°)
      setInterval(() => this.getData(), this.getIntervalMins * 60000)
    },
    mounted () {
      /*let vue = this
      let loadPrices = function() { 
        return vue.$store.dispatch('loadPrices', vue.symbol) 
      }
      setInterval(() => loadPrices, this.getIntervalMins * 60000)
      loadPrices()*/
    },
    /*updated() {
      let mins = this.mins || 5
      const unSeg = 1/60
      if (mins < unSeg)
        mins = unSeg
      //console.log (this.coin, this.lastCoin, this.lastCoin !== null && this.lastCoin !== this.coin)
      if (this.lastCoin !== null && this.lastCoin !== this.coin) {
        clearInterval(this.intervalId)
        this.intervalId = null
      }
      if (!this.intervalId && this.lastCoin !== this.coin) 
        this.intervalId = setInterval(() => this.getPrices(), thismins * 60000)
      //if (this.lastCoin === null)
      this.lastCoin = this.coin
    },*/
    methods: {
      ...mapActions('tickers', ['getPrices']),
      /*topChanges(time) {
        let limit = this.limit || 5
        if (this.lastCoin === null)
          return this.getPrices().sort((a, b) => {
            let chgA = a.price, chgB = b.price
            if (chgA == chgB) return 0
            return (chgA > chgB) ? -1 : 1
          }).slice(0, limit + 1)
        return this.getPrices().sort((a, b) => {
          let chgA = a.getChange(time), chgB = b.getChange(time)
          if (!chgA || !chgB || chgA.perc == chgB.perc) return 0
          return (chgA.perc > chgB.perc) ? -1 : 1
        }).slice(0, limit)
      },*/
      nextPage () {
        if (this.page + 1 <= this.numberOfPages) 
          this.page += 1
      },
      formerPage () {
        if (this.page - 1 >= 1) 
          this.page -= 1
      },
      updateItemsPerPage (number) {
        this.itemsPerPage = number
      },
      getSymbolProp (item, propIndex) {
        let field = this.fields[propIndex]        
        let prop = item[field.toStr]
        let itemProp = item[prop]
        if (!(prop in item))
          console.error(`El objeto no tiene propiedad '${field}' ni método 'toStr' definido.`)
        else
          return typeof itemProp == 'function' ? item[itemProp]() : item[itemProp]
      },
      sortIterator(items, sortBy, sortDesc, locale, customSorters) {
        sortBy = customSorters
        customSorters = sortBy
        customSorters = locale
        items.sort((a,b) => {
          let valA, valB
          if (this.sortIsMethod) {
            valA = a[this.sortBy]()
            valB = b[this.sortBy]()
          }
          else {
            valA = a[this.sortBy]
            valB = b[this.sortBy]
          }
          if (valA == valB)
            return 0
          return sortDesc[0]
            ? ((valA > valB) ? 1 : -1)
            : ((valA < valB) ? 1 : -1)
          //switch (this.fields[sortBy].type) 
        })
        return items
      },
      getData() {
          return this.$store.dispatch('tickers/get', { symbol: this.symbol })
            .then(() => {
              this.items = this.getPrices()
            })
            .catch(err => {
              console.log("getPrices Err", err)
            })
      },
    },
    computed: {
			...mapGetters('tickers', ['getSymbol','getPrices']),
			...mapGetters('balance', ['getTotalBalanceBTC']),
			//...mapGetters('balance', ['getBuysList']),

      getIntervalMins() {
        let mins = this.mins || 5
        const unSeg = 1/60
        if (mins < unSeg)
          mins = unSeg
        console.log(`Repetición de peticiones: ${mins} minutos`)
        return mins
      },
      sortIndex () {
        return this.fields.findIndex(f => f.propName == this.sortBy)
      },
      sortIsMethod () {
        return this.fields[this.sortIndex].isMethod
      },
      numberOfPages () {
        return Math.ceil(this.items.length / this.itemsPerPage)
      },
      firstTimeStr () {
        return this.$store.state.firstTime ? this.$moment(this.$store.state.firstTime).fromNow() : ''
      },
      lastTimeStr () {
        return this.$store.state.lastTime ? this.$moment(this.$store.state.lastTime).fromNow() : ''
      },
      cardTitle() {
        return this.fields[0] // El primero
      },
      cardFields() {
        return this.fields.slice(1) // Todos menos el primero
      }
    }
  }
</script>
