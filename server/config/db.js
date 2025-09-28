import mongoose from 'mongoose';

export async function connectDB(uri) {
  if (!uri) throw new Error('Mongo URI missing');
  mongoose.set('strictQuery', true);
  if (process.env.MONGO_DEBUG === '1') {
    mongoose.set('debug', (collection, method, query, doc) => {
      console.log(`[MONGO-DEBUG] ${collection}.${method}`, JSON.stringify(query), doc ? JSON.stringify(doc).slice(0,200) : '');
    });
  }
  await mongoose.connect(uri, { autoIndex: true });
  console.log('MongoDB connected (db name =', mongoose.connection.name + ')');
}

export function getConnectionInfo() {
  if (!mongoose.connection) return null;
  return {
    name: mongoose.connection.name,
    host: mongoose.connection.host,
    readyState: mongoose.connection.readyState,
  };
}
