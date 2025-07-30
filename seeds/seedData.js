require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    
    // Create users
    const users = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'client',
        company: 'Tech Corp',
        phoneNumber: '+1234567890',
        isEmailVerified: true
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'developer',
        bio: 'Full-stack developer with 5+ years experience',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python'],
        hourlyRate: 50,
        experience: 'expert',
        portfolio: 'https://janesmith.dev',
        rating: 4.8,
        totalRatings: 25,
        completedProjects: 30,
        isEmailVerified: true
      },
      {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@example.com',
        password: 'password123',
        role: 'developer',
        bio: 'Mobile app developer specializing in React Native',
        skills: ['React Native', 'JavaScript', 'iOS', 'Android'],
        hourlyRate: 45,
        experience: 'intermediate',
        portfolio: 'https://bobjohnson.dev',
        rating: 4.5,
        totalRatings: 18,
        completedProjects: 22,
        isEmailVerified: true
      },
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@skillsync.com',
        password: 'admin123',
        role: 'admin',
        isEmailVerified: true
      }
    ];
    
    const createdUsers = await User.create(users);
    console.log('Users created:', createdUsers.length);
    
    // Create jobs
    const jobs = [
      {
        title: 'Build E-commerce Website',
        description: 'Looking for a full-stack developer to build a modern e-commerce website with React and Node.js. The website should include user authentication, product catalog, shopping cart, and payment integration.',
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express.js', 'JavaScript'],
        budget: 2500,
        budgetType: 'fixed',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        experienceLevel: 'intermediate',
        client: createdUsers[0]._id,
        category: 'web-development',
        estimatedDuration: '2-4-weeks'
      },
      {
        title: 'Mobile App Development',
        description: 'Need a React Native developer to create a cross-platform mobile app for food delivery. The app should have real-time tracking, payment integration, and push notifications.',
        requiredSkills: ['React Native', 'JavaScript', 'Firebase', 'Redux'],
        budget: 40,
        budgetType: 'hourly',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        experienceLevel: 'expert',
        client: createdUsers[0]._id,
        category: 'mobile-development',
        estimatedDuration: '1-2-months'
      }
    ];
    
    const createdJobs = await Job.create(jobs);
    console.log('Jobs created:', createdJobs.length);
    
    // Create applications
    const applications = [
      {
        job: createdJobs[0]._id,
        developer: createdUsers[1]._id,
        coverLetter: 'I am excited to work on your e-commerce project. With my 5+ years of experience in full-stack development, I can deliver a high-quality solution that meets all your requirements.',
        proposedRate: 2200,
        estimatedDuration: '3 weeks',
        portfolio: [
          {
            title: 'E-commerce Dashboard',
            url: 'https://demo.ecommerce.com',
            description: 'Admin dashboard for managing products and orders'
          }
        ]
      },
      {
        job: createdJobs[1]._id,
        developer: createdUsers[2]._id,
        coverLetter: 'I have extensive experience in React Native development and have built several food delivery apps. I can ensure your app is performant and user-friendly.',
        proposedRate: 35,
        estimatedDuration: '6 weeks',
        portfolio: [
          {
            title: 'Food Delivery App',
            url: 'https://github.com/bob/food-app',
            description: 'React Native app with real-time tracking'
          }
        ]
      }
    ];
    
    const createdApplications = await Application.create(applications);
    console.log('Applications created:', createdApplications.length);
    
    // Update jobs with applications
    await Job.findByIdAndUpdate(createdJobs[0]._id, {
      $push: { applications: createdApplications[0]._id }
    });
    
    await Job.findByIdAndUpdate(createdJobs[1]._id, {
      $push: { applications: createdApplications[1]._id }
    });
    
    console.log('Seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed data error:', error);
    process.exit(1);
  }
};

connectDB().then(() => {
  seedData();
});
