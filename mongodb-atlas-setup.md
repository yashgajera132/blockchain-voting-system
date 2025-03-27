# Setting Up MongoDB Atlas for Production Deployment

This guide explains how to set up MongoDB Atlas for your blockchain voting system's production environment.

## Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and click "Try Free"
2. Sign up with your email or use Google/GitHub sign-in options
3. Fill in the required information to create your account

## Step 2: Create a New Project

1. Once logged in, create a new project by clicking on "New Project"
2. Name your project (e.g., "Blockchain Voting System")
3. Add project members if needed (optional)
4. Click "Create Project"

## Step 3: Create a Cluster

1. Click "Build a Database" within your new project
2. Choose a plan:
   - **Shared (Free)**: Good for development and small-scale applications
   - **Dedicated**: Better for production use cases with higher demands
   - **Serverless**: Pay only for what you use (good option for variable workloads)

3. For a free tier cluster:
   - Select "Shared" option
   - Select cloud provider and region (choose a region close to your server location)
   - Select "M0" tier (Free)
   - Name your cluster (e.g., "blockchain-voting-cluster")
   - Click "Create Cluster"

4. For a production deployment:
   - Select "Dedicated" option
   - Choose cloud provider and region
   - Select appropriate tier based on expected load (M10+ recommended)
   - Configure cluster specs (storage, RAM, backup options)
   - Click "Create Cluster"

## Step 4: Set Up Database Access

1. While your cluster is being created, click on "Database Access" from the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication method
4. Create a secure username and password
   - **Important**: Do not use special characters in the username
   - Generate a strong password (you'll need this for your connection string)
5. Set appropriate database user privileges:
   - For production: Select "Read and Write to Any Database"
   - For more security: Select specific database access
6. Click "Add User"

## Step 5: Configure Network Access

1. Click on "Network Access" from the left sidebar
2. Click "Add IP Address"
3. For development, you can select "Allow Access from Anywhere" (not recommended for production)
4. For production:
   - Add the IP addresses of your deployment servers
   - If using Heroku or similar services with dynamic IPs, you may need to allow all IPs (0.0.0.0/0)
   - If possible, use VPC peering for more secure connectivity
5. Click "Confirm"

## Step 6: Get Your Connection String

1. Once your cluster is ready, click "Connect"
2. Select "Connect your application"
3. Select your driver and version (Node.js, latest version)
4. Copy the connection string
5. Replace `<password>` with the password you created for your database user
6. Replace `<dbname>` with your database name (e.g., "blockchain-voting")

Example connection string:
```
mongodb+srv://username:<password>@blockchain-voting-cluster.mongodb.net/blockchain-voting?retryWrites=true&w=majority
```

## Step 7: Configure Your Application

1. Add the connection string to your application's environment variables:
   - For Heroku: `heroku config:set MONGODB_URI=your_connection_string`
   - For other deployments: Update the appropriate .env file

2. Test the connection:
   ```javascript
   // Sample Node.js code to test connection
   const mongoose = require('mongoose');
   
   mongoose.connect(process.env.MONGODB_URI)
     .then(() => console.log('MongoDB Atlas connected successfully'))
     .catch(err => console.error('MongoDB connection error:', err));
   ```

## Step 8: Backup and Security Settings (Production)

1. **Enable Automated Backups**:
   - Go to cluster settings
   - Enable "Continuous Backup" for production clusters
   - Set appropriate backup schedule and retention policy

2. **Enable Advanced Security**:
   - In Security tab, enable "Advanced Security Features" 
   - Consider enabling "Client-Side Field Level Encryption" for sensitive data
   - Set up database auditing for compliance

3. **Performance Optimization**:
   - Set up MongoDB Atlas Performance Advisor
   - Configure Atlas Data Explorer to monitor queries

## Step 9: Monitoring and Alerts

1. **Set Up Monitoring**:
   - Go to "Monitoring" tab in your cluster
   - Review metrics for CPU usage, operations, connections, etc.

2. **Configure Alerts**:
   - Go to "Alerts" in the left sidebar
   - Set up alerts for critical metrics:
     - High CPU/memory usage
     - Connection pool saturation
     - Slow queries
     - Replica set issues

3. **Integrate with External Monitoring**:
   - Connect MongoDB Atlas to services like DataDog or New Relic
   - Set up Slack or email notifications

## Step 10: Scaling Considerations

For future scaling of your blockchain voting system:

1. **Horizontal Scaling**:
   - Increase the number of shards in your MongoDB Atlas cluster
   - This helps distribute data across multiple servers

2. **Vertical Scaling**:
   - Upgrade to a higher tier with more RAM and CPU
   - Useful for handling increased query complexity

3. **Read Scaling**:
   - Add read-only replicas for distributing read operations
   - Configure your connection string to use readPreference

## Troubleshooting Common Issues

1. **Connection Timeout**:
   - Check IP whitelist settings
   - Verify network configuration
   - Ensure your database user has correct permissions

2. **Authentication Failed**:
   - Verify username and password in connection string
   - Check if the user exists and has appropriate permissions

3. **Slow Queries**:
   - Use MongoDB Atlas Performance Advisor
   - Check indexing strategy
   - Review query patterns in your application

## Best Practices for Production

1. **Connection Pooling**:
   - Use connection pooling in your application
   - Set appropriate min/max pool size based on expected load

2. **Indexing Strategy**:
   - Create appropriate indexes for frequently queried fields
   - Avoid over-indexing as it affects write performance

3. **Regular Monitoring**:
   - Regularly review MongoDB Atlas metrics
   - Check for slow queries and optimize them

4. **Data Backup**:
   - Regularly test database restoration process
   - Keep backup copies in different geographical locations

5. **Security**:
   - Regularly rotate database credentials
   - Use MongoDB Atlas private endpoints where possible 