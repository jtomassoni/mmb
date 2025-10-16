# Backup & Recovery System

This document describes the backup and recovery system for Monaghan's Bar & Grill website.

## Overview

The backup system provides automated and manual backup capabilities for:
- **Database**: SQLite database with all application data
- **Media Files**: Images, uploads, and other static assets
- **Storage**: Cloud storage (AWS S3 or Backblaze B2)

## Configuration

### Environment Variables

Set these variables in your `.env.local` file:

```bash
# Backup Provider (s3 or backblaze)
BACKUP_PROVIDER=s3

# S3 Configuration
BACKUP_BUCKET=your-backup-bucket
BACKUP_REGION=us-east-1
BACKUP_ACCESS_KEY_ID=your-access-key
BACKUP_SECRET_ACCESS_KEY=your-secret-key

# For Backblaze B2 (optional)
BACKUP_ENDPOINT=https://s3.us-west-004.backblazeb2.com

# Cron Job Security
CRON_SECRET=your-secure-random-string
```

### AWS S3 Setup

1. Create an S3 bucket for backups
2. Create an IAM user with the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-backup-bucket",
        "arn:aws:s3:::your-backup-bucket/*"
      ]
    }
  ]
}
```

### Backblaze B2 Setup

1. Create a Backblaze B2 bucket
2. Generate an application key with read/write permissions
3. Set the endpoint URL in `BACKUP_ENDPOINT`

## Usage

### Manual Backups

#### Web Interface
1. Navigate to `/admin/backup` (SUPERADMIN only)
2. Click "Create New Backup"
3. Monitor progress and view backup details

#### CLI Commands

```bash
# Create a backup
npm run backup:create

# List available backups
npm run backup:list

# Restore from specific backup
npm run backup:restore <backup-id>

# Restore from latest backup
npm run backup:latest
```

### Automated Backups

#### Cron Job Setup

Add to your crontab for nightly backups at 2 AM:

```bash
0 2 * * * curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://your-domain.com/api/cron/backup
```

#### Vercel Cron Jobs

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/backup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

## Backup Structure

Each backup contains:

```
backup-YYYY-MM-DDTHH-mm-ss/
├── manifest.json          # Backup metadata
├── database.sqlite        # SQLite database file
├── database.sql          # SQL dump (if available)
└── media/
    ├── pics/             # Restaurant images
    ├── uploads/          # User uploads
    └── media/            # Other media files
```

### Manifest Format

```json
{
  "backupId": "backup-2025-09-19T06-45-00-000Z",
  "timestamp": "2025-09-19T06:45:00.000Z",
  "database": "database.sqlite",
  "media": "media",
  "version": "1.0"
}
```

## Recovery Procedures

### Full System Recovery

1. **Stop the application**
2. **Restore database**: Replace `prisma/dev.db` with backup file
3. **Restore media**: Replace `public/pics`, `public/uploads`, `public/media`
4. **Restart the application**

### Using CLI

```bash
# List available backups
npm run backup:list

# Restore from specific backup
npm run backup:restore backup-2025-09-19T06-45-00-000Z

# Restore from latest backup
npm run backup:latest --force
```

### Using Web Interface

1. Navigate to `/admin/backup`
2. Find the desired backup
3. Click "Restore" button
4. Confirm the action

## Disaster Recovery Drill

Run the disaster recovery drill to test your backup system:

```bash
npm run disaster-drill
```

This will:
1. Verify backup system connectivity
2. Create a test backup
3. Simulate data loss
4. Restore from backup
5. Verify data integrity
6. Clean up test data

**⚠️ Warning**: The drill will temporarily delete all data during testing.

## Monitoring

### Backup Logs

All backup operations are logged in the `AuditLog` table:

- `backup_created`: Successful backup creation
- `backup_failed`: Failed backup attempt
- `backup_restored`: Successful restore operation
- `backup_error`: System errors during backup operations

### Health Checks

Monitor backup health by checking:

1. **Recent backups**: Ensure backups are created regularly
2. **Backup size**: Monitor for unusual size changes
3. **Restore tests**: Periodically test restore functionality

## Security Considerations

### Access Control

- Only SUPERADMIN users can manage backups
- Cron jobs require authentication via `CRON_SECRET`
- Backup files are encrypted in transit and at rest

### Data Protection

- Backup files contain sensitive data
- Ensure proper access controls on cloud storage
- Consider encryption for backup files
- Regularly rotate access keys

## Troubleshooting

### Common Issues

#### "Backup configuration is incomplete"
- Verify all required environment variables are set
- Check that cloud storage credentials are valid

#### "Database file not found"
- Ensure the application database exists
- Run `npx prisma migrate dev` to create the database

#### "Failed to upload to cloud storage"
- Check network connectivity
- Verify cloud storage credentials
- Ensure bucket exists and is accessible

#### "Restore failed"
- Verify backup file integrity
- Check that backup is not corrupted
- Ensure sufficient disk space

### Recovery from Backup Failures

1. **Check logs**: Review `AuditLog` entries for error details
2. **Verify connectivity**: Test cloud storage access
3. **Manual backup**: Create manual backup if automated system fails
4. **Contact support**: If issues persist, contact system administrator

## Best Practices

### Backup Frequency

- **Production**: Daily automated backups
- **Staging**: Weekly backups
- **Development**: Manual backups before major changes

### Retention Policy

- **Daily backups**: Keep for 30 days
- **Weekly backups**: Keep for 12 weeks
- **Monthly backups**: Keep for 12 months

### Testing

- **Monthly**: Run disaster recovery drill
- **Quarterly**: Test restore procedures
- **Annually**: Review backup strategy and update documentation

### Documentation

- Keep this document updated
- Document any custom backup procedures
- Maintain contact information for recovery support
