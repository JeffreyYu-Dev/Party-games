package DTO.maps;


import java.util.ArrayList;
import java.util.List;

/**
 * DTO for all maps
 */
public class Maps {
    private List<Map> maps;

    public Map getMap(String name) {
        return this.maps.stream().filter(map -> map.getName().equals(name)).findFirst().orElse(null);
    }

  
}
