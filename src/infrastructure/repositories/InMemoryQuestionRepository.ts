import { Question, QuestionData } from '../../domain/entities/Question'
import { QuestionRepository } from '../../domain/ports/QuestionRepository'

const DEMO_QUESTIONS: QuestionData[] = [
  {
    id: '1',
    text: 'Quelle est la capitale de la France ?',
    correctAnswer: 'Paris',
    category: 'Géographie'
  },
  {
    id: '2',
    text: 'En quelle année a eu lieu la Révolution française ?',
    correctAnswer: '1789',
    category: 'Histoire'
  },
  {
    id: '3',
    text: 'Qui a écrit "Les Misérables" ?',
    correctAnswer: 'Victor Hugo',
    category: 'Littérature'
  },
  {
    id: '4',
    text: 'Quelle est la formule chimique de l\'eau ?',
    correctAnswer: 'H2O',
    category: 'Sciences'
  },
  {
    id: '5',
    text: 'Combien de joueurs composent une équipe de football sur le terrain ?',
    correctAnswer: '11',
    category: 'Sport'
  },
  {
    id: '6',
    text: 'Quel est le plus grand océan du monde ?',
    correctAnswer: 'Océan Pacifique',
    category: 'Géographie'
  },
  {
    id: '7',
    text: 'Qui a peint la Joconde ?',
    correctAnswer: 'Léonard de Vinci',
    category: 'Arts'
  },
  {
    id: '8',
    text: 'Quelle planète est surnommée la "planète rouge" ?',
    correctAnswer: 'Mars',
    category: 'Sciences'
  },
  {
    id: '9',
    text: 'Dans quel pays se trouve Machu Picchu ?',
    correctAnswer: 'Pérou',
    category: 'Géographie'
  },
  {
    id: '10',
    text: 'Combien y a-t-il de cordes sur une guitare classique ?',
    correctAnswer: '6',
    category: 'Arts'
  },
  {
    id: '11',
    text: 'Quel est l\'élément chimique dont le symbole est "Au" ?',
    correctAnswer: 'Or',
    category: 'Sciences'
  },
  {
    id: '12',
    text: 'En quelle année l\'homme a-t-il marché sur la Lune pour la première fois ?',
    correctAnswer: '1969',
    category: 'Histoire'
  },
  {
    id: '13',
    text: 'Quelle est la monnaie officielle du Japon ?',
    correctAnswer: 'Yen',
    category: 'Culture générale'
  },
  {
    id: '14',
    text: 'Combien de minutes y a-t-il dans une heure ?',
    correctAnswer: '60',
    category: 'Culture générale'
  },
  {
    id: '15',
    text: 'Quel sport pratique-t-on à Wimbledon ?',
    correctAnswer: 'Tennis',
    category: 'Sport'
  }
]

export class InMemoryQuestionRepository implements QuestionRepository {
  private questions: Question[]

  constructor() {
    this.questions = DEMO_QUESTIONS.map(data => Question.create(data))
  }

  async getRandomQuestions(count: number, category?: string): Promise<Question[]> {
    let availableQuestions = this.questions
    
    if (category) {
      availableQuestions = this.questions.filter(q => q.getCategory() === category)
    }

    const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.min(count, shuffled.length))
  }

  async findById(id: string): Promise<Question | null> {
    return this.questions.find(q => q.getId() === id) || null
  }

  async getAllCategories(): Promise<string[]> {
    const categories = new Set(this.questions.map(q => q.getCategory()))
    return Array.from(categories)
  }
}