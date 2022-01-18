import React, { useState } from 'react'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Container,
  DropDown,
  FlexExpander,
  Layout,
  PageBody,
  PageHeader,
  TextInput,
  Text,
  Icon,
  TableV2,
  Color
} from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

import PerspectiveTimeRangePicker from '@ce/components/PerspectiveTimeRangePicker/PerspectiveTimeRangePicker'
// import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'
import { CE_DATE_FORMAT_INTERNAL, DATE_RANGE_SHORTCUTS } from '@ce/utils/momentUtils'
import css from './AnomaliesOverviewPage.module.scss'

export interface TimeRange {
  to: string
  from: string
}

const AnomalyFilters: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>({
    to: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[1].format(CE_DATE_FORMAT_INTERNAL),
    from: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[0].format(CE_DATE_FORMAT_INTERNAL)
  })

  return (
    <Layout.Horizontal spacing="large" className={css.header}>
      <Layout.Horizontal spacing="large" style={{ alignItems: 'center' }}>
        <DropDown
          placeholder={'GroupBy: Perspectives'}
          filterable={false}
          onChange={option => {
            alert(option.value)
          }}
          className={css.groupbyFilter}
          items={[
            {
              label: 'GroupBy: Perspectives',
              value: 'perspectives'
            },
            {
              label: 'GroupBy: None (Show all anomalies)',
              value: 'none'
            }
          ]}
        />
      </Layout.Horizontal>
      <FlexExpander />
      {/* TODO: Mutiselect DropDown */}
      <DropDown
        placeholder={'All Perspectives'}
        filterable={false}
        onChange={option => {
          alert(option.value)
        }}
        items={[
          {
            label: 'All Perspectives',
            value: 'all'
          }
        ]}
      />
      <DropDown
        placeholder={'All Cloud Providers'}
        filterable={false}
        onChange={option => {
          alert(option.value)
        }}
        items={[
          {
            label: 'All Cloud Providers',
            value: 'all'
          }
        ]}
      />
      <Icon name="ng-filter" size={24} color="primary7" />
      {/* <FilterSelector<FilterDTO>
				appliedFilter={appliedFilter}
				filters={filters}
				onFilterBtnClick={openFilterDrawer}
				onFilterSelect={handleFilterSelection}
				fieldToLabelMapping={fieldToLabelMapping}
				filterWithValidFields={removeNullAndEmpty(
					pick(flattenObject(appliedFilter?.filterProperties || {}), ...fieldToLabelMapping.keys())
				)}
			/> */}
      <Text border={{ right: true, color: 'grey300' }} />
      <PerspectiveTimeRangePicker timeRange={timeRange} setTimeRange={setTimeRange} />
    </Layout.Horizontal>
  )
}

interface searchProps {
  searchText: string
  onChange: React.Dispatch<React.SetStateAction<string>>
}

const AnomaliesSearch: React.FC<searchProps> = ({ searchText, onChange }) => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal>
      {/* TODO: Need to add search icon in searchBox */}
      <TextInput
        value={searchText}
        onChange={(e: any) => {
          onChange(e.target.value)
        }}
        wrapperClassName={css.searchInput}
        placeholder={getString('search')}
      />
      <Button
        text={getString('ce.anomalyDetection.settingsBtn')}
        icon="nav-settings"
        variation={ButtonVariation.SECONDARY}
        size={ButtonSize.MEDIUM}
      />
    </Layout.Horizontal>
  )
}

const AnomaliesOverview: React.FC = () => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal spacing="medium">
      <Layout.Vertical spacing="small">
        <Container padding="medium" background={Color.GREY_100} border={{ color: Color.GREY_100, radius: 4 }}>
          <Text color={Color.GREY_600} font={{ weight: 'semi-bold', size: 'small' }}>
            {getString('ce.anomalyDetection.summary.totalCountText')}
          </Text>
          <Text font={{ size: 'medium', weight: 'bold' }} intent="danger">
            102
          </Text>
        </Container>
        <Container
          padding="medium"
          background={Color.RED_100}
          border={{ color: Color.RED_100, radius: 4 }}
          intent="danger"
        >
          <Text color={Color.RED_500} font={{ weight: 'semi-bold', size: 'small' }}>
            {getString('ce.anomalyDetection.summary.costImpacted')}
          </Text>
          <Text font={{ size: 'medium', weight: 'bold' }} intent="danger">
            $17586.99
          </Text>
          <p></p>
        </Container>
      </Layout.Vertical>
      <div className={css.summaryCharts}>
        <Text color={Color.GREY_500} font={{ weight: 'semi-bold', size: 'small' }}>
          {getString('ce.anomalyDetection.summary.perspectiveWise').toUpperCase()}
        </Text>
      </div>
      <div className={css.summaryCharts}>
        <Text color={Color.GREY_500} font={{ weight: 'semi-bold', size: 'small' }}>
          {getString('ce.anomalyDetection.summary.cloudProvidersWise')}
        </Text>
      </div>
      <div className={css.summaryCharts}>
        <Text color={Color.GREY_500} font={{ weight: 'semi-bold', size: 'small' }}>
          {getString('ce.anomalyDetection.summary.statusWise')}
        </Text>
      </div>
    </Layout.Horizontal>
  )
}

const AnomaliesListGridView: React.FC = () => {
  return (
    <TableV2
      className={css.tableView}
      columns={[
        {
          Header: 'PERSPECTIVE',
          accessor: 'name',
          id: 'name',
          width: '25%'
        },
        {
          Header: 'ANOMALOUS SPEND',
          accessor: 'age',
          id: 'age',
          width: '25%'
        },
        {
          Header: 'TOP ANOMALY BY SPEND',
          accessor: 'col3',
          id: 'col3',
          width: '25%'
        },
        {
          Header: 'ALERTS GO TO',
          accessor: 'col4',
          id: 'col4',
          width: '25%'
        }
      ]}
      data={[
        {
          age: 20,
          name: 'User 1',
          col3: 'aws',
          col4: 'jyoti.arora@harness.io'
        },
        {
          age: 25,
          name: 'User 2',
          col3: 'aws',
          col4: 'jyoti.arora@harness.io'
        },
        {
          age: 25,
          name: 'User 3',
          col3: 'aws',
          col4: 'jyoti.arora@harness.io'
        },
        {
          age: 25,
          name: 'User 4',
          col3: 'aws',
          col4: 'jyoti.arora@harness.io'
        }
      ]}
      pagination={{
        itemCount: 100,
        pageCount: 10,
        pageIndex: 0,
        pageSize: 10
      }}
      sortable
    />
  )
}

const AnomaliesOverviewPage: React.FC = () => {
  const { getString } = useStrings()
  const [searchText, setSearchText] = React.useState('')

  return (
    <>
      <PageHeader title={getString('ce.anomalyDetection.sideNavText')} />
      <AnomalyFilters />
      <PageBody>
        {/* TODO: Add page spinner */}
        <Container
          padding={{
            right: 'xxxlarge',
            left: 'xxxlarge',
            bottom: 'medium',
            top: 'medium'
          }}
        >
          <AnomaliesSearch searchText={searchText} onChange={setSearchText} />
          <AnomaliesOverview />
          <AnomaliesListGridView />
        </Container>
      </PageBody>
    </>
  )
}

export default AnomaliesOverviewPage
