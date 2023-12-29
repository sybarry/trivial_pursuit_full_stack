package fr.alma.trivial_pursuit_server.core.cases;

import fr.alma.trivial_pursuit_server.util.Color;

public abstract class Case {

    private final String name;
    private final Color color;

    protected Case(String name, Color color) {
        this.name = name;
        this.color = color;
    }

    protected String getName() {
        return this.name;
    }

    protected Color getColor(){
        return this.color;
    }
}
