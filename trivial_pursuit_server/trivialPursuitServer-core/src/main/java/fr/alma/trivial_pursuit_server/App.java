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

        Question q = new Question("Qu'est-ce qui est obligatoire sur la route depuis 1973 et, en ville, depuis 1984 ?", null, Theme.GEOGRAPHY);
        Question q2 = new Question("Qui était la fiancé de Tarzan?", null, Theme.ENTERTAINMENT);
        Question q3 = new Question("Qu'a introduit Jean Nicot en France?", null, Theme.HISTORY);
        Question q4 = new Question("Quelle commune voit son calme troublé par les expériences du Comte ami de Spirou et Fantasio ?", null, Theme.ARTS_LITERATURE);
        Question q5 = new Question("De quel insecte l'asticot est-il la larve ?", null, Theme.SCIENCE_NATURE);
        Question q6 = new Question("Avec quoi joue-t-on au 421 ?", null, Theme.SPORTS_LEISURE);
        Answer a = new Answer("Le port de la ceinture de securité", Theme.GEOGRAPHY);
        Answer a2 = new Answer("Jane", Theme.ENTERTAINMENT);
        Answer a3 = new Answer("Le tabac", Theme.HISTORY);
        Answer a4 = new Answer("Champignac", Theme.ARTS_LITERATURE);
        Answer a5 = new Answer("De la mouche", Theme.SCIENCE_NATURE);
        Answer a6 = new Answer("Avec des dés", Theme.SPORTS_LEISURE);

        //Constructeur avec question pour answer
        Question qa = new Question("Qu'est-ce qui est obligatoire sur la route depuis 1973 et, en ville, depuis 1984 ?", null, Theme.GEOGRAPHY);
        Answer aa = new Answer("Le port de la ceinture de securité", Theme.GEOGRAPHY, qa);
        qa.setAnswer(aa);

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
