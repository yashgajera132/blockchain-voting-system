// Check for this issue in app.js:
// app.use('/api/api/elections', electionRoutes); 
// And change to:
// app.use('/api/elections', electionRoutes);
// 
// Also make sure verification routes exist:
// app.use('/api/verification', verificationRoutes); 