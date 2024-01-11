package fr.alma.trivial_pursuit_server.core.card;

import com.fasterxml.jackson.annotation.JsonBackReference;
import fr.alma.trivial_pursuit_server.util.Theme;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Objects;

@Entity
@Table(name = "QUESTION")
@NoArgsConstructor
@Getter
@Setter
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "EMP_SEQ")
    @Column(name = "question_id")
    private Long id;
    private String questionText;
    @Embedded
    private Answer answer;
    @Column(name = "question_theme")
    private Theme theme;
    @ManyToOne
    @JsonBackReference(value = "questionCard")
    private Card questionCard;

    /**
     * Constructor of a Question.
     * Set questionCard field to null
     * @param questionText questionText field
     * @param answer answer field
     * @param theme theme field
     */
    public Question(String questionText, Answer answer, Theme theme){
        this.questionText = questionText;
        this.answer = answer;
        this.theme = theme;
        this.questionCard = null;
    }

    /**
     * Analyse if the answer given is the same as the field answer in this question object
     * @param answer answer to be checked
     * @return true if that's the case, false otherwise
     */
    public boolean analyseAnswer(String answer) {
        //TODO upgrade the way to validate an answer
        return Objects.equals(this.answer.getAnswerText(), answer);
    }
}
