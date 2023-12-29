package fr.alma.trivial_pursuit_server.core.card;

import fr.alma.trivial_pursuit_server.exception.CardException;
import fr.alma.trivial_pursuit_server.util.Theme;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "CARD")
public class Card {

    private Long id;
    private List<Question> questions;
    private List<Answer> answers;
    private Boolean isPicked;


    public Card() {
    }

    public Card(Long id, List<Question> questions, List<Answer> answers) throws CardException {
        this.id = id;
        setQuestions(questions);
        setAnswers(answers);
        this.isPicked = false;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setQuestions(List<Question> questions) throws CardException {
        if(questions.size() == 6){
            this.questions = questions;
        }else{
            throw new CardException();
        }
    }

    public void setAnswers(List<Answer> answers) throws CardException {
        if(answers.size() == 6){
            this.answers = answers;
        }else{
            throw new CardException();
        }
    }

    @Id
    @GeneratedValue()
    public Long getId() {
        return id;
    }

    @OneToMany(mappedBy = "cardQuestion", cascade = CascadeType.PERSIST)
    public List<Question> getQuestions() {
        return questions;
    }

    @OneToMany(mappedBy = "cardAnswer", cascade = CascadeType.PERSIST)
    public List<Answer> getAnswers() {
        return answers;
    }

    public String getQuestion(Theme theme) throws CardException {
      for( Question q : questions){
          if(q.getTheme() == theme){
              return q.getQuestionText();
          }
      }
      throw new CardException();
    }

    public Boolean getPicked() {
        return isPicked;
    }

    public void setPicked(Boolean picked) {
        isPicked = picked;
    }
}
