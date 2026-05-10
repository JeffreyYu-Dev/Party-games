package services;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import io.javalin.Javalin;
import io.javalin.json.JavalinGson;

public class HttpServer {

    public HttpServer() {

        Gson gson = new GsonBuilder().serializeNulls().create();
        
        Javalin app = Javalin.create(config -> {
            config.jsonMapper(new JavalinGson(gson, true));
        }).start(8080);


    }
}
