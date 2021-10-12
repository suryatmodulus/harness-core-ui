import React from 'react'
import { render, waitFor } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import ActivityDashboardPage from '../ActivityDashBoardPage'
import { aggregateActivityByType } from '../ActivityDashboardPageUtils'

const MockResponse = {
  metaData: {},
  resource: [
    {
      activityType: 'INFRASTRUCTURE',
      activityId: '1',
      activityName: 'Infrastructure Failover',
      activityStartTime: 1608258600000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'VERIFICATION_PASSED',
      activityVerificationSummary: {
        total: 1,
        passed: 1,
        failed: 0,
        errors: 0,
        progress: 0,
        notStarted: 0,
        remainingTimeMs: 0,
        progressPercentage: 100,
        startTime: 1608257700000,
        durationMs: 900000,
        riskScore: 0.023056990846069485,
        aggregatedStatus: 'VERIFICATION_PASSED'
      }
    },
    {
      activityType: 'OTHER',
      activityId: '2',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608256560000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'VERIFICATION_PASSED',
      activityVerificationSummary: {
        total: 1,
        passed: 1,
        failed: 0,
        errors: 0,
        progress: 0,
        notStarted: 0,
        remainingTimeMs: 0,
        progressPercentage: 100,
        startTime: 1608255900000,
        durationMs: 600000,
        riskScore: 0.0,
        aggregatedStatus: 'VERIFICATION_PASSED'
      }
    },
    {
      activityType: 'OTHER',
      activityId: '3',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608256560000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '4',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608259740000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'VERIFICATION_PASSED',
      activityVerificationSummary: {
        total: 1,
        passed: 1,
        failed: 0,
        errors: 0,
        progress: 0,
        notStarted: 0,
        remainingTimeMs: 0,
        progressPercentage: 100,
        startTime: 1608258900000,
        durationMs: 600000,
        riskScore: 0.056783056739160606,
        aggregatedStatus: 'VERIFICATION_PASSED'
      }
    },
    {
      activityType: 'OTHER',
      activityId: '5',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608259740000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '6',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608259800000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'VERIFICATION_PASSED',
      activityVerificationSummary: {
        total: 1,
        passed: 1,
        failed: 0,
        errors: 0,
        progress: 0,
        notStarted: 0,
        remainingTimeMs: 0,
        progressPercentage: 100,
        startTime: 1608259200000,
        durationMs: 600000,
        riskScore: 0.05783438328521656,
        aggregatedStatus: 'VERIFICATION_PASSED'
      }
    },
    {
      activityType: 'OTHER',
      activityId: '7',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608259800000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '8',
      activityName: '3 Normal kubernetes events',
      activityStartTime: 1608259920000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '9',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608260100000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'VERIFICATION_PASSED',
      activityVerificationSummary: {
        total: 1,
        passed: 1,
        failed: 0,
        errors: 0,
        progress: 0,
        notStarted: 0,
        remainingTimeMs: 0,
        progressPercentage: 100,
        startTime: 1608259500000,
        durationMs: 600000,
        riskScore: 0.05320143825990746,
        aggregatedStatus: 'VERIFICATION_PASSED'
      }
    },
    {
      activityType: 'OTHER',
      activityId: '10',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608257940000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '11',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608257940000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '12',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608258000000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '13',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608258000000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '14',
      activityName: '3 Normal kubernetes events',
      activityStartTime: 1608258120000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '15',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608258240000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '16',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608258360000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '17',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608258360000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: '18',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608256560000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: '19',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608257940000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: '20',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608258360000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: '21',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608259740000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '22',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608169740000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: '23',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608169740000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '24',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608170160000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: '25',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608170160000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: '26',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608260160000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '27',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608260160000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '28',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608260160000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: '29',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608261180000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'VERIFICATION_PASSED',
      activityVerificationSummary: {
        total: 1,
        passed: 1,
        failed: 0,
        errors: 0,
        progress: 0,
        notStarted: 0,
        remainingTimeMs: 0,
        progressPercentage: 100,
        startTime: 1608260400000,
        durationMs: 600000,
        riskScore: 0.02252724777716169,
        aggregatedStatus: 'VERIFICATION_PASSED'
      }
    },
    {
      activityType: 'OTHER',
      activityId: '30',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608261180000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '31',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608261180000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '32',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608261240000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '33',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608261240000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '34',
      activityName: '3 Normal kubernetes events',
      activityStartTime: 1608261300000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'VERIFICATION_PASSED',
      activityVerificationSummary: {
        total: 1,
        passed: 1,
        failed: 0,
        errors: 0,
        progress: 0,
        notStarted: 0,
        remainingTimeMs: 0,
        progressPercentage: 100,
        startTime: 1608260700000,
        durationMs: 600000,
        riskScore: 0.02353248502737243,
        aggregatedStatus: 'VERIFICATION_PASSED'
      }
    },
    {
      activityType: 'OTHER',
      activityId: '35',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608261480000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '36',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608234180000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: '37',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608234180000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: '38',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608261540000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '39',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608261540000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '40',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608261540000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '41',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608261600000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'VERIFICATION_PASSED',
      activityVerificationSummary: {
        total: 1,
        passed: 1,
        failed: 0,
        errors: 0,
        progress: 0,
        notStarted: 0,
        remainingTimeMs: 0,
        progressPercentage: 100,
        startTime: 1608261000000,
        durationMs: 600000,
        riskScore: 0.02627106828355504,
        aggregatedStatus: 'VERIFICATION_PASSED'
      }
    },
    {
      activityType: 'OTHER',
      activityId: '42',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608261600000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '43',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608261660000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '44',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608261720000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: '45',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608261960000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'VERIFICATION_PASSED',
      activityVerificationSummary: {
        total: 1,
        passed: 1,
        failed: 0,
        errors: 0,
        progress: 0,
        notStarted: 0,
        remainingTimeMs: 0,
        progressPercentage: 100,
        startTime: 1608261300000,
        durationMs: 600000,
        riskScore: 0.02403543734185364,
        aggregatedStatus: 'VERIFICATION_PASSED'
      }
    },
    {
      activityType: 'OTHER',
      activityId: '46',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608261960000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '47',
      activityName: '2 Warning kubernetes events',
      activityStartTime: 1608261960000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '48',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608262020000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'VERIFICATION_PASSED',
      activityVerificationSummary: {
        total: 1,
        passed: 1,
        failed: 0,
        errors: 0,
        progress: 0,
        notStarted: 0,
        remainingTimeMs: 0,
        progressPercentage: 100,
        startTime: 1608261300000,
        durationMs: 600000,
        riskScore: 0.12610193300257203,
        aggregatedStatus: 'VERIFICATION_PASSED'
      }
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: '49',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608263340000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'VERIFICATION_PASSED',
      activityVerificationSummary: {
        total: 1,
        passed: 1,
        failed: 0,
        errors: 0,
        progress: 0,
        notStarted: 0,
        remainingTimeMs: 0,
        progressPercentage: 100,
        startTime: 1608262500000,
        durationMs: 600000,
        riskScore: 0.07880626145083156,
        aggregatedStatus: 'VERIFICATION_PASSED'
      }
    },
    {
      activityType: 'OTHER',
      activityId: '50',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608263340000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '51',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608263340000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '52',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608263400000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'VERIFICATION_PASSED',
      activityVerificationSummary: {
        total: 1,
        passed: 1,
        failed: 0,
        errors: 0,
        progress: 0,
        notStarted: 0,
        remainingTimeMs: 0,
        progressPercentage: 100,
        startTime: 1608262800000,
        durationMs: 600000,
        riskScore: 0.07880626145083156,
        aggregatedStatus: 'VERIFICATION_PASSED'
      }
    },
    {
      activityType: 'OTHER',
      activityId: '53',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608263400000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '54',
      activityName: '3 Normal kubernetes events',
      activityStartTime: 1608263460000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '55',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608263580000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: '56',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608263880000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'VERIFICATION_PASSED',
      activityVerificationSummary: {
        total: 1,
        passed: 1,
        failed: 0,
        errors: 0,
        progress: 0,
        notStarted: 0,
        remainingTimeMs: 0,
        progressPercentage: 100,
        startTime: 1608263100000,
        durationMs: 600000,
        riskScore: 0.08286854360151671,
        aggregatedStatus: 'VERIFICATION_PASSED'
      }
    },
    {
      activityType: 'OTHER',
      activityId: '57',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608263880000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '58',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608263880000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'IN_PROGRESS',
      activityVerificationSummary: {
        total: 1,
        passed: 0,
        failed: 0,
        errors: 0,
        progress: 1,
        notStarted: 0,
        remainingTimeMs: 900000,
        progressPercentage: 0,
        startTime: 1608263100000,
        durationMs: 600000,
        riskScore: -1.0,
        aggregatedStatus: 'IN_PROGRESS'
      }
    },
    {
      activityType: 'OTHER',
      activityId: '59',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608169140000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '60',
      activityName: '48 Normal kubernetes events',
      activityStartTime: 1608298020000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'VERIFICATION_PASSED',
      activityVerificationSummary: {
        total: 1,
        passed: 1,
        failed: 0,
        errors: 0,
        progress: 0,
        notStarted: 0,
        remainingTimeMs: 0,
        progressPercentage: 100,
        startTime: 1608297300000,
        durationMs: 600000,
        riskScore: 0.19560974853986654,
        aggregatedStatus: 'VERIFICATION_PASSED'
      }
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: '61',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608298080000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '62',
      activityName: '5 Normal kubernetes events',
      activityStartTime: 1608298080000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: '63',
      activityName: '5 Normal kubernetes events',
      activityStartTime: 1608298080000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '64',
      activityName: '6 Warning kubernetes events',
      activityStartTime: 1608298080000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '65',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608169080000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: '66',
      activityName: '5 Normal kubernetes events',
      activityStartTime: 1608298260000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: '67',
      activityName: '9 Normal kubernetes events',
      activityStartTime: 1608298260000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '68',
      activityName: '13 Normal kubernetes events',
      activityStartTime: 1608298260000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '69',
      activityName: '15 Warning kubernetes events',
      activityStartTime: 1608298260000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '70',
      activityName: '8 Normal kubernetes events',
      activityStartTime: 1608169500000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: 'FA9RWHqvRdmSICwIahptOA',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608169500000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'srTHWtq_T42ocZIXUS2Scg',
      activityName: '14 Warning kubernetes events',
      activityStartTime: 1608298320000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'E6v_HK_FQ5yYi1-OR6OFvA',
      activityName: '17 Normal kubernetes events',
      activityStartTime: 1608298320000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: 'BvLBeySpR7Ogac5WQPvWVw',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608298320000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: 'wy9KOgntQ3WOTHJ3Y20EeQ',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608298320000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'Hqo8sDiiS1-OurNwRf9OgQ',
      activityName: '6 Normal kubernetes events',
      activityStartTime: 1608298380000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'bC9PXKaCQj2jwB30Frbm_A',
      activityName: '3 Warning kubernetes events',
      activityStartTime: 1608298380000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'Aq2d7dl7R92On9kV78WYJg',
      activityName: '9 Normal kubernetes events',
      activityStartTime: 1608298440000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'vFBhITOkQACuv42nr4JvfQ',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608298440000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: 'CYKgIynwSYa13XQ24R62Pg',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608298440000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: '8p1WMF4JRXeXYcGYA0gzVA',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608298440000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'cRmOGUH_RdK8CKnW3uOOJg',
      activityName: '2 Warning kubernetes events',
      activityStartTime: 1608298500000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: 'X3neH0JkTwy_L8lzz3_zPA',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608298500000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'iOJF3gxTQiSu3cpav5XYbQ',
      activityName: '3 Normal kubernetes events',
      activityStartTime: 1608298500000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: 'mWlrhm01T-igkRbgyGhddQ',
      activityName: '3 Normal kubernetes events',
      activityStartTime: 1608298500000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: 'PTt_8hDtTMqlonf3GEGX8Q',
      activityName: '4 Normal kubernetes events',
      activityStartTime: 1608169680000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'XGhFOWO7Qu-xJyYE34euFA',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608298680000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'I7z6zhDpRgmY1IDzG61YTA',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608298740000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: 'JMfWM4I2QzCNNTtTexRMGA',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608312600000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'VERIFICATION_PASSED',
      activityVerificationSummary: {
        total: 1,
        passed: 1,
        failed: 0,
        errors: 0,
        progress: 0,
        notStarted: 0,
        remainingTimeMs: 0,
        progressPercentage: 100,
        startTime: 1608312000000,
        durationMs: 600000,
        riskScore: 0.035310950332179514,
        aggregatedStatus: 'VERIFICATION_PASSED'
      }
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: 'bvSPENCdTLuNe840ZA9rNg',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608312600000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '_efgpKFVSMS-sm6zv47Vdg',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608312600000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'Rrqui_AnRFal1aBJo_xK2w',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608312600000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'Manager',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: 'njugKgpSSJi5lz7VfjfPgw',
      activityName: '5 Normal kubernetes events',
      activityStartTime: 1608341100000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: 'wLk1HmCoSfiOQLqlOwgOeA',
      activityName: '9 Normal kubernetes events',
      activityStartTime: 1608341100000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '4DQrLxDLR8iRmjnOlzbJxQ',
      activityName: '22 Normal kubernetes events',
      activityStartTime: 1608341100000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '7MApEl7dTTSQKmj_WUVgXQ',
      activityName: '23 Warning kubernetes events',
      activityStartTime: 1608341100000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 't2OdKdgVTrmg8edoSBIv4Q',
      activityName: '8 Warning kubernetes events',
      activityStartTime: 1608341160000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'EFcmcKerRrieq0Tr9WPo8A',
      activityName: '6 Normal kubernetes events',
      activityStartTime: 1608341160000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: 'IZlFLkVMT0qGZCg4ub8wcw',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608341160000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: '6nL1KABUTFqge_TUU5Gslg',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608341160000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'lC8ezjlhQQ-vvwZeOixG1A',
      activityName: '11 Normal kubernetes events',
      activityStartTime: 1608341220000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'dBl8uR-aTrGF1TyRhqhrvA',
      activityName: '2 Warning kubernetes events',
      activityStartTime: 1608341220000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'uCPalwnrThKD7bU4bTutyg',
      activityName: '3 Warning kubernetes events',
      activityStartTime: 1608341280000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: 'LCNNnn0SQ5qWWBONsJxfkg',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608341280000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'lyXaF5KMSCKK_gRoa2oJ9g',
      activityName: '3 Normal kubernetes events',
      activityStartTime: 1608341280000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: '2jOZUHGHTK-Vppjx3oYs7w',
      activityName: '3 Normal kubernetes events',
      activityStartTime: 1608341280000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'VboRvW6yTk2wPxYZuZgG6w',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608341520000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'ucUQBuKRRHCAQA02fHVbaQ',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608118080000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: 'svb2IP4TRKqJFzf7vJdywA',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608341700000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'XzGgF9PGQdi2ZpUtXJRzRg',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608341700000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'ngS2eoXWSS6Zr_6yFNrXgg',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608348180000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'SgOWclemQ16zAoPO-8KDQg',
      activityName: '21 Normal kubernetes events',
      activityStartTime: 1608641100000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'VERIFICATION_PASSED',
      activityVerificationSummary: {
        total: 1,
        passed: 1,
        failed: 0,
        errors: 0,
        progress: 0,
        notStarted: 0,
        remainingTimeMs: 0,
        progressPercentage: 100,
        startTime: 1608640200000,
        durationMs: 900000,
        riskScore: 0.3328825415795513,
        aggregatedStatus: 'VERIFICATION_PASSED'
      }
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: '31isFedzRqe_QnwJZU-Xwg',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608641040000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'VERIFICATION_FAILED',
      activityVerificationSummary: {
        total: 1,
        passed: 0,
        failed: 1,
        errors: 0,
        progress: 0,
        notStarted: 0,
        remainingTimeMs: 0,
        progressPercentage: 100,
        startTime: 1608639900000,
        durationMs: 900000,
        riskScore: 0.5559231638720785,
        aggregatedStatus: 'VERIFICATION_FAILED'
      }
    },
    {
      activityType: 'OTHER',
      activityId: 'QPalXktWQtGdBfixm3qpXw',
      activityName: '3 Warning kubernetes events',
      activityStartTime: 1608641040000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: 'jBEQavYbR0ezRAelqk8zVQ',
      activityName: '3 Normal kubernetes events',
      activityStartTime: 1608641040000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: 'y1I3RoUkRPWmlSSSEHLl_w',
      activityName: '4 Normal kubernetes events',
      activityStartTime: 1608641100000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: 'cK_TVhGrTaCB6pgWeLeuwA',
      activityName: '6 Normal kubernetes events',
      activityStartTime: 1608641100000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'nN97r5YdS_yhOFOvUIgoEg',
      activityName: '16 Warning kubernetes events',
      activityStartTime: 1608641100000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '3gs8qI1KT8iik_-PUM7BrA',
      activityName: '7 Warning kubernetes events',
      activityStartTime: 1608641160000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'XV_Aea6uQUCtsPrU2jRc2w',
      activityName: '12 Normal kubernetes events',
      activityStartTime: 1608641160000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: 'ZnUK47LBR-qPS5MFruEYTw',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608641160000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: 'EAmTr_6hQtSqUZ9oV63uHQ',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608641160000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '5w7CMINrTQGgUZOiOaIzFw',
      activityName: '9 Normal kubernetes events',
      activityStartTime: 1608641220000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '24IjzyjYRdaungtE8LTuKg',
      activityName: '5 Warning kubernetes events',
      activityStartTime: 1608641220000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: 'wIRHZUeGQzeKc7kgHWySow',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608641220000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: '5nJuYp6tRLeVsq7pm5DtOQ',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608641220000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'Rjpmtvl3QauHWcRPIrCONQ',
      activityName: '4 Normal kubernetes events',
      activityStartTime: 1608641280000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'Nskp_M1XRGWXQt_dh7VdqQ',
      activityName: '6 Warning kubernetes events',
      activityStartTime: 1608641280000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'IN_PROGRESS',
      activityVerificationSummary: {
        total: 1,
        passed: 0,
        failed: 0,
        errors: 0,
        progress: 1,
        notStarted: 0,
        remainingTimeMs: 1200000,
        progressPercentage: 0,
        startTime: 1608640200000,
        durationMs: 900000,
        riskScore: -1.0,
        aggregatedStatus: 'IN_PROGRESS'
      }
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: 'WgweU9QKQjuzs69Etsjl8A',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608641280000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: 'x6qgJVivQU6h72PzYXSMmQ',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608641280000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '7WpRe-dFTlq6RJyR578RuA',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608641340000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: 'lCyltPnBR26fFiQTdeINKg',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608641340000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'Qj5ceg3cQ8mGOFCxu2PWzQ',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608641340000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'F4PYI0HBSKen6oAicNyszA',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608170100000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '8clyyP3HTb6AUru2dVKNFA',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608641520000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: 'SbD_mAP2RdOSbnyM-Y26pA',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608641520000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'B46xLu0lSPGR79Rqq9lSUQ',
      activityName: '2 Warning kubernetes events',
      activityStartTime: 1608641580000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: 'HBxL22xxRs24lyEY01NOWQ',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608773880000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'IN_PROGRESS',
      activityVerificationSummary: {
        total: 1,
        passed: 0,
        failed: 0,
        errors: 0,
        progress: 1,
        notStarted: 0,
        remainingTimeMs: 1200000,
        progressPercentage: 0,
        startTime: 1608772800000,
        durationMs: 900000,
        riskScore: 0.0,
        aggregatedStatus: 'IN_PROGRESS'
      }
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: 'Krgz4CqyRyainHstu3x9ww',
      activityName: '3 Normal kubernetes events',
      activityStartTime: 1608773880000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'qPrq1hhfTUiWGW2-XxV-WA',
      activityName: '3 Warning kubernetes events',
      activityStartTime: 1608773880000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'l_HVwq1WTZSu6Q97uLaP3w',
      activityName: '12 Normal kubernetes events',
      activityStartTime: 1608773940000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: '5AuSES9sSJe3pkfG_cNyIg',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608773940000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: 'AA8m9gGzRQq8LprtgTuAEg',
      activityName: '5 Normal kubernetes events',
      activityStartTime: 1608773940000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'O6fER9V1StK7SPkNYMu7qg',
      activityName: '27 Warning kubernetes events',
      activityStartTime: 1608773940000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '7SyTYTqbQ92T0EfTs-Mz2w',
      activityName: '9 Warning kubernetes events',
      activityStartTime: 1608774000000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'I5qffSBBSCaoRlIqBv-JBg',
      activityName: '13 Normal kubernetes events',
      activityStartTime: 1608774000000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: 'nMwLQgQHSBujIMZEyfrJjw',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608774000000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'zV73ZtTARZ-ZJABA67ELzw',
      activityName: '17 Normal kubernetes events',
      activityStartTime: 1608774060000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'obzM4NMUT16BM9FCOpZSZw',
      activityName: '3 Warning kubernetes events',
      activityStartTime: 1608774060000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: '8KSmZ5iRSi2Y41CEM3CVFw',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608774060000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: 'y-21R62dS6ePrgXOgklarw',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608774060000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'fV82ShaATB2lN73UUl3zOQ',
      activityName: '6 Warning kubernetes events',
      activityStartTime: 1608774120000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'DEPLOYMENT',
      activityId: 'uDExVYWkQxmRvhuG9K0EEQ',
      activityName: '3 Normal kubernetes events',
      activityStartTime: 1608774120000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: 'jqXN78q6RTuMwRMzhUHN6A',
      activityName: '3 Normal kubernetes events',
      activityStartTime: 1608774120000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '81TZ-UtARh-RKyRrZmoFjQ',
      activityName: '3 Normal kubernetes events',
      activityStartTime: 1608774120000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'YxySItVwR6mCXQKj95Z25Q',
      activityName: '2 Normal kubernetes events',
      activityStartTime: 1608774180000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: '4N-xCY-pR0CJ2f57S1zEgg',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608774180000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: 'sdfdsf56',
      activityName: '1 Warning kubernetes events',
      activityStartTime: 1608774180000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '123sdfsf',
      activityName: '2 Warning kubernetes events',
      activityStartTime: 1608774360000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'IN_PROGRESS',
      activityVerificationSummary: {
        total: 1,
        passed: 0,
        failed: 0,
        errors: 0,
        progress: 1,
        notStarted: 0,
        remainingTimeMs: 1200000,
        progressPercentage: 0,
        startTime: 1608773400000,
        durationMs: 900000,
        riskScore: 0.0,
        aggregatedStatus: 'IN_PROGRESS'
      }
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: '5435dfg7',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608774360000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '12312_23476868',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608774360000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'INFRASTRUCTURE',
      activityId: '12312_23412',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608774540000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    },
    {
      activityType: 'OTHER',
      activityId: '12312_234',
      activityName: '1 Normal kubernetes events',
      activityStartTime: 1608774540000,
      environmentIdentifier: 'Prod',
      environmentName: null,
      serviceIdentifier: 'VerificationService',
      verificationStatus: 'NOT_STARTED',
      activityVerificationSummary: null
    }
  ],
  responseMessages: []
}

const testWrapperProps: TestWrapperProps = {
  path: routes.toCVActivitySourceSetup({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_ORG'
  }
}

describe('Unit test for ActivityDashboardPage', () => {
  let originalObserver: any
  beforeAll(() => {
    originalObserver = window.IntersectionObserver
    window.IntersectionObserver = jest.fn(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    })) as any
  })
  afterAll(() => {
    window.IntersectionObserver = originalObserver
  })

  test('Ensure data is rendered when api returns value', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1608298320000)
    const useListActivitiesForDashboardSpy = jest.spyOn(cvService, 'useListActivitiesForDashboard')
    useListActivitiesForDashboardSpy.mockReturnValue({ data: MockResponse } as any)
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <ActivityDashboardPage />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')))
    // expect(container.querySelectorAll('[class*="activityCard"]').length).toBe(8)
  })

  // testing activity dashboard util function
  test('Ensure activities are aggregated correctly based on type', async () => {
    const mockGetString = jest.fn().mockImplementation(str => {
      return str
    })

    // no data
    let aggregatedEvents = aggregateActivityByType(mockGetString)
    expect(aggregatedEvents).toEqual(
      new Map([
        [
          'inProgress',
          {
            iconProps: {
              name: 'deployment-inprogress-new',
              size: 12
            },
            totalCount: 0
          }
        ],
        [
          'passed',
          {
            iconProps: {
              name: 'deployment-success-new',
              size: 12
            },
            totalCount: 0
          }
        ],
        [
          'failed',
          {
            iconProps: {
              name: 'deployment-failed-new',
              size: 12
            },
            totalCount: 0
          }
        ]
      ])
    )

    aggregatedEvents = aggregateActivityByType(mockGetString, [
      {
        startTime: 1608774360000,
        progress: 0,
        activityName: '2 Warning kubernetes events',
        activityStatus: 'IN_PROGRESS',
        riskScore: -1,
        activityType: 'OTHER',
        environmentName: null,
        serviceIdentifier: 'VerificationService',
        uuid: '1'
      },
      {
        startTime: 1608641280000,
        progress: 0,
        activityName: '6 Warning kubernetes events',
        activityStatus: 'IN_PROGRESS',
        riskScore: -1,
        activityType: 'OTHER',
        environmentName: null,
        serviceIdentifier: 'VerificationService',
        uuid: '2'
      },
      {
        startTime: 1608641100000,
        progress: 100,
        activityName: '21 Normal kubernetes events',
        activityStatus: 'VERIFICATION_PASSED',
        riskScore: 0.3328825415795513,
        activityType: 'OTHER',
        environmentName: null,
        serviceIdentifier: 'VerificationService',
        uuid: '3'
      },
      {
        startTime: 1608298020000,
        progress: 100,
        activityName: '48 Normal kubernetes events',
        activityStatus: 'VERIFICATION_PASSED',
        riskScore: 0.19560974853986654,
        activityType: 'OTHER',
        environmentName: null,
        serviceIdentifier: 'Manager',
        uuid: '4'
      },
      {
        startTime: 1608263880000,
        progress: 0,
        activityName: '1 Warning kubernetes events',
        activityStatus: 'IN_PROGRESS',
        riskScore: -1,
        activityType: 'OTHER',
        environmentName: null,
        serviceIdentifier: 'Manager',
        uuid: '5'
      },
      {
        startTime: 1608263400000,
        progress: 100,
        activityName: '2 Normal kubernetes events',
        activityStatus: 'VERIFICATION_PASSED',
        riskScore: 0.07880626145083156,
        activityType: 'OTHER',
        environmentName: null,
        serviceIdentifier: 'Manager',
        uuid: '6'
      },
      {
        startTime: 1608262020000,
        progress: 100,
        activityName: '1 Warning kubernetes events',
        activityStatus: 'VERIFICATION_PASSED',
        riskScore: 0.12610193300257203,
        activityType: 'OTHER',
        environmentName: null,
        serviceIdentifier: 'Manager',
        uuid: '7'
      },
      {
        startTime: 1608261600000,
        progress: 100,
        activityName: '2 Normal kubernetes events',
        activityStatus: 'VERIFICATION_PASSED',
        riskScore: 0.02627106828355504,
        activityType: 'OTHER',
        environmentName: null,
        serviceIdentifier: 'Manager',
        uuid: '8'
      },
      {
        startTime: 1608261300000,
        progress: 100,
        activityName: '3 Normal kubernetes events',
        activityStatus: 'VERIFICATION_PASSED',
        riskScore: 0.02353248502737243,
        activityType: 'OTHER',
        environmentName: null,
        serviceIdentifier: 'Manager',
        uuid: '9'
      },
      {
        startTime: 1608260100000,
        progress: 100,
        activityName: '1 Warning kubernetes events',
        activityStatus: 'VERIFICATION_PASSED',
        riskScore: 0.05320143825990746,
        activityType: 'OTHER',
        environmentName: null,
        serviceIdentifier: 'Manager',
        uuid: '10'
      },
      {
        startTime: 1608259800000,
        progress: 100,
        activityName: '2 Normal kubernetes events',
        activityStatus: 'VERIFICATION_PASSED',
        riskScore: 0.05783438328521656,
        activityType: 'OTHER',
        environmentName: null,
        serviceIdentifier: 'Manager',
        uuid: '11'
      },
      {
        startTime: 1608259740000,
        progress: 100,
        activityName: '1 Warning kubernetes events',
        activityStatus: 'VERIFICATION_PASSED',
        riskScore: 0.056783056739160606,
        activityType: 'OTHER',
        environmentName: null,
        serviceIdentifier: 'Manager',
        uuid: '12'
      },
      {
        startTime: 1608256560000,
        progress: 100,
        activityName: '1 Normal kubernetes events',
        activityStatus: 'VERIFICATION_FAILED',
        riskScore: -1,
        activityType: 'OTHER',
        environmentName: null,
        serviceIdentifier: 'Manager',
        uuid: '13'
      },
      {
        startTime: 1608256560000,
        progress: 100,
        activityName: '1 Normal kubernetes events',
        activityStatus: 'NOT_STARTED',
        riskScore: -1,
        activityType: 'OTHER',
        environmentName: null,
        serviceIdentifier: 'Manager',
        uuid: '14'
      },
      {
        startTime: 1608256560000,
        progress: 100,
        activityName: '1 Normal kubernetes events',
        activityStatus: 'ERROR',
        riskScore: -1,
        activityType: 'OTHER',
        environmentName: null,
        serviceIdentifier: 'Manager',
        uuid: '15'
      },
      {
        startTime: 1608256560000,
        progress: 100,
        activityName: '1 Normal kubernetes events',
        riskScore: -1,
        activityType: 'OTHER',
        environmentName: null,
        serviceIdentifier: 'Manager',
        uuid: '16'
      },
      {
        startTime: 1608256560000,
        progress: 100,
        activityName: '1 Normal kubernetes events',
        riskScore: -1,
        activityStatus: 'SEMIAUTO',
        activityType: 'OTHER',
        environmentName: null,
        serviceIdentifier: 'Manager',
        uuid: '17'
      }
    ])

    expect(aggregatedEvents).toEqual(
      new Map([
        [
          'failed',
          {
            iconProps: {
              name: 'deployment-failed-new',
              size: 12
            },
            totalCount: 2
          }
        ],
        [
          'inProgress',
          {
            iconProps: {
              name: 'deployment-inprogress-new',
              size: 12
            },
            totalCount: 4
          }
        ],
        [
          'passed',
          {
            iconProps: {
              name: 'deployment-success-new',
              size: 12
            },
            totalCount: 9
          }
        ]
      ])
    )
  })
})
