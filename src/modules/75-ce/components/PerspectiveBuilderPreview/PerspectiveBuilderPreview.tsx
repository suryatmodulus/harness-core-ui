import React from 'react'
import { useParams } from 'react-router-dom'
import { Container, Text, Layout, FlexExpander, Icon } from '@wings-software/uicore'
import cx from 'classnames'
import { Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import {
  useFetchViewFieldsQuery,
  QlceViewFilterWrapperInput,
  useFetchPerspectiveFiltersValueQuery,
  QlceViewFieldInputInput,
  ViewFieldIdentifier,
  ViewChartType
} from 'services/ce/services'

import css from './PerspectiveBuilderPreview.module.scss'

interface GroupByViewProps {
  groupBy: QlceViewFieldInputInput
  setGroupBy: (groupBy: QlceViewFieldInputInput) => void
  chartType: ViewChartType
  setChartType: (type: ViewChartType) => void
}

const GroupByView: React.FC<GroupByViewProps> = ({ groupBy, setGroupBy, chartType, setChartType }) => {
  const { perspectiveId } = useParams<{ perspectiveId: string }>()

  const { getString } = useStrings()

  const [result] = useFetchViewFieldsQuery({
    variables: {
      filters: [{ viewMetadataFilter: { viewId: perspectiveId, isPreview: true } } as QlceViewFilterWrapperInput]
    }
  })
  const { data, fetching } = result

  const [labelResult] = useFetchPerspectiveFiltersValueQuery({
    variables: {
      filters: [
        {
          idFilter: {
            field: {
              fieldId: 'labels.key',
              fieldName: '',
              identifier: 'LABEL'
            },
            operator: 'IN',
            values: []
          }
        } as unknown as QlceViewFilterWrapperInput
      ],
      offset: 0,
      limit: 100
    }
  })

  const { data: labelResData } = labelResult

  const labelData = labelResData?.perspectiveFilters?.values

  const fieldIdentifierData = data?.perspectiveFields?.fieldIdentifierData

  const PopoverContent =
    fieldIdentifierData && fieldIdentifierData.length ? (
      <Menu>
        {fieldIdentifierData.map(field => {
          if (field) {
            return (
              <MenuItem key={field.identifier} text={field.identifierName}>
                {field.values.length
                  ? field.values.map(value => {
                      if (value) {
                        if (value.fieldId === 'label' && labelData?.length) {
                          return (
                            <MenuItem key={value.fieldId} text={value.fieldName}>
                              <div className={css.groupByLabel}>
                                {labelData.map(label => (
                                  <MenuItem
                                    key={label}
                                    text={label}
                                    onClick={() =>
                                      setGroupBy({
                                        identifier: ViewFieldIdentifier.Label,
                                        fieldId: 'labels.value',
                                        fieldName: label || '',
                                        identifierName: 'Label'
                                      })
                                    }
                                  />
                                ))}
                              </div>
                            </MenuItem>
                          )
                        }
                        return (
                          <MenuItem
                            key={value.fieldId}
                            text={value.fieldName}
                            onClick={() =>
                              setGroupBy({
                                fieldId: value.fieldId,
                                fieldName: value.fieldName,
                                identifier: field.identifier,
                                identifierName: field.identifierName
                              })
                            }
                          />
                        )
                      }
                    })
                  : null}
              </MenuItem>
            )
          }
        })}
      </Menu>
    ) : undefined

  return (
    <Layout.Horizontal
      spacing="small"
      style={{
        alignItems: 'center'
      }}
    >
      <Text font="small" color="grey400">
        {getString('ce.perspectives.createPerspective.preview.groupBy')}
      </Text>
      <Popover
        disabled={fetching}
        position={Position.BOTTOM_LEFT}
        modifiers={{
          arrow: { enabled: false },
          flip: { enabled: true },
          keepTogether: { enabled: true },
          preventOverflow: { enabled: true }
        }}
        content={PopoverContent}
      >
        <Container background="grey100" className={cx(css.groupBySelect, { [css.groupBySelectLoading]: fetching })}>
          {fetching ? (
            <Icon name="spinner" />
          ) : (
            <Text font="small" background="grey100" rightIcon="chevron-down">
              {groupBy.fieldName}
            </Text>
          )}
        </Container>
      </Popover>
      <FlexExpander />
      <Container>{/* <Text font="small">Aggregation</Text> */}</Container>
      <Icon
        name="timeline-bar-chart"
        size={18}
        onClick={() => {
          setChartType(ViewChartType.StackedTimeSeries)
        }}
        color={chartType === ViewChartType.StackedTimeSeries ? 'primary6' : 'grey500'}
      />
      <Icon
        name="timeline-area-chart"
        size={20}
        onClick={() => {
          setChartType(ViewChartType.StackedLineChart)
        }}
        color={chartType === ViewChartType.StackedLineChart ? 'primary6' : 'grey500'}
      />
    </Layout.Horizontal>
  )
}

interface PerspectiveBuilderPreviewProps {
  groupBy: QlceViewFieldInputInput
  setGroupBy: (groupBy: QlceViewFieldInputInput) => void
  chartType: ViewChartType
  setChartType: (type: ViewChartType) => void
}

const PerspectiveBuilderPreview: React.FC<PerspectiveBuilderPreviewProps> = ({
  groupBy,
  setGroupBy,
  chartType,
  setChartType
}) => {
  const { getString } = useStrings()
  return (
    <Container padding="xxlarge" background="white">
      <Text color="grey900">{getString('ce.perspectives.createPerspective.preview.title')}</Text>
      <GroupByView setGroupBy={setGroupBy} groupBy={groupBy} chartType={chartType} setChartType={setChartType} />
    </Container>
  )
}

export default PerspectiveBuilderPreview
