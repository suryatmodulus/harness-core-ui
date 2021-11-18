import type {
  Chart as HighchartsChart,
  TooltipFormatterCallbackFunction,
  TooltipFormatterContextObject
} from 'highcharts'
import { useEffect, useState, useRef } from 'react'
import ReactDOM from 'react-dom'

const generateTooltipId = (chartId: number): string => `highcharts-custom-tooltip-${chartId}`

interface Props {
  chart: HighchartsChart | null
  children(formatterContext: TooltipFormatterContextObject): JSX.Element
}

export const HighchartCustomTooltip: React.FC<Props> = ({ chart, children }) => {
  const isInit = useRef(false)
  const [context, setContext] = useState<TooltipFormatterContextObject | null>(null)

  useEffect(() => {
    if (chart?.tooltip && chart.update) {
      const formatter: TooltipFormatterCallbackFunction = function () {
        // Ensures that tooltip DOM container is rendered before React portal is created.
        if (!isInit.current) {
          isInit.current = true

          chart.tooltip.refresh.apply(chart.tooltip, [this.point])
          chart.tooltip.hide(0)
        }

        setContext(this)

        return `<div id="${generateTooltipId(chart.index)}"></div>`
      }

      chart.update({
        tooltip: {
          formatter,
          useHTML: true
        }
      })
    }
  }, [chart])

  const node = chart?.index && document.getElementById(generateTooltipId(chart.index))

  return node && context ? ReactDOM.createPortal(children(context), node) : null
}
