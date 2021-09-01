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
