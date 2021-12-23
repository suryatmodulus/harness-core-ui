import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { Experiences } from '@common/constants/Utils'
import { useUpdateLSDefaultExperience } from '../useUpdateLSDefaultExperience'

const updateLSDefaultExperienceMock = jest.fn()
jest.mock('@common/hooks/useUpdateLSDefaultExperience', () => {
  return {
    useUpdateLSDefaultExperience: () => {
      return { updateLSDefaultExperience: updateLSDefaultExperienceMock }
    }
  }
})
describe('useUpdateLSDefaultExperience', () => {
  test('useUpdateLSDefaultExperience', () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper pathParams={{ accountId: '123' }}>{children}</TestWrapper>
    )
    const { result } = renderHook(() => useUpdateLSDefaultExperience(Experiences.CG), { wrapper })
    result.current.updateLSDefaultExperience()
    expect(updateLSDefaultExperienceMock).toHaveBeenCalled()
  })
})
