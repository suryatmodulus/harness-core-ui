import {
  QlceViewTimeFilterOperator,
  ViewFieldIdentifier,
  QlceViewFilterWrapperInput,
  QlceViewFieldInputInput,
  QlceViewGroupByInput,
  QlceViewTimeGroupType,
  QlceViewFilterInput
} from 'services/ce/services'

const startTimeLabel = 'startTime'

export const getViewFilterForId: (viewId: string) => QlceViewFilterWrapperInput = (viewId: string) => {
  return { viewMetadataFilter: { viewId: viewId, isPreview: false } } as QlceViewFilterWrapperInput
}

export const getTimeFilters: (from: number, to: number) => QlceViewFilterWrapperInput[] = (from, to) => {
  return [
    {
      timeFilter: {
        field: { fieldId: startTimeLabel, fieldName: startTimeLabel, identifier: ViewFieldIdentifier.Common },
        operator: QlceViewTimeFilterOperator.After,
        value: from
      }
    },
    {
      timeFilter: {
        field: { fieldId: startTimeLabel, fieldName: startTimeLabel, identifier: ViewFieldIdentifier.Common },
        operator: QlceViewTimeFilterOperator.Before,
        value: to
      }
    }
  ] as QlceViewFilterWrapperInput[]
}

export const getGroupByFilter: (groupBy: QlceViewFieldInputInput) => QlceViewGroupByInput = groupBy => {
  return {
    entityGroupBy: groupBy
  } as QlceViewGroupByInput
}

export const getTimeRangeFilter: (aggregation: QlceViewTimeGroupType) => QlceViewGroupByInput = aggregation => {
  return {
    timeTruncGroupBy: {
      resolution: aggregation
    }
  } as QlceViewGroupByInput
}

export const getFilters: (viewConditions: QlceViewFilterInput[]) => QlceViewFilterWrapperInput[] = viewConditions => {
  return viewConditions
    .filter(viewCondition => {
      return viewCondition.values?.length
    })
    .map(viewCondition => {
      return {
        idFilter: {
          values: viewCondition.values,
          operator: viewCondition.operator,
          field: {
            fieldId: viewCondition.field.fieldId,
            fieldName: viewCondition.field.fieldName,
            identifier: viewCondition.field.identifier
          }
        }
      }
    }) as QlceViewFilterWrapperInput[]
}

export const DEFAULT_GROUP_BY = {
  fieldId: 'clusterName',
  fieldName: 'Cluster Name',
  identifier: ViewFieldIdentifier.Cluster,
  identifierName: ViewFieldIdentifier.Cluster
}
