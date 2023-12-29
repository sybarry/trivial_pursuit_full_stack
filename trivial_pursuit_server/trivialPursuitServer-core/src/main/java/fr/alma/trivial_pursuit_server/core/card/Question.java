package fr.alma.trivial_pursuit_server.core.card;

import jakarta.persistence.*;

@Entity
@Table(name = "QUESTION")
public class Question {

    private int id;

    private String questionText;
    private Answer answer;

    private Card card;

    public Question(String questionText, Answer answer){
        this.questionText = questionText;
        this.answer = answer;
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

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "EMP_SEQ")
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getQuestionText() {
        return questionText;
    }

    @ManyToOne
    public Card getCard() {
        return card;
    }

    public void setCard(Card card) {
        this.card = card;
    }

    public Question() {
    }
}
