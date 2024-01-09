package fr.alma.trivial_pursuit_server.core.game;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.alma.trivial_pursuit_server.core.card.Card;
import fr.alma.trivial_pursuit_server.core.cases.Case;
import fr.alma.trivial_pursuit_server.core.cases.HeadQuarter;
import fr.alma.trivial_pursuit_server.core.cases.SimpleCase;
import fr.alma.trivial_pursuit_server.core.player.Player;
import fr.alma.trivial_pursuit_server.exception.BoardException;
import fr.alma.trivial_pursuit_server.util.Color;
import fr.alma.trivial_pursuit_server.util.Constant;
import fr.alma.trivial_pursuit_server.util.Theme;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.io.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class BoardFactory {

    private static final String HEADQUARTER = "headquarter";

    /**
     * Static method for auto create a correct Board.
     * It creates all the board cases, the initialCase and get the cards from a repository.
     * @param playerList playerList field of Board
     * @return a Board correctly set. Ready to be use for a game
     * @throws BoardException if the board is not correctly design within the method.
     */
    public static Board createBoard(List<Player> playerList) throws BoardException, IOException {
        List<Case> casesList = buildCases();
        List<Card> cardsList = getCardsFromJson("src/main/java/fr/alma/trivial_pursuit_server/util/cards.json");
        Case initialCase = new Case("initialCase", null, Arrays.asList("case1", "case6", "case11", "case16", "case21", "case26"));

        return new Board(cardsList, casesList, initialCase, playerList);
    }

//    /**
//     * Static method for add a card object to json file stocking them.
//     * For future retrieve in a card repository and for auto creating of board.
//     * @param card card to be stocked
//     * @throws BoardException if a problem occur during stocking
//     */
//    public static void addCardToJsonFile(Card card) throws BoardException {
//        Path path = Paths.get("trivialPursuitServer-core/src/main/java/fr/alma/trivial_pursuit_server/util/cards.json");
//        ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
//
//        try(FileReader ff = new FileReader(path.toString())){
//            BufferedReader bufferedReader = new BufferedReader(ff);
//            StringBuilder bbb = new StringBuilder();
//            if (ff.read() == -1) {
//                bbb.append("[");
//            } else {
//                bbb.append("[");
//                String line;
//                String temp;
//                while ((line = bufferedReader.readLine()) != null) {
//                    temp = line;
//                    temp = temp.replace("}]", "},");
//                    bbb.append(temp).append("\n");
//                }
//            }
//            try (FileWriter fff = new FileWriter(path.toString(), false)) {
//                BufferedWriter bufferedWriter = new BufferedWriter(fff);
//                bbb.append(ow.writeValueAsString(card)).append("]");
//                bufferedWriter.write(bbb.toString());
//                bufferedWriter.close();
//            }
//        }catch (Exception e){
//            throw new BoardException("add to the json doesn't work : \n"+e.getMessage());
//        }
//    }

    /**
     * Retrieves a list of 400 Cards randomly from json file who store cards.
     * @return List of 400 Cards
     * @throws IOException if deserialization goes wrong.
     */
    public static List<Card> getCardsFromJson(String path) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        List<Card> jacksonList = objectMapper.readValue(new File(path), new TypeReference<List<Card>>(){});
        List<Card> result = new ArrayList<>();
        Random random = new Random(1);

        for(int i = 0; i< Constant.BOARD_CARD_LIST_SIZE_IN_JSON; i++){
            Card card = jacksonList.get(random.nextInt(jacksonList.size()));
            result.add(card);
            jacksonList.remove(card);
        }
        return result;
    }

    /**
     * Build 72 Cases made for game.
     * It fulfills specification of a board cases.
     * @return List of 72 Cases
     */
    public static List<Case> buildCases() {
        List<Case> result = new ArrayList<>();
        Theme[] themes = {Theme.GEOGRAPHY, Theme.HISTORY, Theme.ARTS_LITERATURE, Theme.ENTERTAINMENT, Theme.SCIENCE_NATURE, Theme.SPORTS_LEISURE};
        Color[] colors = {Color.BLUE, Color.YELLOW, Color.PINK, Color.PURPLE, Color.GREEN, Color.ORANGE};

        //HeadQuarters setup
        for(int i=0; i<6;i++){
            int constCaseNumber = 30;
            if(i==0){
                constCaseNumber = Constant.BOARD_CASE_LIST_NB_SIMPLE_CASE_INSTANCE;
            }
            result.add(new HeadQuarter(HEADQUARTER+(i+1),colors[i],Arrays.asList("case"+((i+1)*5), "case"+(constCaseNumber+(i*6)), "case"+(30+(i*6)+1)),themes[i]));
        }

        //SimpleCase setup for transversales branches
        themes = new Theme[]{Theme.SPORTS_LEISURE, Theme.GEOGRAPHY, Theme.ENTERTAINMENT, Theme.ARTS_LITERATURE, Theme.SCIENCE_NATURE, Theme.HISTORY};
        colors = new Color[]{Color.ORANGE, Color.BLUE, Color.PURPLE, Color.PINK, Color.GREEN, Color.YELLOW};

        for(int i=0; i<30;i++){
            switch (i%5){
                case 0:
                    result.add(new SimpleCase("case"+(i+1),colors[i%6],Arrays.asList("initialCase", "case"+(i+2)),themes[i%6]));
                    break;
                case 4:
                    result.add(new SimpleCase("case"+(i+1),colors[i%6],Arrays.asList(HEADQUARTER+((i/5)+1), "case"+(i)),themes[i%6]));
                    break;
                default:
                    result.add(new SimpleCase("case"+(i+1),colors[i%6],Arrays.asList("case"+(i), "case"+(i+2)),themes[i%6]));
                    break;
            }
        }

        //SimpleCase setup for exterior circle
        themes = new Theme[]{Theme.SCIENCE_NATURE, Theme.HISTORY, Theme.SPORTS_LEISURE, Theme.GEOGRAPHY, Theme.ENTERTAINMENT, Theme.ARTS_LITERATURE};
        colors = new Color[]{Color.GREEN, Color.YELLOW, Color.ORANGE, Color.BLUE, Color.PURPLE, Color.PINK};

        for(int i=30; i<Constant.BOARD_CASE_LIST_NB_SIMPLE_CASE_INSTANCE;i++){
            int indiceThemeAndColor = (i-((i-30)/6))%6;
            switch (i%6){
                case 0:
                    result.add(new SimpleCase("case"+(i+1),colors[indiceThemeAndColor],Arrays.asList(HEADQUARTER+((((i-30)/6)+1)%6), "case"+(i+2)),themes[indiceThemeAndColor]));
                    break;
                case 5:
                    result.add(new SimpleCase("case"+(i+1),colors[indiceThemeAndColor],Arrays.asList(HEADQUARTER+((((i-30)/6)+2)%6), "case"+(i)),themes[indiceThemeAndColor]));
                    break;
                default:
                    result.add(new SimpleCase("case"+(i+1),colors[indiceThemeAndColor],Arrays.asList("case"+(i), "case"+(i+2)),themes[indiceThemeAndColor]));
                    break;
            }
        }
        return result;
    }
}

