/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
