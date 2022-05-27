import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import { connectToDB, folder, doc, user } from '../../../db'

export default (req, res) => NextAuth(req, res, {
  session: {
    strategy: "jwt"
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
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
    async jwt({ token }) {
      const { db } = await connectToDB()
      if (token.email && !token.user?._id) {
        // find user in db
        const userInDb = await user.getUserByEmail(db, token.email)
        if (userInDb) {
          token.user = userInDb
        } else {
          // make new user for that email
          const newUser = await user.createUser(db, {
            name: token.name,
            email: token.email,
            picture: token.picture,
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
          token.user = newUser
        }
      }
      return token
    },
  }
})