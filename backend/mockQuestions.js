// Mock questions for testing without Firebase
const mockQuestions = [
  {
    id: '1',
    text: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswerIndex: 2,
    category: 'Geography',
    explanation: 'Paris has been the capital of France since the 12th century.'
  },
  {
    id: '2',
    text: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswerIndex: 1,
    category: 'Science',
    explanation: 'Mars appears red due to iron oxide on its surface.'
  },
  {
    id: '3',
    text: 'Who painted the Mona Lisa?',
    options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'],
    correctAnswerIndex: 2,
    category: 'Art',
    explanation: 'Leonardo da Vinci painted the Mona Lisa between 1503-1519.'
  },
  {
    id: '4',
    text: 'What is the largest mammal in the world?',
    options: ['African Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'],
    correctAnswerIndex: 1,
    category: 'Nature',
    explanation: 'The blue whale can reach up to 100 feet in length and weigh 200 tons.'
  },
  {
    id: '5',
    text: 'Which programming language was created by Brendan Eich?',
    options: ['Python', 'Java', 'JavaScript', 'C++'],
    correctAnswerIndex: 2,
    category: 'Technology',
    explanation: 'JavaScript was created by Brendan Eich in 1995 for Netscape.'
  },
  {
    id: '6',
    text: 'What is the smallest country in the world?',
    options: ['Monaco', 'Vatican City', 'Liechtenstein', 'San Marino'],
    correctAnswerIndex: 1,
    category: 'Geography',
    explanation: 'Vatican City covers only 0.17 square miles.'
  },
  {
    id: '7',
    text: 'Which element has the chemical symbol "Au"?',
    options: ['Silver', 'Gold', 'Aluminum', 'Argon'],
    correctAnswerIndex: 1,
    category: 'Science',
    explanation: 'Au comes from the Latin word "aurum" meaning gold.'
  },
  {
    id: '8',
    text: 'Who wrote "Romeo and Juliet"?',
    options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
    correctAnswerIndex: 1,
    category: 'Literature',
    explanation: 'William Shakespeare wrote Romeo and Juliet in the 1590s.'
  },
  {
    id: '9',
    text: 'What is the speed of light in a vacuum?',
    options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'],
    correctAnswerIndex: 0,
    category: 'Science',
    explanation: 'Light travels at approximately 299,792,458 meters per second in a vacuum.'
  },
  {
    id: '10',
    text: 'Which ocean is the largest?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    correctAnswerIndex: 3,
    category: 'Geography',
    explanation: 'The Pacific Ocean covers more than 30% of Earth\'s surface.'
  }
];

module.exports = mockQuestions;

