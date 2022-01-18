/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ActivityStackItems } from '@common/components/ActivityStack/ActivityStack'

export const activityData: ActivityStackItems[] = [
  {
    name: 'Lawrence Wilfred',
    icon: 'cd-main',
    lastUpdatedAt: '10 minutes ago',
    activity: 'Continuous Delivery Activity',
    updatedBy: 'by Lawrence Wilfred',
    color: 'var(--green-300)'
  },
  {
    name: 'Olivia Dunham',
    lastUpdatedAt: '20 minutes ago',
    icon: 'cv-main',
    activity: 'Continuous Verification Activity',
    updatedBy: 'by Olivia Dunham',
    color: 'var(--purple-100)'
  },
  {
    name: 'Reetika Mallavarapu',
    lastUpdatedAt: '30 minutes ago',
    icon: 'cv-main',
    activity: 'Continuous Verification Activity',
    updatedBy: 'by Reetika Mallavarapu',
    color: 'var(--purple-100)'
  },
  {
    name: 'Lawrence Wilfred',
    icon: 'cd-main',
    lastUpdatedAt: '40 minutes ago',
    activity: 'Continuous Delivery Activity',
    updatedBy: 'by Lawrence Wilfred',
    color: 'var(--green-300)'
  },
  {
    name: 'Lawrence Wilfred',
    icon: 'cf-main',
    lastUpdatedAt: '40 minutes ago',
    activity: 'Feature Flags Activity',
    updatedBy: 'by Lawrence Wilfred',
    color: 'var(--yellow-300)'
  },
  {
    name: 'Olivia Dunham',
    lastUpdatedAt: '20 minutes ago',
    icon: 'ci-main',
    activity: 'Continuous Build Activity',
    updatedBy: 'by Olivia Dunham',
    color: 'var(--blue-300)'
  }
]
