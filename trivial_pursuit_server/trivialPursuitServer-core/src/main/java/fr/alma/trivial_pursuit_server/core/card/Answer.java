package fr.alma.trivial_pursuit_server.core.card;

import fr.alma.trivial_pursuit_server.util.Theme;
import jakarta.persistence.*;

@Entity
@Table(name = "ANSWER")
public class Answer {

    private Long id;
    private String answerText;
    private Question question;
    private Card cardAnswer;
    private Theme theme;


    public Answer(){

    }

    public Answer(String answer, Question question, Theme theme, Card card) {
        this.answerText = answer;
        this.question = question;
        this.theme = theme;
        this.cardAnswer = card;
    }

    @OneToOne(mappedBy = "answer")
    public Question getQuestion() {
        return question;
    }

    public void setQuestion(Question question) {
        this.question = question;
    }

    public void setAnswerText(String answerText) {
        this.answerText = answerText;
    }

    public String getAnswerText() {
        return answerText;
    }

    @ManyToOne
    public Card getCardAnswer() {
        return cardAnswer;
    }

    public void setCardAnswer(Card cardAnswer) {
        this.cardAnswer = cardAnswer;
    }
    @Id
    @GeneratedValue
    @Column(name = "id")
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Theme getTheme() {
        return theme;
    }

    public void setTheme(Theme theme) {
        this.theme = theme;
    }

}
