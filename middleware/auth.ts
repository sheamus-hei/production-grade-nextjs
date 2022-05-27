import { getToken } from 'next-auth/jwt'

export default async (req, res, next) => {
  const token = await getToken({ req, secret: process.env.JWT_SECRET })
  if (token) {
    // Signed in
    req.user = token.user
    next()
  } else {
    // Not Signed in
    res.status(401)
    res.end()
  }
}
