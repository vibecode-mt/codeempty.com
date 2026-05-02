import { Hono, Context } from 'hono';
import { jwtMiddleware, getUser } from '../middleware';
import { DatabaseService } from '../database';

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  R2_IMAGES: R2Bucket;
  ENVIRONMENT: string;
  JWT_SECRET: string;
};

const uploadRouter = new Hono<{ Bindings: Bindings }>();

uploadRouter.use('*', jwtMiddleware());

/**
 * POST /api/admin/upload/image
 * Upload image to R2
 */
uploadRouter.post('/image', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const user = getUser(c);
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'File is required' }, 400);
    }

    if (!file.type.startsWith('image/')) {
      return c.json({ error: 'Only image files are allowed' }, 400);
    }

    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: 'File size must be less than 10MB' }, 400);
    }

    const fileName = \\-\\;
    const buffer = await file.arrayBuffer();

    // Upload to R2
    await c.env.R2_IMAGES.put(fileName, buffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    const imageUrl = \https://\.r2.cloudflarestorage.com/\\;

    // Log the action
    const db = new DatabaseService(c.env.DB);
    await db.logAction(user!.admin_id, 'UPLOAD_IMAGE', 'images', fileName);

    return c.json({
      message: 'Image uploaded successfully',
      filename: fileName,
      url: imageUrl,
      size: file.size,
    });
  } catch (error) {
    console.error('Upload image error:', error);
    return c.json({ error: 'Failed to upload image' }, 500);
  }
});

export default uploadRouter;
