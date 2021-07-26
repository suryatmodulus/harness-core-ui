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
