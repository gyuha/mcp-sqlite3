package com.sakila.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.sakila.server.repository")
@EntityScan(basePackages = "com.sakila.server.model")
public class SakilaServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(SakilaServerApplication.class, args);
	}

}
