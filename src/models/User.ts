import { Document, ObjectId, Schema, model } from 'mongoose';


export interface UserDocument extends Document{
  _id: ObjectId;
  username: string;
  password: string;
  email: string;
  hasResume: boolean;
  seenOnboarding: boolean;

}


const UserSchema = new Schema<UserDocument>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String, required: true
  },
  hasResume: { type: Boolean, default: false },
  seenOnboarding:{type:Boolean,default:false}
},
  {timestamps:true}
)

const User =  model<UserDocument>("User",UserSchema)

export default User;