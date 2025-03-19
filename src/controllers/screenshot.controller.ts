import { Request, Response, Router } from 'express';
import * as Minio from 'minio';
import { Controller } from "./controller";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import httpStatus from 'http-status';
import {
    MINIO_ACCESS_KEY_ID,
    MINIO_SECRET_ACCESS_KEY,
    MINIO_DEFAULT_REGION,
    MINIO_BUCKET,
    MINIO_ENDPOINT,
    MINIO_PORT
} from '../config/s3';
import { log } from 'console';
import Screenshot from '../models/screenshot.model';
import { authMiddleware } from '../middlewares/auth.middleware';
// Define interface to extend Express Request
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

// Configure multer for file uploads
const upload = multer({ 
    dest: 'uploads/' // Temporary storage
});

class ScreenshotController extends Controller {
    constructor() {
        super();
        this.initRoutes();
    }
    
    private initRoutes() {
        this.router.post('/upload',authMiddleware, upload.single('screenshot'), this.screenshotUpload);
    }

    private screenshotUpload = async (req: MulterRequest, res: Response): Promise<void> => {
        try {
            // Check if we have a file
            if (!req.file) {
                res.status(httpStatus.BAD_REQUEST).json({ message: 'No file uploaded' });
                return;
            }
            
            const minioClient = new Minio.Client({
                endPoint: MINIO_ENDPOINT as string,
                port: Number(MINIO_PORT),
                useSSL: false,
                accessKey: MINIO_ACCESS_KEY_ID,
                secretKey: MINIO_SECRET_ACCESS_KEY,
            });

            const bucket = MINIO_BUCKET as string;

            // Check if the bucket exists
            const exists = await minioClient.bucketExists(bucket);
            if (!exists) {
                await minioClient.makeBucket(bucket, MINIO_DEFAULT_REGION || 'us-east-1');
                console.log(`Bucket ${bucket} created in "${MINIO_DEFAULT_REGION || 'us-east-1'}"`);
            }

            // Generate a unique filename
            const timestamp = Date.now();
            const fileExtension = path.extname(req.file.originalname);
            const destinationObject = `screenshots/${timestamp}${fileExtension}`;
            const sourceFile = req.file.path;

            // Upload the file to Minio
            await minioClient.fPutObject(bucket, destinationObject, sourceFile);
            
            // Clean up temporary file
            fs.unlinkSync(sourceFile);
            
            // Construct the file URL - fixing the URL construction
            const protocol = 'http'; // or 'https' depending on your setup
            const fileUrl = `${protocol}://${MINIO_ENDPOINT}${MINIO_PORT ? ':' + MINIO_PORT : ''}/${bucket}/${destinationObject}`;
            
            await Screenshot.create({
                timestamp: Date.now(), // Using timestamp as number (milliseconds since epoch)
                user_id: req.body.user_id,
                screenshot: destinationObject
            });
            
            res.status(httpStatus.OK).json({ 
                message: 'File uploaded successfully',
                fileUrl: fileUrl
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
                message: 'Failed to upload file',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
}

export default new ScreenshotController().router;