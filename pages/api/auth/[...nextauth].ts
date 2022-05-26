import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import { connectToDB, folder, doc, user } from '../../../db'

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
    async session(session) {
      return session
    },
    async jwt(tokenPayload) {
      const { db } = await connectToDB()
      if (tokenPayload.token.email && !tokenPayload.token.user?._id) {
        // find user in db
        const userInDb = await user.getUserByEmail(db, tokenPayload.token.email)
        if (userInDb) {
          tokenPayload.token.user = userInDb
        } else {
          // make new user for that email
          const newUser = await user.createUser(db, {
            name: tokenPayload.token.name,
            email: tokenPayload.token.email,
            picture: tokenPayload.token.picture,
          }).then(res => res.ops[0])
          const personalFolder = await folder.createFolder(db, {
            createdBy: `${newUser._id}`, 
            name: 'Getting Started' 
          })
          await doc.createDoc(db, {
            name: 'Start Here',
            folder: personalFolder._id,
            createdBy: `${newUser._id}`,
            content: {
              time: 1556098174501,
              blocks: [
                {
                  type: 'header',
                  data: {
                    text: 'Some default content',
                    level: 2,
                  },
                },
              ],
              version: '2.12.4',
            },
          })
          tokenPayload.token.user = newUser
        }
      }
      return tokenPayload.token
    },
  }
})