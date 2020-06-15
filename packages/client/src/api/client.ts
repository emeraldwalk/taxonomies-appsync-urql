import { createClient, dedupExchange, cacheExchange, fetchExchange } from 'urql'
import { suspenseExchange } from '@urql/exchange-suspense'
import { devtoolsExchange } from '@urql/devtools'
import { apiKey, apiUrl } from '../config'

const client = createClient({
  url: apiUrl,
  exchanges: [
    devtoolsExchange,
    dedupExchange,
    suspenseExchange,
    cacheExchange,
    fetchExchange,
  ],
  fetchOptions: () => {
    return {
      headers: {
        'X-Api-Key': apiKey,
      },
    }
  },
  suspense: true,
})

export default client
