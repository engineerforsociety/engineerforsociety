import type { UserProfile, JobPosting } from "@/ai/flows/match-jobs-to-profile";

export const sampleUserProfile: UserProfile = {
  name: 'Alex Doe',
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'Machine Learning', 'Project Management'],
  experience: '5+ years as a full-stack developer, with a focus on building scalable web applications. Led a team to develop a real-time data processing pipeline using Kafka and Flink. Passionate about open-source and mentoring junior developers.',
  interests: 'Sustainable technology, ethical AI, contributing to open-source projects, and urban planning.',
};

export const sampleJobPostings: JobPosting[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    description: 'Join our team to build a next-generation design platform. You will be responsible for creating a beautiful and intuitive user interface with React and TypeScript.',
    requirements: '5+ years of experience with React, TypeScript, and modern frontend frameworks. Strong understanding of UI/UX principles.',
  },
  {
    id: 'job-2',
    title: 'AI/ML Engineer for Social Good',
    description: 'We are a non-profit seeking a talented ML engineer to work on projects related to climate change and public health. You will develop models to analyze large datasets and drive impactful decisions.',
    requirements: 'Strong background in Python, TensorFlow/PyTorch, and data science. Experience with geospatial data is a plus. A passion for social impact is a must.',
  },
  {
    id: 'job-3',
    title: 'Backend Developer (Node.js)',
    description: 'We are scaling our microservices architecture and need a skilled Node.js developer to help build and maintain our core services. You will work with a talented team of engineers in a fast-paced environment.',
    requirements: '3+ years of experience with Node.js, Express/Fastify, and working with databases like PostgreSQL and Redis. Experience with Docker and Kubernetes is desired.',
  },
  {
    id: 'job-4',
    title: 'Engineering Manager',
    description: 'Lead a team of talented software engineers, providing technical guidance and mentorship. You will be responsible for project planning, execution, and stakeholder communication.',
    requirements: '8+ years of software development experience, with at least 2 years in a leadership or management role. Excellent project management and communication skills.',
  },
];
