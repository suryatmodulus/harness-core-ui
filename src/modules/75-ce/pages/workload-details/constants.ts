/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AggregationOperation, QlceViewAggregationInput } from 'services/ce/services'

export enum Aggregation {
  'TimeWeighted',
  'Absolute'
}

const TimeAggegatedFunction = [
  { operationType: AggregationOperation.Sum, columnName: 'avgcpuutilizationvalue*usagedurationseconds' },
  { operationType: AggregationOperation.Sum, columnName: 'avgmemoryutilizationvalue*usagedurationseconds' },
  { operationType: AggregationOperation.Sum, columnName: 'cpulimit*usagedurationseconds' },
  { operationType: AggregationOperation.Sum, columnName: 'cpurequest*usagedurationseconds' },
  { operationType: AggregationOperation.Sum, columnName: 'memorylimit*usagedurationseconds' },
  { operationType: AggregationOperation.Sum, columnName: 'memoryrequest*usagedurationseconds' }
] as any as QlceViewAggregationInput[]

const AbosuleAggegatedFunction = [
  { operationType: AggregationOperation.Sum, columnName: 'avgcpuutilizationvalue' },
  { operationType: AggregationOperation.Sum, columnName: 'avgmemoryutilizationvalue' },
  { operationType: AggregationOperation.Sum, columnName: 'cpulimit' },
  { operationType: AggregationOperation.Sum, columnName: 'cpurequest' },
  { operationType: AggregationOperation.Sum, columnName: 'memorylimit' },
  { operationType: AggregationOperation.Sum, columnName: 'memoryrequest' }
] as any as QlceViewAggregationInput[]

export const AggregationFunctionMapping: Record<Aggregation, QlceViewAggregationInput[]> = {
  [Aggregation.TimeWeighted]: TimeAggegatedFunction,
  [Aggregation.Absolute]: AbosuleAggegatedFunction
}
