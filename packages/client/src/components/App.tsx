import React from 'react'
import { useGetContentQuery } from '../generated/graphql'

function App() {
  const [result] = useGetContentQuery()
  const { data, fetching, error } = result

  if (fetching) return <div>Loading...</div>
  if (error) return <div>Error</div>

  return <div>{data?.getContent.length}</div>
}

export default App
