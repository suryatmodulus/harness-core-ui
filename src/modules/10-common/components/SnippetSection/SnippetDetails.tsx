import React, { useState, useEffect } from 'react'
import cx from 'classnames'

import { Icon } from '@wings-software/uicore'
import type { YamlSnippetMetaData, GetYamlSchemaQueryParams } from 'services/cd-ng'
import type { SnippetFetchResponse } from '@common/interfaces/YAMLBuilderProps'
import { useStrings } from 'framework/exports'
import Snippet from './Snippet'

import css from './SnippetDetails.module.scss'

interface SnippetDetailsProps {
  entityType: GetYamlSchemaQueryParams['entityType']
  selectedIcon?: string
  snippets?: YamlSnippetMetaData[]
  onSnippetCopy?: (identifier: string) => Promise<void>
  snippetFetchResponse?: SnippetFetchResponse
}

const SnippetDetails: React.FC<SnippetDetailsProps> = props => {
  const { entityType, onSnippetCopy, snippetFetchResponse, selectedIcon } = props
  const [snippets, setSnippets] = useState<YamlSnippetMetaData[]>()
  const [searchedSnippet, setSearchedSnippet] = useState('')
  const { getString } = useStrings()

  useEffect(() => {
    setSearchedSnippet('')
  }, [selectedIcon])

  const onSnippetSearch = (query: string): void => {
    const snippetsClone = props.snippets as YamlSnippetMetaData[]
    setSnippets(snippetsClone.filter(snippet => snippet.name?.toLowerCase().includes(query.toLowerCase())))
  }

  const handleSnippetSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault()
    const query = event.target.value
    if (query) {
      setSearchedSnippet(query)
      onSnippetSearch(query)
    } else onSearchClear()
  }

  const onSearchClear = (event?: React.MouseEvent<HTMLElement>): void => {
    event?.preventDefault()
    setSnippets(props.snippets)
    setSearchedSnippet('')
  }

  useEffect(() => {
    setSnippets(props.snippets)
  }, [props.snippets])

  return (
    <div className={css.main}>
      <div className={css.title}>
        <span style={{ textTransform: 'capitalize' }}>{entityType.replace(/s$/, '')}</span>&nbsp;
        {getString('common.snippets')}
      </div>
      <div className={css.searchBar}>
        <span className={css.searchIcon}>
          <Icon name={'main-search'} size={20} />
        </span>
        <input
          placeholder="Search"
          name="snippet-search"
          className={css.search}
          onChange={handleSnippetSearch}
          value={searchedSnippet}
        />
        {searchedSnippet ? (
          <span className={css.closeIcon}>
            <Icon name={'main-close'} size={10} onClick={onSearchClear} />
          </span>
        ) : null}
      </div>
      {snippets && snippets?.length > 0 ? (
        <div className={css.snippets}>
          {snippets?.map(snippet => (
            <Snippet
              key={snippet.name}
              {...snippet}
              onSnippetCopy={onSnippetCopy}
              snippetFetchResponse={snippetFetchResponse}
            />
          ))}
        </div>
      ) : (
        <div className={cx(css.noSnippets, css.fillSpace)}>No snippets found.</div>
      )}
    </div>
  )
}

export default SnippetDetails
