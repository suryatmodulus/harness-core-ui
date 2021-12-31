import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import * as cdngServices from 'services/cd-ng'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import ResourceCardList from '../ResourceCardList'
import { smtpConfig } from './mocks/mockData'

jest.spyOn(cdngServices, 'useGetSmtpConfig').mockImplementation(() => ({ mutate: () => smtpConfig } as any))
jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
  NG_TEMPLATES: true
})

describe('Resource card list test', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper>
        <ResourceCardList />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('test smtp card on click', async () => {
    const renderObj = render(
      <TestWrapper>
        <ResourceCardList />
      </TestWrapper>
    )
    const smptpCard = renderObj.queryByText('common.smtp.conifg')
    if (!smptpCard) {
      throw Error('no smtp card')
    }
    fireEvent.click(smptpCard)
    expect(findDialogContainer()).toBeTruthy()
  })
})
