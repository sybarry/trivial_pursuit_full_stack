package fr.alma.trivial_pursuit_server.core.cases;

import fr.alma.trivial_pursuit_server.util.Color;
import fr.alma.trivial_pursuit_server.util.Theme;

public class SimpleCase extends Case{

    private final Theme theme;
    public SimpleCase(String name, Color color, Theme theme) {
        super(name, color);
        this.theme = theme;
    }

    public Theme getTheme(){
        return this.theme;
    }
}
