import { connect } from 'mongoose';

export const connectDB = async (listeningApp) => {
    try {
        await connect(process.env.MONGODB_URL);
        console.log('MongoDB connected successfully');
        listeningApp();

    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};   