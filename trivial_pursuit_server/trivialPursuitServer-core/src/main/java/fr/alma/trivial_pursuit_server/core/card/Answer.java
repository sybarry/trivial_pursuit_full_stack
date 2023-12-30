package fr.alma.trivial_pursuit_server.core.card;

import fr.alma.trivial_pursuit_server.util.Theme;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ANSWER")
@NoArgsConstructor
@Getter
@Setter
public class Answer {

    @Id
    @GeneratedValue
    @Column(name = "id")
    private Long id;
    private String answerText;
    @OneToOne(mappedBy = "answer")
    private Question question;
    @ManyToOne
    private Card answerCard;
    private Theme theme;


    public Answer(String answer, Question question, Theme theme) {
        this.answerText = answer;
        this.question = question;
        this.theme = theme;
        this.answerCard = null;
    }

}
