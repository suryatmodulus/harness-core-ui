# Server Sent Events

Server-Sent Events (SSE) is a server push technology enabling a client to receive automatic updates from a server via an HTTP connection, and describes how servers can initiate data transmission towards clients once an initial client connection has been established. They are commonly used to send message updates or continuous data streams to a browser client and designed to enhance native, cross-browser streaming through a JavaScript API called EventSource, through which a client requests a particular URL in order to receive an event stream.

## Overview

At its core the SSE framework exposes a hook, called useEventSourceListener. This component opens a connection to the server listens to the messages and error either on mount or later. Here's a quick overview what it looks like.

```typescript
import React, { useState } from 'react'
import { useToaster } from '@common/exports'
import { useEventSourceListener } from '@common/hooks/useEventSourceListener'

interface Message {
  content: string
}

export const EventSourceConsumer: React.FC = () => {
  const [message, setMessage] = useState<Message>()
  const { showError } = useToaster()

  useEventSourceListener<Message>({
    url: 'www.example.com',
    event: {
      onMessage: event => {
        setMessage(event.data)
      },
      onError: () => {
        showError('Error while connecting')
      },
      onOpen: () => {
        showError('Opened the connection succesfully')
      },
      onParseError: () => {
        showError('Error while parsing the data')
      }
    }
  })

  return <div>{message?.content}</div>
}
```

### Lazy Fetching

It is possible to use a useEventSourceListener hook and defer the connection to a later stage. This is done with the lazy boolean property. The connection can be controled by two methods that are exposed; startListening and stopListening.

```typescript
import React, { useState } from 'react'
import { useEventSourceListener } from '@common/hooks/useEventSourceListener'

interface Message {
  content: string
}

export const EventSourceConsumer: React.FC = () => {
  const [message, setMessage] = useState<Message>()

  const { startListening, stopListening } = useEventSourceListener<Message>({
    url: 'www.example.com',
    lazy: true,
    event: {
      onMessage: event => {
        setMessage(event.data)
      }
    }
  })

  return (
    <div>
      <button onClick={() => startListening()}>Start Streaming</button>
      <button onClick={() => stopListening()}>Stop Streaming</button>
      <h1>{message?.content}</h1>
    </div>
  )
}
```
