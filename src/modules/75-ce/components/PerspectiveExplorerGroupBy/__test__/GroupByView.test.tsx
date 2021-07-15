import React from 'react'
import { render } from '@testing-library/react'
import type { QlceViewFieldIdentifierData } from 'services/ce/services'
import { GroupByDropDown, LabelDropDown } from '../GroupByView'

const ClusterData = {
  identifier: 'CLUSTER',
  identifierName: 'Cluster',
  values: [
    {
      fieldId: 'clusterName',
      fieldName: 'Cluster Name',
      identifier: null,
      identifierName: null,
      __typename: 'QLCEViewField'
    },
    {
      fieldId: 'namespace',
      fieldName: 'Namespace',
      identifier: null,
      identifierName: null,
      __typename: 'QLCEViewField'
    },
    {
      fieldId: 'namespace',
      fieldName: 'Namespace Id',
      identifier: null,
      identifierName: null,
      __typename: 'QLCEViewField'
    },
    {
      fieldId: 'workloadName',
      fieldName: 'Workload',
      identifier: null,
      identifierName: null,
      __typename: 'QLCEViewField'
    },
    {
      fieldId: 'workloadName',
      fieldName: 'Workload Id',
      identifier: null,
      identifierName: null,
      __typename: 'QLCEViewField'
    }
  ],
  __typename: 'QLCEViewFieldIdentifierData'
}

describe('test cases for groupby views', () => {
  test('should be able to render group by view popover', async () => {
    const { container } = render(
      <GroupByDropDown setGroupBy={jest.fn()} data={ClusterData as QlceViewFieldIdentifierData} />
    )

    expect(container).toMatchSnapshot()
  })

  test('should be able to render label view popover', async () => {
    const { container } = render(
      <LabelDropDown setGroupBy={jest.fn()} data={['value1', 'value2', 'value3', 'value4', 'value5', 'value6']} />
    )

    expect(container).toMatchSnapshot()
  })
})
