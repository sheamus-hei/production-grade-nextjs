import { Db } from 'mongodb'
import { nanoid } from 'nanoid'

export const getUserByEmail = async (db: Db, email: string) => {
  return db.collection('users').findOne({ email });
}
export const getUserById = async (db: Db, id: string) => {
  return db.collection('users').findOne({ _id: id });
}

export const createUser = async (db: Db, user: { 
  name: string; email: string; picture: string; 
}) => {
  const newUser = await db.collection('users').insertOne({
    _id: nanoid(),
    ...user,
  })
  return newUser;
}

