const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Create text indexes for search
    mongoose.connection.once('open', async () => {
      try {
        const db = mongoose.connection.db;
        await db.collection('series').createIndex(
          { title: 'text', description: 'text', tags: 'text' },
          { name: 'series_text_search' }
        );
        await db.collection('users').createIndex(
          { name: 'text', email: 'text' },
          { name: 'users_text_search' }
        );
        await db.collection('episodes').createIndex(
          { title: 'text', description: 'text' },
          { name: 'episodes_text_search' }
        );
      } catch (err) {
        // Indexes may already exist — that's fine
      }
    });
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
