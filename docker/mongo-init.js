// MongoDB initialization script
// Creates indexes for better performance

db = db.getSiblingDB('taskflow');

db.users.createIndex({ email: 1 }, { unique: true });
db.tasks.createIndex({ title: 'text', description: 'text' });
db.tasks.createIndex({ project: 1, status: 1 });
db.tasks.createIndex({ assignee: 1 });
db.tasks.createIndex({ dueDate: 1 });
db.projects.createIndex({ owner: 1 });
db.projects.createIndex({ 'members.user': 1 });

print('✅ TaskFlow database initialized with indexes');
