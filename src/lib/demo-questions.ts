export const demoQuestions = [
  {
    id: '1',
    text: 'Quelle est la capitale de la France ?',
    answer: 'Paris',
    category: 'Géographie',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '2',
    text: 'En quelle année a eu lieu la Révolution française ?',
    answer: '1789',
    category: 'Histoire',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '3',
    text: 'Qui a écrit "Les Misérables" ?',
    answer: 'Victor Hugo',
    category: 'Littérature',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '4',
    text: 'Quelle est la formule chimique de l\'eau ?',
    answer: 'H2O',
    category: 'Sciences',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '5',
    text: 'Combien de joueurs composent une équipe de football sur le terrain ?',
    answer: '11',
    category: 'Sport',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '6',
    text: 'Quel est le plus grand océan du monde ?',
    answer: 'Océan Pacifique',
    category: 'Géographie',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '7',
    text: 'Qui a peint la Joconde ?',
    answer: 'Léonard de Vinci',
    category: 'Arts',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '8',
    text: 'Quelle planète est surnommée la "planète rouge" ?',
    answer: 'Mars',
    category: 'Sciences',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '9',
    text: 'Dans quel pays se trouve Machu Picchu ?',
    answer: 'Pérou',
    category: 'Géographie',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '10',
    text: 'Combien y a-t-il de cordes sur une guitare classique ?',
    answer: '6',
    category: 'Arts',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '11',
    text: 'Quel est l\'élément chimique dont le symbole est "Au" ?',
    answer: 'Or',
    category: 'Sciences',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '12',
    text: 'En quelle année l\'homme a-t-il marché sur la Lune pour la première fois ?',
    answer: '1969',
    category: 'Histoire',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '13',
    text: 'Quelle est la monnaie officielle du Japon ?',
    answer: 'Yen',
    category: 'Culture générale',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '14',
    text: 'Combien de minutes y a-t-il dans une heure ?',
    answer: '60',
    category: 'Culture générale',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '15',
    text: 'Quel sport pratique-t-on à Wimbledon ?',
    answer: 'Tennis',
    category: 'Sport',
    imageUrl: null,
    videoUrl: null
  }
]

export const getRandomQuestions = (count: number = 5) => {
  const shuffled = [...demoQuestions].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}