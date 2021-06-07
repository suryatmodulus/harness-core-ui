import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ModuleName } from 'framework/types/ModuleName'
import ModuleListCard from '../ModuleListCard'

const moduleList: ModuleName[] = [ModuleName.CD, ModuleName.CV, ModuleName.CE, ModuleName.CF, ModuleName.CI]

describe('Project Details', () => {
  test('render', async () => {
    moduleList.map(value => {
      const { container } = render(
        <TestWrapper
          path="/account/:accountId/org/:orgIdentifier/project/:projectIdentifier"
          pathParams={{ accountId: 'testAcc', orgIdentifier: 'Cisco_Meraki', projectIdentifier: 'Portal' }}
        >
          <ModuleListCard projectIdentifier="Portal" orgIdentifier="Cisco_Meraki" module={value} accountId="testAcc" />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
  })
})
