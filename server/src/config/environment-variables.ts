export enum ENV {
    NODE_ENV = 'dev',   // should be 'dev' or 'prod'

    DEV_LOCAL_MONGODB_URI = 'mongodb://127.0.0.1:27017/technocracy',
    DEV_AWS_MONGODB_URI = '',
    PROD_DO_MONGODB_URI = '',

    CLOUD_IMAGE_PATH = '',

    MAIL_HOST = '',
    MAIL_SERVICE = '',
    ADMIN_MAIL_ID = '',
    ADMIN_MAIL_SECRET = '',

    JWT_SECRET = '',
}