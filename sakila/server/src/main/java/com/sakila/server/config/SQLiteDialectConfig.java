package com.sakila.server.config;

import org.hibernate.dialect.Dialect;
import org.hibernate.dialect.identity.IdentityColumnSupport;
import org.hibernate.dialect.identity.IdentityColumnSupportImpl;
import org.hibernate.community.dialect.SQLiteDialect;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SQLiteDialectConfig {

    @Bean
    public SQLiteDialect sqliteDialect() {
        return new SQLiteDialect() {
            @Override
            public IdentityColumnSupport getIdentityColumnSupport() {
                return new SQLiteIdentityColumnSupport();
            }
        };
    }
    
    public static class SQLiteIdentityColumnSupport extends IdentityColumnSupportImpl {
        @Override
        public boolean supportsIdentityColumns() {
            return true;
        }

        @Override
        public String getIdentitySelectString(String table, String column, int type) {
            return "select last_insert_rowid()";
        }

        @Override
        public String getIdentityColumnString(int type) {
            return "integer";
        }

        @Override
        public boolean supportsInsertSelectIdentity() {
            return false;
        }
    }
}
