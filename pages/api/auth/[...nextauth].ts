import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import { connectToDB, folder, doc } from '../../../db'

export default (req, res) => NextAuth(req, res, {
  // session: {
  //   jwt: true,
  // },
  // jwt: {
  //   secret: process.env.JWT_SECRET,
  // },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    })
  ],
  database: process.env.DATABASE_URL,
  pages: {
    signIn: "/signin"
  },
  secret: process.env.SECRET,
  callbacks: {
    async session(session, user) {
      if (user) {
        console.log("USER", user)
        session.user.id = user._id
      }
      return session
    },
    // async jwt(tokenPayload, user, account, profile, isNewUser) {
    //   const { db } = await connectToDB()
    //   if (isNewUser) {
    //     const newFolder = await folder.createFolder(db, {
    //       createdBy: user._id,
    //       name: 'Getting Started',
    //     })
    //     await doc.createDoc(db, {
    //       createdBy: user._id,
    //       folder: newFolder._id,
    //       name: 'Start Here',
    //       content: {
    //         time: 1556098174501,
    //         blocks: [
    //           {
    //             type: 'header',
    //             data: {
    //               text: 'Some default content',
    //               level: 2,
    //             },
    //           },
    //         ],
    //         version: '2.12.4',
    //       },
    //     })
    //   }
    // }
  }
})