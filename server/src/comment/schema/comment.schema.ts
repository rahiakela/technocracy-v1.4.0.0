import * as mongoose from 'mongoose';
import {Schema} from 'mongoose';

// comment model declaration
export const CommentSchema = new mongoose.Schema({
    content: {type: String, required: true },
    commentedBy: {type: Schema.Types.ObjectId, ref: 'User' },
    commentedOn: {type: Date, required: true, default: Date.now() },
    likes: {type: Array, default: [] },
    replies: [{type: Schema.Types.ObjectId, ref: 'Reply' }],
    notification: {type: String, required: false },
});

// comment replay model declaration
export const ReplySchema = new mongoose.Schema({
    content: {type: String, required: true },
    repliedBy: {type: Schema.Types.ObjectId, ref: 'User' },
    repliedOn: {type: Date, required: true, default: Date.now() },
    likes: {type: Array, default: [] },
});

// when we call comment.remove() this middleware is automatically invoked to clean up reply dependencies.
// ref: https://stackoverflow.com/questions/14348516/cascade-style-delete-in-mongoose
CommentSchema.pre('remove', (next) => {
    // 'this' is the comment being removed.
    ReplySchema.remove({_id: this.replies.filter((reply: any) => reply === reply._id)}).exec();
    next();
});
