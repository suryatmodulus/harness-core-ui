export const CE_COLOR_CONST = [
  '#25A6F7',
  '#0BC8D6',
  '#7FB800',
  '#8A77DE',
  '#FF479F',
  '#36D068',
  '#FFBC08',
  '#F25C61',
  '#35D6CB',
  '#ED61B5'
]

export const CE_CHARTS_ENTITY_LIMIT = 30

export default {
  chart: {
    height: 300,
    animation: {
      duration: 100
    }
  },
  boost: {
    seriesThreshold: CE_CHARTS_ENTITY_LIMIT + 2 // https://stackoverflow.com/a/46365043/3860249
  },
  title: {
    text: ''
  },
  yAxis: {
    title: {
      text: ''
    }
  },
  plotOptions: {
    area: {
      lineWidth: 1,
      marker: {
        enabled: false
      }
    },
    column: {
      borderColor: null
    }
  },
  xAxis: {
    type: 'datetime',
    gridLineColor: 'var(--color-chart-line-color)'
  },
  credits: {
    enabled: false
  },
  colors: CE_COLOR_CONST
}
