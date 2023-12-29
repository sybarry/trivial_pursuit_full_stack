package fr.alma.trivial_pursuit_server.core.cases;

import fr.alma.trivial_pursuit_server.util.Color;
import fr.alma.trivial_pursuit_server.util.Theme;

import java.util.List;

public class HeadQuarter extends Case{

    private final Theme theme;
    public HeadQuarter(String name, Color color, List<String> neighbors, Theme theme) {
        super(name, color, neighbors);
        this.theme = theme;
    }

    public Theme getTheme(){
        return this.theme;
    }
}
