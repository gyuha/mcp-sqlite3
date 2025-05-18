package com.example.chinook.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;
import java.nio.file.Paths;

@Configuration
public class SQLiteConfig {

    @Bean
    public DataSource dataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.sqlite.JDBC");
        
        // Sqlite 데이터베이스 파일 경로를 지정합니다.
        // 현재 작업 디렉토리의 chinook.db 파일을 사용합니다.
        String dbPath = Paths.get("chinook.db").toAbsolutePath().toString();
        dataSource.setUrl("jdbc:sqlite:" + dbPath);
        
        return dataSource;
    }
}