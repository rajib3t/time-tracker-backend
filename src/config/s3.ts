import { config } from 'dotenv';
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
config({ path: envFile });

export const {
    MINIO_ACCESS_KEY_ID,
    MINIO_SECRET_ACCESS_KEY,
    MINIO_DEFAULT_REGION,
    MINIO_BUCKET,
    MINIO_USE_PATH_STYLE_ENDPOINT,
    MINIO_ENDPOINT,
    MINIO_PORT
} = process.env;

