package com.sakila.server.config;

import org.hibernate.dialect.identity.IdentityColumnSupport;
import org.hibernate.type.descriptor.sql.SqlTypeDescriptor;
import org.hibernate.type.descriptor.sql.internal.CapacityDependentTypeDescriptor;
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
            
            @Override
            protected SqlTypeDescriptor getSqlTypeDescriptorOverride(int sqlCode) {
                SqlTypeDescriptor descriptor = super.getSqlTypeDescriptorOverride(sqlCode);
                if (descriptor instanceof CapacityDependentTypeDescriptor) {
                    return descriptor;
                }
                return null;
            }
        };
    }
    
    public static class SQLiteIdentityColumnSupport implements IdentityColumnSupport {
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

        @Override
        public boolean isIdentityColumn(String primaryKey, String columnName) {
            return columnName != null && columnName.endsWith("_id");
        }
    }
}
