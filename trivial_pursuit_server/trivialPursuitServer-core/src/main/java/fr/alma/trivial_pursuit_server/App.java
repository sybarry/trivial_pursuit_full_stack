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

        Question q = new Question("Le petit Lu est-il fait avec du beurre salé", null, Theme.GEOGRAPHY);
        Question q2 = new Question("Dans quel pays habite Jessica Fletcher, le personnage de la série policière arabesque", null, Theme.ENTERTAINMENT);
        Question q3 = new Question("A qui devont nous les chiffres que nous utilisons : aux chinois, aux arabes ou aux égyptiens", null, Theme.HISTORY);
        Question q4 = new Question("Pour les trois mousquetaires, c'était un pour tous...", null, Theme.ARTS_LITERATURE);
        Question q5 = new Question("Quel est le gaz le plus abondant dans l'air", null, Theme.SCIENCE_NATURE);
        Question q6 = new Question("Quelle est d'une table de tennis de table", null, Theme.SPORTS_LEISURE);
        Answer a = new Answer("Oui", Theme.GEOGRAPHY);
        Answer a2 = new Answer("Aux états-unis", Theme.ENTERTAINMENT);
        Answer a3 = new Answer("Aux arabes", Theme.HISTORY);
        Answer a4 = new Answer("et tous pour un", Theme.ARTS_LITERATURE);
        Answer a5 = new Answer("L'azote", Theme.SCIENCE_NATURE);
        Answer a6 = new Answer("2,74 mètres", Theme.SPORTS_LEISURE);

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
