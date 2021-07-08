import React from 'react'
import { Container, Text, Button, Icon } from '@wings-software/uicore'
import { Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import { QlceViewTimeGroupType, QlceViewFilterInput } from 'services/ce/services'
import PerspectiveTimeRangePicker from '@ce/components/PerspectiveTimeRangePicker/PerspectiveTimeRangePicker'
import { useStrings, UseStringsReturn } from 'framework/strings'
import ExplorerFilters from './ExplorerFilters'
import css from './PerspectiveExplorerFilters.module.scss'

const getAggregationText: (getString: UseStringsReturn['getString']) => Record<string, string> = getString => {
  return {
    [QlceViewTimeGroupType.Day]: getString('ce.perspectives.timeAggregation.daily'),
    [QlceViewTimeGroupType.Month]: getString('ce.perspectives.timeAggregation.monthly')
  }
}

interface TimeGranularityDropDownProps {
  aggregation: QlceViewTimeGroupType
  setAggregation: React.Dispatch<React.SetStateAction<QlceViewTimeGroupType>>
}

export const TimeGranularityDropDown: React.FC<TimeGranularityDropDownProps> = ({ aggregation, setAggregation }) => {
  const { getString } = useStrings()
  const aggregationTextMap = getAggregationText(getString)
  return (
    <Popover
      position={Position.BOTTOM_LEFT}
      modifiers={{
        arrow: { enabled: false },
        flip: { enabled: true },
        keepTogether: { enabled: true },
        preventOverflow: { enabled: true }
      }}
      content={
        <Menu>
          <MenuItem
            active={aggregation === QlceViewTimeGroupType.Day}
            className={css.aggregationMenuItems}
            onClick={() => {
              setAggregation(QlceViewTimeGroupType.Day)
            }}
            text={aggregationTextMap[QlceViewTimeGroupType.Day]}
          />
          <MenuItem
            active={aggregation === QlceViewTimeGroupType.Month}
            className={css.aggregationMenuItems}
            onClick={() => {
              setAggregation(QlceViewTimeGroupType.Month)
            }}
            text={aggregationTextMap[QlceViewTimeGroupType.Month]}
          />
        </Menu>
      }
    >
      <Button
        intent="primary"
        minimal
        className={css.timeGranularityButton}
        text={aggregationTextMap[aggregation]}
        iconProps={{
          size: 16
        }}
        rightIcon="caret-down"
      />
    </Popover>
  )
}

interface PersepectiveExplorerFiltersProps {
  aggregation: QlceViewTimeGroupType
  setAggregation: React.Dispatch<React.SetStateAction<QlceViewTimeGroupType>>
  setTimeRange: React.Dispatch<
    React.SetStateAction<{
      to: number
      from: number
    }>
  >
  setFilters: React.Dispatch<React.SetStateAction<QlceViewFilterInput[]>>
  filters: QlceViewFilterInput[]
}

const PersepectiveExplorerFilters: React.FC<PersepectiveExplorerFiltersProps> = ({
  aggregation,
  setAggregation,
  setTimeRange,
  setFilters,
  filters
}) => {
  return (
    <Container background="white" padding="small">
      <Container className={css.mainContainer}>
        <Icon name="ng-filter" size={20} />
        <ExplorerFilters filters={filters} setFilters={setFilters} />
        <PerspectiveTimeRangePicker setTimeRange={setTimeRange} />
        <Text color="primary7">|</Text>
        <TimeGranularityDropDown aggregation={aggregation} setAggregation={setAggregation} />
      </Container>
    </Container>
  )
}

export default PersepectiveExplorerFilters
