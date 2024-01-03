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

        Question q = new Question("Dans quelle ville circule-t-on sur des gondoles ?", null, Theme.GEOGRAPHY);
        Question q2 = new Question("Quel bonhomme de neige qui ne fond jamais est héros des dessins animés ?", null, Theme.ENTERTAINMENT);
        Question q3 = new Question("Qu'était Bucéphale pour Alexandre le Grand?", null, Theme.HISTORY);
        Question q4 = new Question("De Rintintin, Flipper ou Skippy, qui a eu un oscar ?", null, Theme.ARTS_LITERATURE);
        Question q5 = new Question("Qu'étudient les sismologues ?", null, Theme.SCIENCE_NATURE);
        Question q6 = new Question("Quel maillot porte le vainqueur du Tour de France ?", null, Theme.SPORTS_LEISURE);
        Answer a = new Answer("Venise", Theme.GEOGRAPHY);
        Answer a2 = new Answer("Bouli", Theme.ENTERTAINMENT);
        Answer a3 = new Answer("Son cheval", Theme.HISTORY);
        Answer a4 = new Answer("Flipper", Theme.ARTS_LITERATURE);
        Answer a5 = new Answer("Les tremblements de terre", Theme.SCIENCE_NATURE);
        Answer a6 = new Answer("Le maillot jaune", Theme.SPORTS_LEISURE);

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
