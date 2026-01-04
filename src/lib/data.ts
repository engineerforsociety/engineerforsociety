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

export const sampleForumPosts = [
  {
    id: 'post-1',
    author: {
      name: 'Dr. Evelyn Reed',
      title: 'Quantum Computing Researcher',
      avatarId: 'podcast-1'
    },
    createdAt: '2h ago',
    title: 'The Ethical Implications of Advanced AI',
    content: 'As AI models become more powerful, we need to have a serious conversation about the ethical guardrails. What are your thoughts on creating a Hippocratic oath for AI developers?',
    tags: ['AI Ethics', 'Philosophy', 'Future of Tech'],
    likeCount: 128,
    commentCount: 42,
  },
  {
    id: 'post-2',
    author: {
      name: 'Ben Carter',
      title: 'DevOps Engineer',
      avatarId: 'podcast-2'
    },
    createdAt: '5h ago',
    title: 'My Favorite CI/CD Pipeline Setup for Next.js',
    content: 'After trying a dozen tools, I\'ve settled on a combo of GitHub Actions, Docker, and Vercel for my Next.js projects. It\'s fast, reliable, and has a great developer experience. Here is a quick rundown of my config...',
    tags: ['Next.js', 'DevOps', 'Web Development'],
    likeCount: 76,
    commentCount: 15,
  },
  {
    id: 'post-3',
    author: {
      name: 'Samantha Chen',
      title: 'Environmental Engineer',
      avatarId: 'podcast-3'
    },
    createdAt: '1d ago',
    title: 'New Bioplastics That Could Reduce Ocean Pollution',
    content: 'Exciting news from my lab! We\'ve developed a new type of bioplastic derived from algae that degrades in saltwater within 90 days. This could be a game-changer for reducing plastic waste in our oceans.',
    tags: ['Sustainability', 'Materials Science', 'Environment'],
    likeCount: 543,
    commentCount: 112,
  }
];


export const sampleUsersToFollow = [
    {
        id: 'user-1',
        name: 'Jane Doe',
        title: 'Lead ML Engineer @ Innovate AI',
        avatarId: 'mentorship'
    },
    {
        id: 'user-2',
        name: 'Carlos Gomez',
        title: 'Founder, CleanWater Collective',
        avatarId: 'skills-exchange'
    },
    {
        id: 'user-3',
        name: 'Aisha Khan',
        title: 'Robotics Engineer',
        avatarId: 'profile-pic'
    }
]

export const sampleTrendingTopics = ['#SustainableTech', '#GenAI', '#CareerAdvice', '#ProjectManagement', '#Web3'];

export const sampleProjects = [
  {
    id: 'proj-1',
    title: 'Community Garden Automation',
    description: 'An IoT system to monitor and automate watering for urban community gardens.',
    technologies: ['IoT', 'Python', 'React', 'Firebase'],
    owner: { name: 'Samantha Chen', avatarId: 'podcast-3' },
    isSeekingCollaborators: true,
    likeCount: 152,
    viewCount: 2340,
    imageId: 'project-1'
  },
  {
    id: 'proj-2',
    title: 'Open Source Braille Reader',
    description: 'A low-cost, 3D-printable Braille e-reader for visually impaired individuals.',
    technologies: ['3D Printing', 'C++', 'Hardware'],
    owner: { name: 'Alex Doe', avatarId: 'profile-pic' },
    isSeekingCollaborators: false,
    likeCount: 341,
    viewCount: 5120,
    imageId: 'project-2'
  },
  {
    id: 'proj-3',
    title: 'AI-Powered Fake News Detector',
    description: 'A browser extension that uses natural language processing to detect misinformation in real-time.',
    technologies: ['AI/ML', 'TensorFlow', 'JavaScript'],
    owner: { name: 'Jane Doe', avatarId: 'mentorship' },
    isSeekingCollaborators: true,
    likeCount: 218,
    viewCount: 4890,
    imageId: 'project-3'
  }
];
