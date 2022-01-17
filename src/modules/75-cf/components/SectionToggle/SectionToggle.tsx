/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { useParams, NavLink } from 'react-router-dom'
import type { StringKeys } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import StringWithTooltip from '@common/components/StringWithTooltip/StringWithTooltip'
import css from './SectionToggle.module.scss'

const SectionToggle = (): ReactElement => {
  const params = useParams<ProjectPathProps & { accountId: string }>()
  const { activeEnvironment } = useQueryParams<{ activeEnvironment: string }>()

  const Item = ({ link, text, tooltipId }: { link: string; text: StringKeys; tooltipId: string }): ReactElement => (
    <li className={css.item}>
      <NavLink to={`${link}?activeEnvironment=${activeEnvironment}`} className={css.link} activeClassName={css.active}>
        <StringWithTooltip stringId={text} tooltipId={tooltipId} />
      </NavLink>
    </li>
  )

  return (
    <ul className={css.wrapper} data-testid="CFSectionToggle">
      <Item link={routes.toCFTargets(params)} text="cf.shared.targets" tooltipId="ff_targets_heading" />
      <Item link={routes.toCFSegments(params)} text="cf.shared.segments" tooltipId="ff_segments_heading" />
    </ul>
  )
}

export default SectionToggle
