export default class Symbol { 

    constructor (params) {
        this.symbol = params.symbol
        if (params.price) 
            this.price = params.price
        this.changes = []
    }
    setPrice(price, time) 
    {
        this.price = price

        // Por cada cambio registrado
        let change = {
            time, price,
            percStr() { return this.perc.toFixed(2)+'%' },
        }

        const firstChange = this.changes[0]
        if (!firstChange) {
            change.perc = 0
            this.firstChange = change
        }
        else {
            // Calculo el cambio con el precio nuevo
            let porcChg = ((price / firstChange.price) - 1) * 100

            change.perc = porcChg            
        }
        this.changes.push(change)
        this.lastChange = change
    }
    getChange(time) { 
        return this.changes.find(chg => chg.time == time) 
    }
    totalChangeValue() {
        return this.firstChange ? this.firstChange.perc : null
    }
    lastChangeValue() {
        return this.lastChange ? this.lastChange.perc : null
    }
    totalChangeStr() {
        return this.firstChange ? this.firstChange.percStr() : '-'
    }
    lastChangeStr() {
        return this.lastChange ? this.lastChange.percStr() : '-'
    }
    priceStr() { 
        return this.price.toFixed(8)
    }
} 