<template>   
    <div id="container"></div>
</template>

<script>
import Highcharts from "highcharts";
import { mapActions, mapGetters } from 'vuex';

export default {
    props: {
        title: {
            type: String,
        },
        subtitle: {
            type: String,
        },
        symbol: {
            type: String,
        },
        interval: {
            type: String,
        },
        startTime: {
            type: String,
        },
        endTime: {
            type: String,
        },
    },
    data: () => ({
        error: '',
        range: 2,
        plotPercentages: [5,10,15,20],
        plotLinesVisible: null,
        value0: null,
    }),
    async mounted() {
        this.loadChart()
        setInterval(() => this.loadChart(), 1 * 60000)        

        // https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/new-intraday.json
        /*await Highcharts.getJSON(this.url, function (data) {
            VueThis.data = data
            VueThis.loadChart()
        })*/
        //.catch(e => console.error(e))
    },
    methods: {
        ...mapActions('tickers', ['getCandles']),
        async getChartData () 
        {
            await this.getCandles({ 
                symbol:     this.symbol,
                interval:   this.getInterval,
                startTime:  this.getStartTime,
                endTime:    this.getEndTime,
            })
        },
        async loadChart() {    
            await this.getChartData()
            // Create the chart
            Highcharts.stockChart('container', this.chartOptions)
        },
        tooglePlotLines(axis, newValue0) {
            /*(false && this.plotLinesVisible)
                ? this.unplotLines(axis)
                : */this.plotLines(axis, newValue0)
        },
        unplotLines(axis) {
            const yAxisID = 'yA0'
            let yAxis = axis.chart.get(yAxisID)
            
            for (let line of yAxis.plotLinesAndBands) 
            {
                line.svgElem.opacity = 0
                line.options.label.style.display = 'none'
            }
            this.plotLinesVisible = false
        },
        plotLines(axis, newValue0) {
            const yAxisID = 'yA0'
            let points = axis.series[0].points,
                yAxis = axis.chart.get(yAxisID),
                value0,
                plotLinesLength = yAxis.plotLinesAndBands.length

            // Punto de referencia inicial: promedio
            if (this.plotLinesVisible === null || !plotLinesLength) {
                let total = 0, avgLength = 0

                for (let point of points) {
                    if (point.isInside) {
                        total += point.y;
                        avgLength++;
                    }
                }
                value0 = (total / avgLength)

                // Opciones por defecto / generales para todos
                let defOptions = {
                    color: 'rgba(255,255,0,1)',
                    dashStyle: 'dash',
                    zIndex: 4,
                    label: { style: { display: 'none', color: '#eee' } },
                    width: 1,
                    isAVG: true,
                }
                // CERO
                yAxis.addPlotLine({ 
                    ...defOptions,
                    id: yAxisID + '_0',
                    value: value0,
                    label: { ...defOptions.label, 
                        formatter: function () {
                            return `${this.options.isAVG ? 'AVG' : '0%'} = ${this.options.value.toFixed(2)}` 
                        },
                    },
                })
                for (let perc of this.plotPercentages) 
                {
                    const percValue = 0.8-perc/25
                    let value, options
                    // POSITIVO
                    value = value0 * (1 + perc/100)
                    options = { 
                        ...defOptions, color: 'rgba(255,255,0,'+(percValue)+')',
                        id: `${yAxisID}_+${perc}`,
                        label: { ...defOptions.label, 
                            formatter: function () { // text: `+${perc.toFixed(0)}% = ${value.toFixed(2)}` },
                                return `+${perc.toFixed(0)}% = ${this.options.value.toFixed(2)}` 
                            },
                        },
                        value,
                    }
                    yAxis.addPlotLine(options);

                    // NEGATIVO
                    value = value0 * (1 - perc/100)
                    options = { 
                        ...defOptions, color: 'rgba(255,255,0,'+(percValue)+')',
                        id: `${yAxisID}_-${perc}`,
                        label: { ...defOptions.label, 
                            formatter: function () { // text: `-${perc.toFixed(0)}% = ${value.toFixed(2)}` },
                                return `-${perc.toFixed(0)}% = ${this.options.value.toFixed(2)}` 
                            },
                        },
                        value,
                    }
                    yAxis.addPlotLine(options);
                }
                this.plotLinesVisible = false
            }
            // Mover de 0%
            else {
                //value = valores del mouse
                value0 = newValue0

                yAxis.plotLinesAndBands[0].options.isAVG = false
                
                for (let i=0; i<plotLinesLength; i++)
                {
                    let line = yAxis.plotLinesAndBands[0],
                        newOptions = line.options 
                    
                    newOptions.value *= value0 / this.value0
                    newOptions.label.style.display = 'initial'
                    yAxis.removePlotLine(line.options.id)
                    yAxis.addPlotLine(newOptions)
                }
                this.plotLinesVisible = true
            }
            this.value0 = value0
        },
    },
    computed: {
        ...mapGetters('tickers', ['candles']),
        getTitle() {
            if (this.symbol && !this.title)
                return 'Cambio de '+this.symbol
            return this.title ? this.title : 'Evolución'
        },
        chartOptions() {
            const vueComp = this
            const candles = this.candles(this.symbol)
            let container = document.getElementById('container')
console.log(this.range)
            const data= {
                chart: {
                    //height: 300,
                    events: {
                        load: function() {
                            let rangeSelectorLabel = container.getElementsByClassName("highcharts-range-selector-buttons")[0].firstChild
                            let rangeToLabel = container.getElementsByClassName("highcharts-range-label")[0].firstChild
                            let rangeFromLabel = container.getElementsByClassName("highcharts-range-label")[1].firstChild
                            rangeSelectorLabel.textContent  = "Ver";
                            rangeSelectorLabel.style.fill   = rangeToLabel.style.fill   = rangeFromLabel.style.fill   ="#eee";
                            //rangeToLabel.textContent        = "Desde";
                            //rangeFromLabel.textContent      = "Hasta";
                            if (vueComp.plotPercentages.length)
                                vueComp.plotLines(this.get('xA0'))
                            for (let i=0; i<this.rangeSelector.buttons.length; i++)
                                this.rangeSelector.buttons[i].events = {
                                    click: function () { vueComp.range = i }
                                }
                        },
                        click: function(e) {
                            if (vueComp.plotPercentages.length)
                                vueComp.tooglePlotLines(this.get('xA0'), e.yAxis[0].value)
                        }
                    },
                },
                xAxis: {
                    id: 'xA0',
                },
                yAxis: {
                    id: 'yA0',
                    /*labels: {
                        formatter: function () {
                            return (this.value > 0 ? ' + ' : '') + this.value + '%';
                        }
                    }*/
                },
                rangeSelector: {
                    style: { color: '#eee'},
                    allButtonsEnabled: true,
                    buttons: [{
                        type: 'minute',
                        count: 60,
                        text: '1m',
                        dataGrouping: {
                            forced: true,
                            units: [['minute', [1]]]
                        }
                    }, {
                        type: 'minute',
                        count: 600,
                        text: '10m',
                        dataGrouping: {
                            forced: true,
                            units: [['minute', [10]]]
                        }
                    }, {
                        type: 'hour',
                        count: 60,
                        text: '1h',
                        dataGrouping: {
                            forced: true,
                            units: [['hour', [1]]]
                        }
                    }, {
                        type: 'hour',
                        count: 240,
                        text: '4h',
                        dataGrouping: {
                            forced: true,
                            units: [['hour', [4]]]
                        }
                    }, {
                        type: 'day',
                        count: 60,
                        text: '1d',
                        dataGrouping: {
                            forced: true,
                            units: [['day', [1]]]
                        }
                    }, {
                        type: 'week',
                        count: 60,
                        text: '1w', 
                        dataGrouping: {
                            forced: true,
                            units: [['week', [1]]]
                        }
                    }, {
                        type: 'all',
                        text: '1M',
                        dataGrouping: {
                            forced: true,
                            units: [['month', [1]]]
                        },
                    }],
                    buttonTheme: {
                        //width: 60
                    },
                    inputStyle: {
                        color: '#eee',
                        //fontWeight: 'bold'
                    },
                    labelStyle: {
                        color: '#eee',
                    },
                    selected: this.range,
                    events: {
                    click: function() {
                        alert(this)
                    }}
                },

                title: {
                    text: this.getTitle,
                },

                subtitle: this.subtitle ? {
                    text: this.subtitle,
                } : undefined,

                _navigator: {
                    enabled: false
                },

                series: [{
                    name: this.symbol,
                    data: candles,
                    type: 'candlestick',
                    marker: {
                        enabled: null, // auto
                        radius: 3,
                        lineWidth: 1,
                        lineColor: '#FFFFFF'
                    },
                    tooltip: {
                        valueDecimals: 2
                    }
                }],

                plotOptions: {
                    /*series: {
                        compare: 'percent',
                        compareStart: false
                    },*/
                },
                scrollbar: {
                    enabled: false
                },
                
            }
            return data
        }
    }
}
</script>

<style scoped>
    #container {
        height: 400px; 
        min-width: 600px; 
        max-width: 800px; 
        margin: 0 auto
    }
</style>