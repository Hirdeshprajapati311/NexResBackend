
import app from "./app";
import { connectDB } from "./db";


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT,()=>{
      console.log(`Server is running on port http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('Error connecting to MongoDB:', err)
    process.exit(1);
  }
}

startServer();