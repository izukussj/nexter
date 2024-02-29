from flask import Flask, render_template, request, session, redirect
import json

app = Flask(__name__, template_folder='templates')
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

def parse_questions_from_json(json_file):
    with open(json_file, 'r') as file:
        data = json.load(file)
    
    questions = []
    for item in data:
        question = item.get("question")
        reponse = item.get("reponse")
        questions.append({"question": question, "reponse": reponse})
    
    return questions

# Chemin vers le fichier JSON contenant les questions
json_file = "questions.json"
questions = parse_questions_from_json(json_file)

@app.route('/')
def index():
    # Récupérer l'indice de la question actuelle dans la session
    current_question_index = session.get('current_question_index', 0)
    if current_question_index >= len(questions):
        return "Fin de la partie! Votre score est : {}".format(session.get('score', 0))
    
    question = questions[current_question_index]
    result = session.pop('result', None)
    return render_template('index.html', question=question, result=result)

@app.route('/submit_answer', methods=['POST'])
def submit_answer():
    user_answer = request.form['user_answer']
    current_question_index = session.get('current_question_index', 0)
    
    if current_question_index >= len(questions):
        return "Fin de la partie! Votre score est : {}".format(session.get('score', 0))
    
    current_question = questions[current_question_index]
    is_correct = user_answer.lower() == current_question['reponse'].lower()
    
    if is_correct:
        session['score'] = session.get('score', 0) + 1
        session['result'] = None
    else:
        session['result'] = current_question['reponse']
    
    session['current_question_index'] = current_question_index + 1
    
    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True)
