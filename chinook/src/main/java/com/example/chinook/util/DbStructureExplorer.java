package com.example.chinook.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class DbStructureExplorer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        System.out.println("=== 테이블 목록 ===");
        List<Map<String, Object>> tables = jdbcTemplate.queryForList(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
        
        tables.forEach(table -> {
            String tableName = (String) table.get("name");
            System.out.println("\n=== 테이블: " + tableName + " ===");
            
            // 테이블 스키마 출력
            List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                "PRAGMA table_info(" + tableName + ")");
            
            System.out.println("컬럼 정보:");
            columns.forEach(column -> {
                System.out.println("  " + column.get("name") + " (" + 
                                  column.get("type") + ")" + 
                                  (Integer.valueOf(1).equals(column.get("pk")) ? " PRIMARY KEY" : ""));
            });
            
            // 레코드 수 출력
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM " + tableName, Integer.class);
            System.out.println("레코드 수: " + count);
        });
    }
}
