import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { generateUploadSignature } from '../config/cloudinary.js';
import { isCloudinaryConfigured } from '../config/env.js';

const router = Router();

/**
 * POST /api/uploads/signature
 * Generates an authorized upload signature for direct browser -> Cloudinary uploads.
 * Restricts folder to shareplate/donations/<userId>, enforces max file size and server timestamp.
 */
router.post('/signature', authenticateToken, (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!isCloudinaryConfigured()) {
      // Return clear status when Cloudinary credentials are intentionally pending in dev/demo
      res.status(200).json({
        success: true,
        isConfigured: false,
        message: 'Cloudinary credentials not provided in server environment. Use client-side demo fallback sample image.',
        sampleImages: [
          {
            name: 'Vegetable Biryani',
            url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
            publicId: 'shareplate/sample/biryani'
          },
          {
            name: 'Fresh Chapati & Sabzi',
            url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
            publicId: 'shareplate/sample/roti'
          },
          {
            name: 'Bakery Breads',
            url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
            publicId: 'shareplate/sample/bread'
          },
          {
            name: 'South Indian Idli',
            url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
            publicId: 'shareplate/sample/idli'
          }
        ]
      });
      return;
    }

    const signatureData = generateUploadSignature(req.user.id);

    res.status(200).json({
      success: true,
      isConfigured: true,
      ...signatureData,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to generate Cloudinary upload signature',
    });
  }
});

export default router;
