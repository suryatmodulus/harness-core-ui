import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { IconName } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import type { Module } from '@common/interfaces/RouteInterfaces'
import ModuleInfoCards from '../ModuleInfoCards'

describe('ModuleInfoCards Test', () => {
  describe('Rendering', () => {
    test('that the module info cards render', () => {
      const props = {
        module: 'ce' as Module,
        setSelectedInfoCard: jest.fn(),
        selectedInfoCard: undefined
      }

      const { container, getByText } = render(
        <TestWrapper>
          <ModuleInfoCards {...props} />
        </TestWrapper>
      )
      expect(getByText('common.purpose.infoCardIntent')).toBeDefined()
      expect(container).toMatchSnapshot()
    })

    test('that the module info cards get selected', () => {
      const props = {
        module: 'ce' as Module,
        setSelectedInfoCard: jest.fn(),
        selectedInfoCard: {
          icon: 'ce-visibility' as IconName,
          title: 'common.ce.cost',
          subtitle: 'common.ce.visibility',
          description: 'common.purpose.ce.visibilityCard.description',
          route: () => '/continuous-efficiency/settings'
        }
      }

      const { container, getByText } = render(
        <TestWrapper>
          <ModuleInfoCards {...props} />
        </TestWrapper>
      )
      expect(getByText('common.purpose.infoCardIntent')).toBeDefined()

      expect(container).toMatchSnapshot()
    })

    test('that the set selected info card callback is called', async () => {
      const setSelectedInfoCardMock = jest.fn()

      const props = {
        module: 'ce' as Module,
        setSelectedInfoCard: setSelectedInfoCardMock,
        selectedInfoCard: {
          icon: 'ce-visibility' as IconName,
          title: 'common.ce.cost',
          subtitle: 'common.ce.visibility',
          description: 'common.purpose.ce.visibilityCard.description',
          route: () => '/continuous-efficiency/settings'
        }
      }

      const { getByText } = render(
        <TestWrapper>
          <ModuleInfoCards {...props} />
        </TestWrapper>
      )
      expect(getByText('common.purpose.infoCardIntent')).toBeDefined()

      fireEvent.click(getByText('common.ce.visibility'))

      await waitFor(() => expect(setSelectedInfoCardMock).toHaveBeenCalled())
    })

    test('that nothing is rendered', () => {
      const props = {
        module: 'cf' as Module,
        setSelectedInfoCard: jest.fn(),
        selectedInfoCard: {
          icon: 'ce-visibility' as IconName,
          title: 'common.ce.cost',
          subtitle: 'common.ce.visibility',
          description: 'common.purpose.ce.visibilityCard.description',
          route: () => '/continuous-efficiency/settings'
        }
      }

      const { container } = render(
        <TestWrapper>
          <ModuleInfoCards {...props} />
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()
    })

    test('should render footer when it is cd module', () => {
      const props = {
        module: 'cd' as Module,
        setSelectedInfoCard: jest.fn(),
        selectedInfoCard: {
          icon: 'cd-main' as IconName,
          title: 'common.purpose.cd.newGen.title',
          description: 'common.purpose.cd.newGen.description'
        }
      }

      const { container, getAllByText } = render(
        <TestWrapper>
          <ModuleInfoCards {...props} />
        </TestWrapper>
      )
      expect(getAllByText('common.purpose.cd.supportedStack')).toBeDefined()
      expect(container).toMatchSnapshot()
    })
  })
})
