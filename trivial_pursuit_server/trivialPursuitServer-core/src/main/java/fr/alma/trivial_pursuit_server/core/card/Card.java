package fr.alma.trivial_pursuit_server.core.card;

import fr.alma.trivial_pursuit_server.exception.CardException;
import fr.alma.trivial_pursuit_server.util.Theme;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "CARD")
@NoArgsConstructor
@Getter
@Setter
public class Card {

    @Id
    @GeneratedValue
    private Long id;

    @OneToMany(mappedBy = "questionCard", cascade = CascadeType.PERSIST)
    private List<Question> questions = new ArrayList<>();

    @OneToMany(mappedBy = "answerCard", cascade = CascadeType.PERSIST)
    private List<Answer> answers = new ArrayList<>();
    private Boolean isPicked = false;


    public Card(List<Question> questions, List<Answer> answers) throws CardException {
        setQuestions(questions);
        setAnswers(answers);
    }


    /**
     * Setter on the field questions.
     * Check if the parameter is not null and that it contain exactly 6 questions
     * @param questions the list of six elements
     * @throws CardException if the parameter does not respect the specification
     */
    public void setQuestions(List<Question> questions) throws CardException {
        if(questions != null && questions.size() == 6){
            this.questions = questions;
            for(Question q : questions){
                q.setQuestionCard(this);
            }
        }else{
            throw new CardException();
        }
    }

    /**
     * Setter on the field answers.
     * Check if the parameter is not null and that it contain exactly 6 answers
     * @param answers the list of six elements
     * @throws CardException if the parameter does not respect the specification
     */
    public void setAnswers(List<Answer> answers) throws CardException {
        if(answers != null && answers.size() == 6){
            this.answers = answers;
            for(Answer a : answers){
                a.setAnswerCard(this);
            }
        }else{
            throw new CardException();
        }
    }


    /**
     * Get the question for the theme passed
     * @param theme the question theme
     * @return the question text
     * @throws CardException if there is no theme corresponding
     */
    public String getQuestion(Theme theme) throws CardException {
      for( Question q : questions){
          if(q.getTheme() == theme){
              return q.getQuestionText();
          }
      }
      throw new CardException();
    }

    /**
     * Add the question with it answer to the corresponding list of the card.
     * Set the questionCard and answerCard with this.
     * @param question the question to be added with it answer already defined
     * @throws CardException if question is null or already in the card or if there is no space left in the card
     */
    public void addQuestion(Question question) throws CardException {
        if(question != null && questions.size()<6 && !questions.contains(question) && !answers.contains(question.getAnswer())){
            questions.add(question);
            answers.add(question.getAnswer());
            question.setQuestionCard(this);
            question.getAnswer().setAnswerCard(this);
        }else{
            throw new CardException();
        }
    }

    /**
     * Add the answer with it question to the corresponding list of the card.
     * Set the answerCard and questionCard with this.
     * @param answer the answer to be added with it question already defined
     * @throws CardException if answer is null or already in the card or if there is no space left in the card
     */
    public void addAnswer(Answer answer) throws CardException {
        if(answer != null && answers.size()<6 && !answers.contains(answer) && !questions.contains(answer.getQuestion())){
            answers.add(answer);
            questions.add(answer.getQuestion());
            answer.setAnswerCard(this);
            answer.getQuestion().setQuestionCard(this);
        }else{
            throw new CardException();
        }
    }
}
