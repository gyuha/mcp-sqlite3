package com.sakila.server.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI myOpenAPI() {
        Server localServer = new Server()
                .url("http://localhost:8080")
                .description("로컬 서버");

        Contact contact = new Contact()
                .name("Sakila API Team");

        License mitLicense = new License()
                .name("MIT License")
                .url("https://opensource.org/licenses/MIT");

        Info info = new Info()
                .title("Sakila 영화 대여점 API")
                .version("1.0")
                .contact(contact)
                .description("Sakila 영화 대여점 데이터베이스 API 문서")
                .license(mitLicense);

        return new OpenAPI()
                .info(info)
                .servers(List.of(localServer));
    }
}
