import React from 'react'
import { render } from '@testing-library/react'

import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import TemplatesList from '../TemplatesList'

const TEST_PATH = routes.toTemplatesListing({ ...accountPathProps, ...orgPathProps })

describe('<TemplatesList /> tests', () => {
  test('snapshot test', async () => {
    const { container } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg'
          //projectIdentifier: 'test',
          //pipelineIdentifier: 'testPip',
          //module: 'ci'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <TemplatesList />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
