import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import * as cdServices from 'services/cd-ng'
import { CustomHealthSource } from '../CustomHealthSource'
import { sourceData } from './CustomHealthSource.mock'

jest.mock('@common/components/NameIdDescriptionTags/NameIdDescriptionTags', () => ({
  ...(jest.requireActual('@common/components/NameIdDescriptionTags/NameIdDescriptionTags') as any),
  NameId: function Mock() {
    return <div className="mockNameId" />
  }
}))
describe('Verify CustomHealthSource', () => {
  beforeAll(() => {
    const getSampleData = jest.fn()
    jest
      .spyOn(cvServices, 'useFetchSampleData')
      .mockImplementation(() => ({ loading: false, error: null, mutate: getSampleData } as any))
    jest
      .spyOn(cvServices, 'useFetchParsedSampleData')
      .mockImplementation(() => ({ loading: false, error: null, mutate: jest.fn() } as any))
    jest
      .spyOn(cdServices, 'useGetConnector')
      .mockImplementation(() => ({ loading: false, error: null, data: {} } as any))
    jest
      .spyOn(cvServices, 'useGetLabelNames')
      .mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: getSampleData } as any))
    jest
      .spyOn(cvServices, 'useGetMetricPacks')
      .mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: getSampleData } as any))
  })

  test('should render CustomHealthSource', () => {
    const onSubmit = jest.fn()
    const { container } = render(
      <TestWrapper>
        <CustomHealthSource data={sourceData} onSubmit={onSubmit} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
