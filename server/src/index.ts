import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Example API route
app.get('/api/tools', (req: Request, res: Response) => {
  res.json({ 
    tools: [
      { id: 1, name: 'Compress PDF', route: '/tools/compress' },
      { id: 2, name: 'Merge PDF', route: '/tools/merge-pdf' },
      { id: 3, name: 'Images to PDF', route: '/tools/images-to-pdf' },
      { id: 4, name: 'PDF to Images', route: '/tools/pdf-to-images' },
      { id: 5, name: 'PDF to Word', route: '/tools/pdf-to-word' },
      { id: 6, name: 'QR Generator', route: '/tools/qr-generator' },
      { id: 7, name: 'Remove Background', route: '/tools/remove-background' }
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
