package com.sakila.server.config;

import javax.sql.DataSource;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.io.File;

@Configuration
@EnableTransactionManagement
public class DatabaseConfig {

    @Bean
    public DataSource dataSource() {
        String dbPath;
        File dbFile = new File("sakila.db"); // 현재 작업 디렉토리에서 찾기
        
        if (dbFile.exists()) {
            dbPath = dbFile.getAbsolutePath();
        } else {
            // 프로젝트 루트 디렉토리에서 파일 찾기
            dbPath = "sakila.db";
        }
        
        return DataSourceBuilder.create()
                .url("jdbc:sqlite:" + dbPath)
                .driverClassName("org.sqlite.JDBC")
                .build();
    }
}
