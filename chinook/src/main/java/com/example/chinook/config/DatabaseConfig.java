package com.example.chinook.config;

import org.hibernate.dialect.SQLiteDialect;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseConfig {

    @Bean
    public SQLiteDialect sqliteDialect() {
        return new SQLiteDialect();
    }
}