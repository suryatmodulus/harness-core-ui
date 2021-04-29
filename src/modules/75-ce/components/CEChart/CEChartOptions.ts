export default {
  chart: {
    height: 300,
    animation: {
      duration: 100
    }
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
  }
}
