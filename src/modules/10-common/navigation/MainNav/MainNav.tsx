import React from 'react'
import cx from 'classnames'
import { NavLink as Link, useParams } from 'react-router-dom'
import type { NavLinkProps } from 'react-router-dom'
import { Text, Icon, Layout, Color, Avatar } from '@wings-software/uicore'
import { String } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'

import paths from '@common/RouteDefinitions'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import css from './MainNav.module.scss'

const commonLinkProps: Partial<NavLinkProps> = {
  activeClassName: css.active,
  className: cx(css.navLink, css.separation)
}

export default function L1Nav(): React.ReactElement {
  const params = useParams<ProjectPathProps>()
  const { CENG_ENABLED, NG_DASHBOARDS } = useFeatureFlags()
  const { currentUserInfo: user } = useAppStore()

  return (
    <nav className={css.main}>
      <ul className={css.navList}>
        <li className={css.navItem}>
          <Link {...commonLinkProps} to={paths.toProjects(params)}>
            <Layout.Vertical flex={{ align: 'center-center' }} spacing="small">
              <Icon name="harness" size={30} />
              <Text font={{ size: 'small', weight: 'semi-bold', align: 'center' }} color={Color.WHITE} lineClamp={2}>
                <String stringID="projectsText" />
              </Text>
            </Layout.Vertical>
          </Link>
        </li>
        {CENG_ENABLED && (
          <li className={css.navItem}>
            <Link {...commonLinkProps} to={paths.toCE(params)}>
              <Layout.Vertical flex={{ align: 'center-center' }} spacing="small">
                <Icon name="ce-main" size={30} />
                <Text font={{ size: 'small', weight: 'semi-bold', align: 'center' }} color={Color.WHITE} lineClamp={2}>
                  <String stringID="cloudCostsText" />
                </Text>
              </Layout.Vertical>
            </Link>
          </li>
        )}
        {/* {CVNG_ENABLED && (
          <li className={css.navItem}>
            <Link {...commonLinkProps} to={paths.toCV(params)}>
              <Layout.Vertical flex={{ align: 'center-center' }} spacing="small" width={90}>
                <Icon name="cv-main" size={30} />
                <Text font={{ size: 'small', weight: 'semi-bold', align: 'center' }} color={Color.WHITE} lineClamp={2}>
                  <String stringID="changeVerificationText" />
                </Text>
              </Layout.Vertical>
            </Link>
          </li>
        )} */}
        <li className={css.navItem}>
          <Link {...commonLinkProps} to={paths.toAsaasin(params)}>
            <Layout.Vertical flex={{ align: 'center-center' }} spacing="small" width={90}>
              <Icon name="command-icon" size={30} />
              <Text font={{ size: 'small', weight: 'semi-bold', align: 'center' }} color={Color.WHITE} lineClamp={2}>
                aSaaSin
              </Text>
            </Layout.Vertical>
          </Link>
        </li>
      </ul>

      <ul className={css.navList}>
        {NG_DASHBOARDS && (
          <li className={css.navItem}>
            <Link className={css.navLink} activeClassName={css.active} to={paths.toCustomDasboard(params)}>
              <Icon name="dashboard" size={20} />
            </Link>
          </li>
        )}
        <li className={css.navItem}>
          <Link className={css.navLink} activeClassName={css.active} to={paths.toAdmin(params)}>
            <Icon name="nav-settings" size={20} />
          </Link>
        </li>
        <li className={css.navItem}>
          <Link className={css.navLink} activeClassName={css.active} to={paths.toUser(params)}>
            <Layout.Vertical flex={{ align: 'center-center' }} spacing="small" width={90}>
              <Avatar name={user.name} email={user.email} size="small" hoverCard={false} />
              <Text
                font={{ size: 'small', weight: 'semi-bold', align: 'center' }}
                color={Color.WHITE}
                lineClamp={1}
                className={css.userName}
              >
                {user.name}
              </Text>
            </Layout.Vertical>
          </Link>
        </li>
      </ul>
    </nav>
  )
}
