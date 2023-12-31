package fr.alma.trivial_pursuit_server.core.card;

import fr.alma.trivial_pursuit_server.util.Theme;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@NoArgsConstructor
@Getter
@Setter
public class Answer {

    private String answerText;
    @Column(name = "answer_theme")
    private Theme theme;


    /**
     * Constructor of an Answer.
     * @param answer answerText field
     * @param theme theme field
     */
    public Answer(String answer, Theme theme) {
        this.answerText = answer;
        this.theme = theme;
    }

}
