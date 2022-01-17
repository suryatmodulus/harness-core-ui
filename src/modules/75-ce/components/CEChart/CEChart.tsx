/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import Highcharts from 'highcharts'

import patternFill from 'highcharts/modules/pattern-fill'

import HighchartsReact from 'highcharts-react-official'
import highchartsMore from 'highcharts/highcharts-more'
import addBoostModule from 'highcharts/modules/boost'
import addBoostCanvastModule from 'highcharts/modules/boost-canvas'
import CEChartOptions from './CEChartOptions'

patternFill(Highcharts)
highchartsMore(Highcharts)

addBoostCanvastModule(Highcharts)
addBoostModule(Highcharts)

interface CEChartProps {
  options: Highcharts.Options
}

const CEChart: React.FC<CEChartProps> = ({ options }: CEChartProps) => {
  const opt: Highcharts.Options = Object.assign({}, CEChartOptions, options)
  return <HighchartsReact highcharts={Highcharts} options={opt} />
}

export default CEChart
