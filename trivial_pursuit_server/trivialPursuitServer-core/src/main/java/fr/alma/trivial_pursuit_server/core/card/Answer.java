package fr.alma.trivial_pursuit_server.core.card;

import jakarta.persistence.*;

@Entity
@Table(name = "ANSWER")
public class Answer {

    private int id;
    private String answerText;
    private Question question;

    private Card cards;

    public Answer(String answer, Question question) {
        this.answerText = answer;
        this.question = question;
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
    public Card getCards() {
        return cards;
    }

    public void setCards(Card cards) {
        this.cards = cards;
    }
    @Id
    @GeneratedValue
    @Column(name = "id")
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Answer(){}
}
