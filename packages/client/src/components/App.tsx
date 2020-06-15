import React from 'react'
import { useGetContentQuery } from '../api'

export interface AppProps {}

const App: React.FC<AppProps> = () => {
  const [result] = useGetContentQuery()
  const contentList = result.data!.getContent

  return (
    <ul>
      {contentList.map(({ id, value }) => (
        <li key={id}>{value}</li>
      ))}
    </ul>
  )
}

export default App
