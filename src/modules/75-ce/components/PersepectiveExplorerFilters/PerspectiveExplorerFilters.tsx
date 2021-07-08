import React from 'react'
import { Container, Layout, Text, Button } from '@wings-software/uicore'
import { Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import { QlceViewTimeGroupType } from 'services/ce/services'
import PerspectiveTimeRangePicker from '@ce/components/PerspectiveTimeRangePicker/PerspectiveTimeRangePicker'
import { useStrings, UseStringsReturn } from 'framework/strings'

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

const TimeGranularityDropDown: React.FC<TimeGranularityDropDownProps> = ({ aggregation, setAggregation }) => {
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
            onClick={() => {
              setAggregation(QlceViewTimeGroupType.Day)
            }}
            text={aggregationTextMap[QlceViewTimeGroupType.Day]}
          />
          <MenuItem
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
}

const PersepectiveExplorerFilters: React.FC<PersepectiveExplorerFiltersProps> = ({
  aggregation,
  setAggregation,
  setTimeRange
}) => {
  return (
    <Container background="white" padding="small">
      <Layout.Horizontal
        spacing="small"
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}
      >
        <PerspectiveTimeRangePicker setTimeRange={setTimeRange} />
        <Text color="primary7">|</Text>
        <TimeGranularityDropDown aggregation={aggregation} setAggregation={setAggregation} />
      </Layout.Horizontal>
    </Container>
  )
}

export default PersepectiveExplorerFilters
