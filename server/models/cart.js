module.exports = function Cart(oldCart) {
    this.items = oldCart.items || {}
    this.totalQty = oldCart.totalQty || 0
    this.totalPrice = oldCart.totalPrice || 0

    this.add = function (item, id) {
        let storedItem = this.items[id]
        if (!storedItem)
            storedItem = this.items[id] = {
                item: item, qty: 0, totalPrice: 0
            }
        storedItem.qty++
        storedItem.totalPrice = storedItem.qty * item.price
        this.totalQty++
        this.totalPrice += storedItem.item.price
    }

    this.generateArray = function () {
        let arr = []
        for (var id in this.items)
            arr.push(this.items[id])
        return arr
    }
}