package fr.alma.trivial_pursuit_server.core.card;

import fr.alma.trivial_pursuit_server.util.Theme;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "QUESTION")
@NoArgsConstructor
@Getter
@Setter
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "EMP_SEQ")
    private Long id;
    private String questionText;
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "answer_id", referencedColumnName = "id")
    private Answer answer;
    private Theme theme;
    @ManyToOne
    private Card questionCard;


    public Question(String questionText, Answer answer, Theme theme){
        this.questionText = questionText;
        this.answer = answer;
        this.theme = theme;
        this.questionCard = null;
    }
}
