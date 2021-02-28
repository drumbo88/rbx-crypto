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
            sm="6"
            md="4"
            lg="3"
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
  import axios from 'axios';

  export default {
    name: 'MarketTopChanges',
    props: ['mins', 'limit', 'symbol', 'coin', 'base'],
    data: () => ({
      itemsPerPageArray: [4, 8, 12],
      search: '',
      filter: {},
      sortDesc: false,
      page: 1,
      itemsPerPage: 8,
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
    },
    mounted () {

      let coin = this.coin || ''
      let base = this.base || ''
      //let limit = this.limit || 10
      if (this.symbol) {
        let symbolParts = this.symbol.split('-').slice(0, 2)
        symbolParts = symbolParts.reverse()
        base = symbolParts[0]
        coin = symbolParts[1]
        //[this.base, this.coin] = symbolParts.reverse()
      }
      let symbol = (coin || base) ? `${coin}-${base}` : ''
      this.API_GET_PRICES_DATA = process.env.VUE_APP_API_URL + `/markets/${symbol}`
      this.getPrices()
    },
    updated() {
      let mins = this.mins || 5
      const unSeg = 1/60
      if (mins < unSeg)
        mins = unSeg
      //console.log (this.coin, this.lastCoin, this.lastCoin !== null && this.lastCoin !== this.coin)
      if (this.lastCoin !== null && this.lastCoin !== this.coin) 
        clearInterval(this.intervalId)
      if (this.lastCoin !== this.coin) 
        this.intervalId = setInterval(this.getPrices, mins * 60000)
      //if (this.lastCoin === null)
      this.lastCoin = this.coin
    },
    methods: {
      getPrices () {
        let vue = this
        axios.get(this.API_GET_PRICES_DATA)
          .then(response => {
            let times = Object.keys(vue.symbols)
            //vue.lastTime = times.length ? times[times.length - 1] : null
            let currentTime = response.data.time
            if (!times.length)
              setInterval(() => { this.firstTime = ''; this.firstTime = currentTime }, 1000)
            console.log(new Date(currentTime).toLocaleString())
            let lastPrices = vue.symbols[currentTime] = []
            let symbols = response.data.data
            for (let sym in symbols) {
              let price = parseFloat(symbols[sym])
              let symbolObj = { 
                symbol: sym, 
                price, 
                changes: [],
                getChange(time) { 
                  return this.changes.find(chg => chg.time == time) 
                },
                totalChangeValue() {
                  return this.firstChange ? this.firstChange.percStr() : null
                },
                lastChangeValue() {
                  return this.lastChange ? this.lastChange.percStr() : null
                },
                totalChangeStr() {
                  return this.firstChange ? this.firstChange.percStr() : '-'
                },
                lastChangeStr() {
                  return this.lastChange ? this.lastChange.percStr() : '-'
                },
                priceStr() { 
                  return this.price.toFixed(8)
                },
              } 
              for (let time of times) {
                let prevSymObj = vue.getSymbol(sym, time)
                if (!prevSymObj) 
                  continue
                let prevPrice = prevSymObj.price
                let porcChg = ((price / prevPrice) - 1) * 100
                let change = {
                  time: time,
                  perc: porcChg,
                  percStr() { return this.perc.toFixed(2)+'%' },
                }
                if (!symbolObj.changes.length)
                  symbolObj.firstChange = change
                symbolObj.lastChange = change
                if (symbolObj.changes.length < 2) // Solo primero y último
                  symbolObj.changes.push(change)
                else if (symbolObj.changes.length == 2)
                  symbolObj.changes[1] = change

                //symbolObj.chgStr = porcChg.toFixed(2)+'%'
                //symbolObj.chgTotalStr = porcChg.toFixed(2)+'%'
              }
              lastPrices.push(symbolObj)
            }
            vue.lastTime = currentTime
            vue.items = vue.lastTime ? vue.getSymbols() : [] 
            //vue.items = vue.lastTime ? vue.topChanges(lastTime) : [] //'Esperando recibir datos.'
            //vue.lastCoin = vue.coin
          })
      },
      getSymbol(symbol, time) { // Retorna symbolObj en time o más reciente
        return this.getSymbols(time).find(symObj => symObj.symbol == symbol)
      },
      getSymbols(time) {
        return this.symbols[time || this.lastTime]
      }, 
      /*topChanges(time) {
        let limit = this.limit || 5
        if (this.lastCoin === null)
          return this.getSymbols().sort((a, b) => {
            let chgA = a.price, chgB = b.price
            if (chgA == chgB) return 0
            return (chgA > chgB) ? -1 : 1
          }).slice(0, limit + 1)
        return this.getSymbols().sort((a, b) => {
          let chgA = a.getChange(time), chgB = b.getChange(time)
          if (!chgA || !chgB || chgA.perc == chgB.perc) return 0
          return (chgA.perc > chgB.perc) ? -1 : 1
        }).slice(0, limit)
      },*/
      nextPage () {
        if (this.page + 1 <= this.numberOfPages) this.page += 1
      },
      formerPage () {
        if (this.page - 1 >= 1) this.page -= 1
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
            ? (valA > valB ? 1 : -1)
            : (valA < valB ? 1 : -1)
          //switch (this.fields[sortBy].type) 
        })
        return items
      }
    },
    computed: {
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
        return this.firstTime ? this.$moment(this.firstTime).fromNow() : ''
      },
      lastTimeStr () {
        return this.lastTime ? this.$moment(this.lastTime).fromNow() : ''
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
