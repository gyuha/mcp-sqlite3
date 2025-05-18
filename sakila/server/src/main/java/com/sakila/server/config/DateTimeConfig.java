package com.sakila.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.data.jdbc.repository.config.AbstractJdbcConfiguration;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Configuration
public class DateTimeConfig extends AbstractJdbcConfiguration {

    @Override
    @Bean
    public List<Converter<?, ?>> jdbcConverters() {
        return Arrays.asList(
            new TimestampToLocalDateTimeConverter(),
            new LocalDateTimeToTimestampConverter()
        );
    }

    @ReadingConverter
    public static class TimestampToLocalDateTimeConverter implements Converter<Timestamp, LocalDateTime> {
        @Override
        public LocalDateTime convert(Timestamp source) {
            return source != null ? source.toLocalDateTime() : null;
        }
    }

    @WritingConverter
    public static class LocalDateTimeToTimestampConverter implements Converter<LocalDateTime, Timestamp> {
        @Override
        public Timestamp convert(LocalDateTime source) {
            return source != null ? Timestamp.valueOf(source) : null;
        }
    }
}
