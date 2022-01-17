/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import cx from 'classnames'
import Highcharts from 'highcharts'
import Networkgraph from 'highcharts/modules/networkgraph'
import HighchartsReact from 'highcharts-react-official'
import { merge } from 'lodash-es'
import { dependencyGraphOptions } from '@cv/components/DependencyGraph/DependencyGraph.utils'
import type { DependencyGraphProps } from '@cv/components/DependencyGraph/DependencyGraph.types'
import { wrappedArrowLength } from '@cv/components/DependencyGraph/DependencyGraph.constants'

const getParsedOptions = (defaultOptions: Highcharts.Options, options: Highcharts.Options): Highcharts.Options =>
  merge(defaultOptions, options)

export function DependencyGraph(props: DependencyGraphProps): JSX.Element {
  window.Highcharts = Highcharts

  Networkgraph(Highcharts)
  /*
  Wrapping the point class to move arrows into center of line.
  This code is also used in TestsCallgraph.tsx. Highcharts provided
  this function on a github issue.
 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type UnknownHighChartType = any
  ;(function (H: UnknownHighChartType) {
    H.wrap(H.seriesTypes.networkgraph.prototype.pointClass.prototype, 'getLinkPath', function (this: any) {
      const left = this.toNode,
        right = this.fromNode

      const angle = Math.atan((left.plotX - right.plotX) / (left.plotY - right.plotY))

      const linkLength = Math.sqrt(Math.pow(left.plotX - right.plotX, 2) + Math.pow(left.plotY - right.plotY, 2))

      /* istanbul ignore if */
      if (angle) {
        const path = ['M', left.plotX, left.plotY, right.plotX, right.plotY],
          nextLastPoint = right,
          pointRadius = linkLength / 2,
          arrowLength = wrappedArrowLength,
          arrowWidth = wrappedArrowLength,
          pointRadiusSinAngle = pointRadius * Math.sin(angle),
          pointRadiusCosAngle = pointRadius * Math.cos(angle),
          arrowLengthSinAngle = arrowLength * Math.sin(angle),
          arrowLengthCosAngle = arrowLength * Math.cos(angle),
          arrowWidthSinAngle = arrowWidth * Math.sin(angle),
          arrowWidthCosAngle = arrowWidth * Math.cos(angle)

        if (left.plotY < right.plotY) {
          path.push(nextLastPoint.plotX - pointRadiusSinAngle, nextLastPoint.plotY - pointRadiusCosAngle)
          path.push(
            nextLastPoint.plotX - pointRadiusSinAngle - arrowLengthSinAngle - arrowWidthCosAngle,
            nextLastPoint.plotY - pointRadiusCosAngle - arrowLengthCosAngle + arrowWidthSinAngle
          )

          path.push(nextLastPoint.plotX - pointRadiusSinAngle, nextLastPoint.plotY - pointRadiusCosAngle)
          path.push(
            nextLastPoint.plotX - pointRadiusSinAngle - arrowLengthSinAngle + arrowWidthCosAngle,
            nextLastPoint.plotY - pointRadiusCosAngle - arrowLengthCosAngle - arrowWidthSinAngle
          )
        } else {
          path.push(nextLastPoint.plotX + pointRadiusSinAngle, nextLastPoint.plotY + pointRadiusCosAngle)
          path.push(
            nextLastPoint.plotX + pointRadiusSinAngle + arrowLengthSinAngle - arrowWidthCosAngle,
            nextLastPoint.plotY + pointRadiusCosAngle + arrowLengthCosAngle + arrowWidthSinAngle
          )
          path.push(nextLastPoint.plotX + pointRadiusSinAngle, nextLastPoint.plotY + pointRadiusCosAngle)
          path.push(
            nextLastPoint.plotX + pointRadiusSinAngle + arrowLengthSinAngle + arrowWidthCosAngle,
            nextLastPoint.plotY + pointRadiusCosAngle + arrowLengthCosAngle - arrowWidthSinAngle
          )
        }

        return path
      }
      return [
        ['M', left.plotX || 0, left.plotY || 0],
        ['L', right.plotX || 0, right.plotY || 0]
      ]
    })
  })(Highcharts)

  const chartComponent = React.useRef<any>(null)
  const { dependencyData, options = {}, highchartsCallback, containerClassName } = props

  const defaultOptions = useMemo(() => dependencyGraphOptions(dependencyData), [dependencyData])
  const parsedOptions = useMemo(() => getParsedOptions(defaultOptions, options), [defaultOptions, options])

  return (
    <div className={cx('DependencyGraph', containerClassName)}>
      <HighchartsReact
        highcharts={Highcharts}
        options={parsedOptions}
        ref={chartComponent}
        containerProps={{ style: { height: '100%', width: '100%' } }}
        callback={highchartsCallback}
      />
    </div>
  )
}
