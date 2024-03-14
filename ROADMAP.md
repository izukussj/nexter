# Nexter - Roadmap des fonctionnalités

## ✅ V1.0 - MVP (Terminé)
- [x] Setup Next.js + TypeScript + Tailwind
- [x] Base de données PostgreSQL + Prisma
- [x] Authentification (register/login)
- [x] Page d'accueil avec sélection de modes
- [x] Quickplay Fun (lobby + jeu temps réel)
- [x] Socket.IO + logique de jeu complète
- [x] Questions de démonstration (15)
- [x] Dashboard utilisateur basique
- [x] Système de scoring avec bonus temps

## 🚧 V1.1 - Quickplay Compétitif (Priorité)
- [ ] **Lobby Quickplay Compétitif**
  - Copie du lobby Fun mais auth obligatoire
  - Affichage ELO des joueurs
  - Matchmaking basé sur ELO (±200 points)
  
- [ ] **Système ELO**
  - Calcul ELO après chaque partie compétitive
  - Sauvegarde en base de données
  - Affichage des gains/pertes ELO
  
- [ ] **Améliorations Dashboard**
  - Historique des parties jouées
  - Graphique d'évolution ELO
  - Statistiques détaillées (winrate, catégories favorites)

## 🎯 V1.2 - Gestion des Questions (Priorité)
- [ ] **Interface de création de questions**
  - Formulaire avec texte, réponse, catégorie
  - Support upload d'images
  - Preview de la question
  
- [ ] **Système de modération**
  - Interface admin pour valider questions
  - Page d'administration (/admin)
  - Statuts : pending, approved, rejected
  
- [ ] **Base de questions élargie**
  - Migration questions démo vers vraie DB
  - API pour récupérer questions approuvées
  - Catégorisation plus fine

## 🏆 V1.3 - Système de Compétitions
- [ ] **Création de compétitions**
  - Interface pour créer tournois
  - Configuration : dates, participants max, questions
  - Types : élimination, round-robin, bracket
  
- [ ] **Participation aux compétitions**
  - Liste des compétitions ouvertes
  - Inscription/désinscription
  - Planning des matches
  
- [ ] **Gestion des tournois**
  - Système de brackets automatique
  - Résultats et classements
  - Récompenses (badges, titres)

## 🎨 V1.4 - UX/UI Améliorations
- [ ] **Responsive design**
  - Optimisation mobile/tablet
  - Adaptation des interfaces de jeu
  
- [ ] **Animations & Feedback**
  - Animations de transition
  - Effets sonores (optionnels)
  - Notifications push-like
  
- [ ] **Thèmes visuels**
  - Mode sombre/clair
  - Personnalisation couleurs
  
## ⚡ V1.5 - Performance & Features Avancées
- [ ] **Cache et optimisations**
  - Redis pour sessions Socket.IO
  - Cache questions fréquentes
  - Optimisation requêtes DB
  
- [ ] **Features sociales**
  - Système d'amis
  - Chat dans les lobbys
  - Partage de résultats
  
- [ ] **Statistiques avancées**
  - Analytics de jeu
  - Métriques par catégorie
  - Temps de réponse moyen

## 🔧 V1.6 - Outils Admin & Modération
- [ ] **Panel d'administration**
  - Gestion des utilisateurs
  - Modération du contenu
  - Statistiques plateforme
  
- [ ] **Système de rapports**
  - Signalement questions inappropriées
  - Modération communautaire
  
- [ ] **Backup & Monitoring**
  - Sauvegarde automatique DB
  - Monitoring performances
  - Logs structurés

## 🌟 V2.0 - Features Premium (Futur)
- [ ] **Monétisation**
  - Comptes premium
  - Cosmétiques (avatars, badges)
  - Battle pass saisonnier
  
- [ ] **IA & Génération**
  - Questions générées par IA
  - Difficulté adaptative
  - Recommandations personnalisées
  
- [ ] **Multi-platform**
  - API mobile
  - Progressive Web App
  - Notifications push

---

## 📋 Tâches techniques transversales
- [ ] Tests unitaires et d'intégration
- [ ] Documentation API
- [ ] CI/CD pipeline
- [ ] Monitoring et alertes
- [ ] Optimisation SEO
- [ ] Accessibilité (a11y)

## 🐛 Bugs & Améliorations connues
- [ ] Gestion déconnexion en cours de partie
- [ ] Validation robuste des réponses (accents, casse)
- [ ] Limite de joueurs par lobby (anti-spam)
- [ ] Timeout questions trop long en cas de lag
- [ ] Interface loading plus fluide

---

**Prochaine priorité : V1.1 - Quickplay Compétitif**
Objectif : Avoir un système compétitif fonctionnel avec ELO