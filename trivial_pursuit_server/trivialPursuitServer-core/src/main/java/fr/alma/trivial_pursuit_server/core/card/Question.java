package fr.alma.trivial_pursuit_server.core.card;

import fr.alma.trivial_pursuit_server.util.Theme;
import jakarta.persistence.*;

@Entity
@Table(name = "QUESTION")
public class Question {

    private Long id;
    private String questionText;
    private Answer answer;
    private Theme theme;
    private Card cardQuestion;


    public Question() {
    }

    public Question(String questionText, Answer answer, Theme theme, Card card){
        this.questionText = questionText;
        this.answer = answer;
        this.cardQuestion = card;
        this.theme = theme;
    }

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "answer_id", referencedColumnName = "id")
    public Answer getAnswer() {
        return answer;
    }

    public void setAnswer(Answer answer) {
        this.answer = answer;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getQuestionText() {
        return questionText;
    }
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "EMP_SEQ")
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @ManyToOne
    public Card getCardQuestion() {
        return cardQuestion;
    }

    public void setCardQuestion(Card cardQuestion) {
        this.cardQuestion = cardQuestion;
    }

    public Theme getTheme() {
        return theme;
    }

    public void setTheme(Theme theme) {
        this.theme = theme;
    }
}
