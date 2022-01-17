/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AggregationOperation, QlceViewAggregationInput } from 'services/ce/services'

export enum Aggregation {
  'Average',
  'Maximum'
}

const AverageAggregatedFunction = [
  { operationType: AggregationOperation.Avg, columnName: 'avgcpuutilizationvalue' },
  { operationType: AggregationOperation.Avg, columnName: 'avgmemoryutilizationvalue' },
  { operationType: AggregationOperation.Sum, columnName: 'memoryrequest*usagedurationseconds' },
  { operationType: AggregationOperation.Sum, columnName: 'cpurequest*usagedurationseconds' }
] as any as QlceViewAggregationInput[]

const MaximumAggregatedFunction = [
  { operationType: AggregationOperation.Max, columnName: 'maxcpuutilizationvalue' },
  { operationType: AggregationOperation.Max, columnName: 'maxmemoryutilizationvalue' },
  { operationType: AggregationOperation.Sum, columnName: 'memoryrequest*usagedurationseconds' },
  { operationType: AggregationOperation.Sum, columnName: 'cpurequest*usagedurationseconds' }
] as any as QlceViewAggregationInput[]

export const AggregationFunctionMapping: Record<Aggregation, QlceViewAggregationInput[]> = {
  [Aggregation.Average]: AverageAggregatedFunction,
  [Aggregation.Maximum]: MaximumAggregatedFunction
}
