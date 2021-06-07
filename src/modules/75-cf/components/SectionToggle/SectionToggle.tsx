import React, { ReactElement } from 'react'
import { useParams } from 'react-router'
import { NavLink } from 'react-router-dom'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import css from './SectionToggle.module.scss'

const SectionToggle = (): ReactElement => {
  const params = useParams<ProjectPathProps & { accountId: string }>()
  const { getString } = useStrings()
  const { activeEnvironment } = useQueryParams<{ activeEnvironment: string }>()

  const Item = ({ link, text }: { link: string; text: keyof StringsMap }): ReactElement => (
    <li className={css.item}>
      <NavLink to={`${link}?activeEnvironment=${activeEnvironment}`} className={css.link} activeClassName={css.active}>
        {getString(text)}
      </NavLink>
    </li>
  )

  return (
    <ul className={css.wrapper} data-testid="CFSectionToggle">
      <Item link={routes.toCFTargets(params)} text="cf.shared.targets" />
      <Item link={routes.toCFSegments(params)} text="cf.shared.segments" />
    </ul>
  )
}

export default SectionToggle
