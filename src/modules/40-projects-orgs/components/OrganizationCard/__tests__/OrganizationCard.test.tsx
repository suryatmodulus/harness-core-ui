import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { OrganizationAggregateDTO } from 'services/cd-ng'
import { OrganizationCard } from '@projects-orgs/components/OrganizationCard/OrganizationCard'

const organization: OrganizationAggregateDTO = {
  organizationResponse: {
    organization: {
      identifier: 'bfvbfkbvf',
      name: 'bfvbfkbvf',
      description: 'ddsadsad',
      tags: { ce: 'module', prod: '', cv: 'module', ci: 'module', strin: '' }
    },
    createdAt: 1607450298192,
    lastModifiedAt: 1607450298192
  },
  projectsCount: 2,
  admins: [{ name: 'Admin', email: 'admin@harness.io', uuid: 'lv0euRhKRCyiXWzS7pOg6g' }],
  collaborators: [{ name: 'Admin2', email: 'admin2@harness.io', uuid: 'lv0efduRhKRCyiXWzS7pOg6g' }]
}

describe('Organization Card test', () => {
  test('initializes ok ', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'testAcc' }}>
        <OrganizationCard data={organization} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
