import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { useParams } from 'react-router-dom'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import * as useFeatures from '@common/hooks/useFeatures'
import { FeatureRestrictionBanners } from '../FeatureRestrictionBannersFactory'
import {
  ZERO_VALUE_MAX_BUILDS_PER_MONTH,
  SOME_VALUE_MAX_BUILDS_PER_MONTH,
  MET_VALUE_MAX_BUILDS_PER_MONTH,
  SOME_VALUE_MAX_TOTAL_BUILDS,
  EXCEEDED_VALUE_MAX_TOTAL_BUILDS,
  SOME_VALUE_ACTIVE_COMMITERS,
  MET_VALUE_ACTIVE_COMMITERS,
  NOT_ENABLED_ACTIVE_COMMITTERS,
  NOT_ENABLED_MAX_TOTAL_BUILDS,
  NOT_ENABLED_MAX_BUILDS_PER_MONTH
} from './mockdata'
// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({ useParams: jest.fn(), useHistory: jest.fn() }))

const moduleName = 'ci'
;(useParams as jest.Mock).mockReturnValue({ module: moduleName })

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

describe('CI: Render feature restriction banner', () => {
  describe('Free Account', () => {
    test('Show warning banner when 100/100 usage of free monthly builds', () => {
      const featuresMap = new Map()
      featuresMap.set('MAX_BUILDS_PER_MONTH', MET_VALUE_MAX_BUILDS_PER_MONTH)
      featuresMap.set('MAX_TOTAL_BUILDS', EXCEEDED_VALUE_MAX_TOTAL_BUILDS)
      featuresMap.set('ACTIVE_COMMITTERS', NOT_ENABLED_ACTIVE_COMMITTERS)

      jest.spyOn(useFeatures, 'useFeatures').mockReturnValue({ features: featuresMap } as any)

      const { container } = render(
        <FeatureRestrictionBanners
          featureNames={[
            FeatureIdentifier.ACTIVE_COMMITTERS,
            FeatureIdentifier.MAX_BUILDS_PER_MONTH,
            FeatureIdentifier.MAX_TOTAL_BUILDS
          ]}
          module="ci"
        />
      )

      expect(container).toMatchSnapshot()
    })

    test('Show warning banner when 0/100 monthly builds usage', () => {
      const featuresMap = new Map()
      featuresMap.set('MAX_BUILDS_PER_MONTH', SOME_VALUE_MAX_BUILDS_PER_MONTH)
      featuresMap.set('MAX_TOTAL_BUILDS', EXCEEDED_VALUE_MAX_TOTAL_BUILDS)
      featuresMap.set('ACTIVE_COMMITTERS', NOT_ENABLED_ACTIVE_COMMITTERS)

      jest.spyOn(useFeatures, 'useFeatures').mockReturnValue({ features: featuresMap } as any)

      const { queryByText } = render(
        <FeatureRestrictionBanners
          featureNames={[
            FeatureIdentifier.ACTIVE_COMMITTERS,
            FeatureIdentifier.MAX_BUILDS_PER_MONTH,
            FeatureIdentifier.MAX_TOTAL_BUILDS
          ]}
          module="ci"
        />
      )

      expect(queryByText('pipeline.featureRestriction.numMonthlyBuilds')).toBeInTheDocument()
    })

    test('Dismiss banner hides banner', () => {
      const featuresMap = new Map()
      featuresMap.set('MAX_BUILDS_PER_MONTH', SOME_VALUE_MAX_BUILDS_PER_MONTH)
      featuresMap.set('MAX_TOTAL_BUILDS', EXCEEDED_VALUE_MAX_TOTAL_BUILDS)
      featuresMap.set('ACTIVE_COMMITTERS', NOT_ENABLED_ACTIVE_COMMITTERS)

      jest.spyOn(useFeatures, 'useFeatures').mockReturnValue({ features: featuresMap } as any)

      const { container, queryByText } = render(
        <FeatureRestrictionBanners
          featureNames={[
            FeatureIdentifier.ACTIVE_COMMITTERS,
            FeatureIdentifier.MAX_BUILDS_PER_MONTH,
            FeatureIdentifier.MAX_TOTAL_BUILDS
          ]}
          module="ci"
        />
      )

      expect(queryByText('pipeline.featureRestriction.numMonthlyBuilds')).toBeInTheDocument()

      const closeButton = container.querySelector('[data-icon="cross"]')
      if (!closeButton) {
        throw Error('Cannot find close button')
      }
      fireEvent.click(closeButton)
      expect(queryByText('pipeline.featureRestriction.numMonthlyBuilds')).not.toBeInTheDocument()
    })

    test('Show warning banner when 90% usage of free total builds', () => {
      const featuresMap = new Map()
      featuresMap.set('MAX_BUILDS_PER_MONTH', ZERO_VALUE_MAX_BUILDS_PER_MONTH)
      featuresMap.set('MAX_TOTAL_BUILDS', SOME_VALUE_MAX_TOTAL_BUILDS)
      //   featuresMap.set('ACTIVE_COMMITTERS', NOT_ENABLED_ACTIVE_COMMITTERS)

      jest.spyOn(useFeatures, 'useFeatures').mockReturnValue({ features: featuresMap } as any)

      const { container } = render(
        <FeatureRestrictionBanners
          featureNames={[
            FeatureIdentifier.ACTIVE_COMMITTERS,
            FeatureIdentifier.MAX_BUILDS_PER_MONTH,
            FeatureIdentifier.MAX_TOTAL_BUILDS
          ]}
          module="ci"
        />
      )

      expect(container).toMatchSnapshot()
    })

    test('Do not show any banner by default', () => {
      const featuresMap = new Map()
      featuresMap.set('MAX_BUILDS_PER_MONTH', NOT_ENABLED_MAX_BUILDS_PER_MONTH)
      featuresMap.set('MAX_TOTAL_BUILDS', NOT_ENABLED_MAX_TOTAL_BUILDS)
      featuresMap.set('ACTIVE_COMMITTERS', NOT_ENABLED_ACTIVE_COMMITTERS)
      jest.spyOn(useFeatures, 'useFeatures').mockReturnValue({ features: featuresMap } as any)

      const { container } = render(
        <FeatureRestrictionBanners
          featureNames={[
            FeatureIdentifier.ACTIVE_COMMITTERS,
            FeatureIdentifier.MAX_BUILDS_PER_MONTH,
            FeatureIdentifier.MAX_TOTAL_BUILDS
          ]}
          module="ci"
        />
      )

      expect(container).toMatchSnapshot()
    })
  })

  describe('Team/Enterprise Account', () => {
    test('Show warning banner when 90% usage of monthly subscription', () => {
      const featuresMap = new Map()
      featuresMap.set('MAX_BUILDS_PER_MONTH', NOT_ENABLED_MAX_BUILDS_PER_MONTH)
      featuresMap.set('MAX_TOTAL_BUILDS', NOT_ENABLED_MAX_TOTAL_BUILDS)
      featuresMap.set('ACTIVE_COMMITTERS', SOME_VALUE_ACTIVE_COMMITERS)

      jest.spyOn(useFeatures, 'useFeatures').mockReturnValue({ features: featuresMap } as any)

      const { queryByText } = render(
        <FeatureRestrictionBanners
          featureNames={[
            FeatureIdentifier.ACTIVE_COMMITTERS,
            FeatureIdentifier.MAX_BUILDS_PER_MONTH,
            FeatureIdentifier.MAX_TOTAL_BUILDS
          ]}
          module="ci"
        />
      )
      expect(queryByText('pipeline.featureRestriction.subscription90PercentLimit')).toBeInTheDocument()
    })

    test('Show warning banner when 100% usage of monthly subscription', () => {
      const featuresMap = new Map()
      featuresMap.set('MAX_BUILDS_PER_MONTH', NOT_ENABLED_MAX_BUILDS_PER_MONTH)
      featuresMap.set('MAX_TOTAL_BUILDS', NOT_ENABLED_MAX_TOTAL_BUILDS)
      featuresMap.set('ACTIVE_COMMITTERS', MET_VALUE_ACTIVE_COMMITERS)

      jest.spyOn(useFeatures, 'useFeatures').mockReturnValue({ features: featuresMap } as any)

      const { queryByText } = render(
        <FeatureRestrictionBanners
          featureNames={[
            FeatureIdentifier.ACTIVE_COMMITTERS,
            FeatureIdentifier.MAX_BUILDS_PER_MONTH,
            FeatureIdentifier.MAX_TOTAL_BUILDS
          ]}
          module="ci"
        />
      )
      expect(queryByText('pipeline.featureRestriction.subscriptionExceededLimit')).toBeInTheDocument()
    })
  })
})
