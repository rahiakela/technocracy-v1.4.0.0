import * as mongoose from 'mongoose';
import {Schema} from 'mongoose';

export const SubscriptionSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true },
    ipAddress: {type: String },
    city: {type: String },
    country: {type: String },
    notification: {type: String, required: true, default: 'N'},
    subscribedOn: {type: Date, required: true, default: Date.now()},
});
