/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/**
 * Sidebar Identifier represents a unique id for a `SidebarEntry`. It is used for two purposes:
 *
 * - Make a `SidebarEntry` unique.
 * - Group Module routes into a `SidebarEntry`. A Module route must declare it has a
 * `SidebarIdentifier` to avoid mistake in which developers forget to add their route
 * into a SidebarEntry, resulting the SidebarEntry is not highlighted/selected then their
 * route is mounted.
 *
 * If a Module route does not belong to a SidebarEntry (like Login, Reset Password, etc...), they must declare their `SidebarIdentifier` is `SidebarIdentifier.NONE`.
 */
export enum SidebarIdentifier {
  DASHBOARD = 'DASHBOARD',
  PROJECTS = 'PROJECTS',
  CONTINUOUS_DEPLOYMENTS = 'CONTINUOUS_DEPLOYMENTS',
  CONTINUOUS_VERIFICATION = 'CONTINUOUS_VERIFICATION',
  CONTINUOUS_INTEGRATION = 'CONTINUOUS_INTEGRATION',
  CONTINUOUS_FEATURES = 'CONTINUOUS_FEATURES',
  ACCOUNT = 'ACCOUNT',
  USER_PROFILE = 'USER_PROFILE',

  /** Special identifier to denote a route does not belong to a `SidebarEntry` */
  NONE = 'NONE'
}
