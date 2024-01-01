package fr.alma.trivial_pursuit_server.core.cases;

import fr.alma.trivial_pursuit_server.util.Color;
import fr.alma.trivial_pursuit_server.util.Theme;
import lombok.Getter;

import java.util.List;

@Getter
public class SimpleCase extends Case{

    private final Theme theme;

    /**
     * Constructor of a SimpleCase Case.
     * With the super constructor of Case.
     * @param name name field
     * @param color color field
     * @param neighbors neighbors field
     * @param theme theme field
     */
    public SimpleCase(String name, Color color, List<String> neighbors, Theme theme) {
        super(name, color, neighbors);
        this.theme = theme;
    }

    /**
     * Constructor of a SimpleCase Case.
     * With the super constructor of Case.
     * Neighbors is set to null.
     * @param name name field
     * @param color color field
     * @param theme theme field
     */
    public SimpleCase(String name, Color color, Theme theme) {
        super(name, color, null);
        this.theme = theme;
    }
}
