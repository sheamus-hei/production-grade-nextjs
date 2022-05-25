// fixes a bug for next-auth and mongodb atlas somehow
// https://github.com/nextauthjs/next-auth/issues/833
import 'reflect-metadata'
import React from 'react'
import '../styles/globals.css'
import { SessionProvider } from "next-auth/react"

function MyApp({ 
  Component, 
  pageProps: { session, ...pageProps}
}) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}

export default MyApp
