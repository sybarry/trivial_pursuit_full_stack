package fr.alma.trivial_pursuit_server.core.card;

import fr.alma.trivial_pursuit_server.exception.CardException;
import fr.alma.trivial_pursuit_server.kind.ICard;
import fr.alma.trivial_pursuit_server.util.Constant;
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
public class Card implements ICard {

    @Id
    @GeneratedValue
    private Long id;
    @OneToMany(mappedBy = "questionCard", cascade = CascadeType.ALL)
    private List<Question> questions = new ArrayList<>();
    @ElementCollection
    private List<Answer> answers = new ArrayList<>();
    private Boolean isPicked = false;



    /**
     * Constructor of a Card.
     * Set isPicked to false.
     * @param questions questions field
     * @param answers answers field
     * @throws CardException if the parameter are incorrectly build
     */
    public Card(List<Question> questions, List<Answer> answers) throws CardException {
        setQuestions(questions);
        setAnswers(answers);
    }

    /**
     * Setter on the field questions.
     * Check if the parameter is not null and that it contain exactly 6 questions.
     * Also set the questionCard field for each question of the list.
     * @param questions the list of six elements
     * @throws CardException if the parameter does not respect the specification
     */
    public void setQuestions(List<Question> questions) throws CardException {
        if(questions != null && questions.size() == Constant.CARD_NB_QUESTIONS){
            this.questions = questions;
            for(Question q : questions){
                q.setQuestionCard(this);
            }
        }else{
            throw new CardException("questions can't be set because it size doesn't match or it's null");
        }
    }

    /**
     * Setter on the field answers.
     * Check if the parameter is not null and that it contain exactly 6 answers.
     * Set the question with the new answer in the order of the parameter list
     * @param answers the list of six elements
     * @throws CardException if the parameter does not respect the specification
     */
    public void setAnswers(List<Answer> answers) throws CardException {
        if(answers != null && answers.size() == Constant.CARD_NB_ANSWERS){
            this.answers = answers;
            int i=0;
            for(Question q : questions){
                q.setAnswer(this.answers.get(i++));
            }
        }else{
            throw new CardException("answers can't be set because it size doesn't match or it's null");
        }
    }

    /**
     * Get the question for the theme passed
     * @param theme the question theme
     * @return the question text
     * @throws CardException if there is no theme corresponding
     */
    public String getQuestionText(Theme theme) throws CardException {
      for( Question q : questions){
          if(q.getTheme() == theme){
              return q.getQuestionText();
          }
      }
      throw new CardException("question text don't exist for the theme send");
    }

    /**
     * Add the question with it answer to the corresponding list of the card.
     * Set the questionCard and answerCard with this.
     * @param question the question to be added with it answer already defined
     * @throws CardException if question is null or already in the card or if there is no space left in the card
     */
    public void addQuestion(Question question) throws CardException {
        if(question != null
                && questions.size()<=Constant.CARD_NB_QUESTIONS-1
                && !questions.contains(question)
                && !answers.contains(question.getAnswer())
                && question.getAnswer()!=null
                && themeNotPickedYet(question.getTheme())
        ){
            questions.add(question);
            answers.add(question.getAnswer());
            question.setQuestionCard(this);
        }else{
            throw new CardException("question can't be added because already exist or no space left or it's null or not build well or question theme already pick");
        }
    }

    /**
     * Check if a theme already exist in the question list
     * @param theme theme to be checked
     * @return true if that's the case, false otherwise
     */
    private boolean themeNotPickedYet(Theme theme) {
        if(theme == null){
            return false;
        }
        for(Question q : questions){
            if(q.getTheme() == theme){
                return false;
            }
        }
        return true;
    }
}
