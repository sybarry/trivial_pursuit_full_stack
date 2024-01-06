package fr.alma.trivial_pursuit_server;

import fr.alma.trivial_pursuit_server.core.card.Answer;
import fr.alma.trivial_pursuit_server.core.card.Card;
import fr.alma.trivial_pursuit_server.core.card.Question;
import fr.alma.trivial_pursuit_server.core.game.BoardFactory;
import fr.alma.trivial_pursuit_server.exception.BoardException;
import fr.alma.trivial_pursuit_server.exception.CardException;
import fr.alma.trivial_pursuit_server.util.Theme;

import java.util.Arrays;

/**
 * Hello world!
 *
 */
public class App 
{
    public static void main( String[] args ) throws CardException, BoardException {
//        System.out.println( "Hello World!" );
        Card card = new Card();

        Question q = new Question("Quel est le dernier mot d'un message télégraphié en morse ?", null, Theme.GEOGRAPHY);
        Question q2 = new Question("De quel instrument jouait Ringo Starr avec les Beatles ?", null, Theme.ENTERTAINMENT);
        Question q3 = new Question("Quel pays européen a voté non au traité de Maastricht en 1992 ?", null, Theme.HISTORY);
        Question q4 = new Question("Quelle est la bien-aiméé de Popeye ?", null, Theme.ARTS_LITERATURE);
        Question q5 = new Question("Dans quel pays poussait le papyrus ?", null, Theme.SCIENCE_NATURE);
        Question q6 = new Question("Dans quel pays Alain Prost remporta-t-il sa première course en F1: France, Allemagne ou Italie ?", null, Theme.SPORTS_LEISURE);
        Answer a = new Answer("Stop", Theme.GEOGRAPHY);
        Answer a2 = new Answer("De la batterie", Theme.ENTERTAINMENT);
        Answer a3 = new Answer("Le Danemark", Theme.HISTORY);
        Answer a4 = new Answer("Olive", Theme.ARTS_LITERATURE);
        Answer a5 = new Answer("L'Egypte", Theme.SCIENCE_NATURE);
        Answer a6 = new Answer("En France", Theme.SPORTS_LEISURE);

        q.setAnswer(a);
        q2.setAnswer(a2);
        q3.setAnswer(a3);
        q4.setAnswer(a4);
        q5.setAnswer(a5);
        q6.setAnswer(a6);

        card.setQuestions(Arrays.asList(q,q2,q3,q4,q5,q6));
        card.setAnswers(Arrays.asList(a,a2,a3,a4,a5,a6));

        BoardFactory.addCardToJsonFile(card);
    }
}
