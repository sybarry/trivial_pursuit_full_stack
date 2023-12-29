package fr.alma.trivial_pursuit_server.core.card;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "CARD")
public class Card {

    private int id;
    private List<Question> questions;
    private List<Answer> answers;

    public Card(int id, List<Question> questions, List<Answer> answers) {
        this.id = id;
        this.questions = questions;
        this.answers = answers;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
    }

    public void setAnswers(List<Answer> answers) {
        this.answers = answers;
    }

    @Id
    @GeneratedValue()
    public int getId() {
        return id;
    }
    @OneToMany(mappedBy = "card", cascade = CascadeType.PERSIST)
    public List<Question> getQuestions() {
        return questions;
    }
    @OneToMany(mappedBy = "cards", cascade = CascadeType.PERSIST)
    public List<Answer> getAnswers() {
        return answers;
    }

    public Card() { super();
    }
}
